const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Allow Cross-Origin for React / Next.js clients
app.use(cors({ origin: '*' }));
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// In-Memory Room and Participant State Registry
// Structure:
// rooms[roomId] = {
//   id: roomId,
//   name: string,
//   activeStreamer: { socketId, userId, name, title, gameTitle, fps, resolution, mode } | null,
//   participants: {
//     [socketId]: { socketId, userId, name, avatar, isAudioMuted, isVideoOff, isScreenSharing, isStreamingGame, joinedAt }
//   },
//   messages: []
// }
const rooms = new Map();

// Helper to get or create room
function getOrCreateRoom(roomId, roomName = null) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      id: roomId,
      name: roomName || `Room ${roomId}`,
      activeStreamer: null,
      participants: new Map(),
      createdAt: Date.now()
    });
  }
  return rooms.get(roomId);
}

// REST Health Check & Diagnostics Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    activeRooms: rooms.size,
    totalConnections: io.engine.clientsCount,
    timestamp: new Date().toISOString()
  });
});

// REST API to get room info
app.get('/api/rooms/:roomId', (req, res) => {
  const { roomId } = req.params;
  const room = rooms.get(roomId);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const participantsList = Array.from(room.participants.values());
  res.json({
    roomId: room.id,
    name: room.name,
    participantCount: participantsList.length,
    activeStreamer: room.activeStreamer,
    participants: participantsList
  });
});

// Socket.io Signaling Engine
io.on('connection', (socket) => {
  console.log(`[Socket Connected] ID: ${socket.id}`);

  let currentRoomId = null;
  let currentUser = null;

  // 1. Join Room
  socket.on('room:join', ({ roomId, user }) => {
    if (!roomId || !user) {
      return socket.emit('error', { message: 'Invalid roomId or user data' });
    }

    currentRoomId = roomId;
    currentUser = {
      socketId: socket.id,
      userId: user.id || `usr_${socket.id.substring(0, 6)}`,
      name: user.name || 'Anonymous Peer',
      avatar: user.avatar || null,
      isAudioMuted: Boolean(user.isAudioMuted),
      isVideoOff: Boolean(user.isVideoOff),
      isScreenSharing: false,
      isStreamingGame: false,
      joinedAt: Date.now()
    };

    const room = getOrCreateRoom(roomId, user.roomName);
    
    // Add participant
    room.participants.set(socket.id, currentUser);
    socket.join(roomId);

    console.log(`[Room Join] User "${currentUser.name}" (${socket.id}) joined room "${roomId}". Room count: ${room.participants.size}`);

    // Collect other existing peers
    const existingPeers = [];
    room.participants.forEach((peer, peerSocketId) => {
      if (peerSocketId !== socket.id) {
        existingPeers.push(peer);
      }
    });

    // Send existing peers and current room state to newly joined user
    socket.emit('room:joined', {
      roomId,
      roomName: room.name,
      self: currentUser,
      existingPeers,
      activeStreamer: room.activeStreamer
    });

    // Notify other peers in room that new user joined
    socket.to(roomId).emit('room:user-joined', {
      user: currentUser
    });
  });

  // 2. WebRTC Signaling: Offer
  socket.on('signal:offer', ({ targetSocketId, sdp }) => {
    console.log(`[WebRTC Offer] From ${socket.id} to ${targetSocketId}`);
    io.to(targetSocketId).emit('signal:offer', {
      callerSocketId: socket.id,
      sdp
    });
  });

  // 3. WebRTC Signaling: Answer
  socket.on('signal:answer', ({ targetSocketId, sdp }) => {
    console.log(`[WebRTC Answer] From ${socket.id} to ${targetSocketId}`);
    io.to(targetSocketId).emit('signal:answer', {
      responderSocketId: socket.id,
      sdp
    });
  });

  // 4. WebRTC Signaling: ICE Candidate
  socket.on('signal:ice-candidate', ({ targetSocketId, candidate }) => {
    io.to(targetSocketId).emit('signal:ice-candidate', {
      senderSocketId: socket.id,
      candidate
    });
  });

  // 5. Renegotiation Request (e.g., when adding screen share or high-res video stream)
  socket.on('signal:renegotiate-request', ({ targetSocketId }) => {
    io.to(targetSocketId).emit('signal:renegotiate-request', {
      callerSocketId: socket.id
    });
  });

  // 6. Media Toggles (Mute, Video Off, Deafened)
  socket.on('state:media-toggle', ({ roomId, type, enabled, meta }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const participant = room.participants.get(socket.id);
    if (participant) {
      if (type === 'audio') participant.isAudioMuted = !enabled;
      if (type === 'video') participant.isVideoOff = !enabled;
      if (type === 'screenshare') participant.isScreenSharing = enabled;
      if (type === 'gaming') participant.isStreamingGame = enabled;

      // Broadcast state update to everyone in room including sender
      io.in(roomId).emit('state:peer-media-updated', {
        socketId: socket.id,
        type,
        enabled,
        meta,
        participant
      });
    }
  });

  // 7. Gaming & Live Streaming Mode: Start Stream
  socket.on('stream:start', ({ roomId, streamInfo }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const participant = room.participants.get(socket.id);
    const streamerData = {
      socketId: socket.id,
      userId: participant ? participant.userId : socket.id,
      name: participant ? participant.name : 'Streamer',
      title: streamInfo.title || 'Live Game Broadcast',
      gameTitle: streamInfo.gameTitle || 'Live Gameplay',
      resolution: streamInfo.resolution || '1080p',
      fps: streamInfo.fps || 60,
      bitrate: streamInfo.bitrate || '6000 Kbps',
      mode: streamInfo.mode || 'gaming', // 'gaming' | 'screenshare'
      startedAt: Date.now()
    };

    room.activeStreamer = streamerData;
    if (participant) {
      participant.isStreamingGame = true;
      participant.isScreenSharing = true;
    }

    console.log(`[Stream Started] ${streamerData.name} started ${streamerData.mode} stream in room ${roomId}: "${streamerData.gameTitle}"`);

    // Broadcast stream started event to all participants
    io.in(roomId).emit('stream:started', streamerData);
  });

  // 8. Gaming & Live Streaming Mode: Stop Stream
  socket.on('stream:stop', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    if (room.activeStreamer && room.activeStreamer.socketId === socket.id) {
      console.log(`[Stream Stopped] Stream ended in room ${roomId}`);
      room.activeStreamer = null;

      const participant = room.participants.get(socket.id);
      if (participant) {
        participant.isStreamingGame = false;
        participant.isScreenSharing = false;
      }

      io.in(roomId).emit('stream:stopped', { socketId: socket.id });
    }
  });

  // 9. Real-Time Telemetry / Stream Quality Update (FPS, bitrate, stats)
  socket.on('stream:telemetry', ({ roomId, stats }) => {
    socket.to(roomId).emit('stream:telemetry-update', {
      streamerSocketId: socket.id,
      stats
    });
  });

  // 10. Live Chat Message
  socket.on('chat:send', ({ roomId, text }) => {
    if (!roomId || !text || !text.trim()) return;

    const room = rooms.get(roomId);
    if (!room) return;

    const participant = room.participants.get(socket.id);
    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      socketId: socket.id,
      senderName: participant ? participant.name : 'Anonymous',
      senderAvatar: participant ? participant.avatar : null,
      text: text.trim(),
      timestamp: Date.now()
    };

    io.in(roomId).emit('chat:message', message);
  });

  // 11. Interactive Stream Reaction (Fireworks, Floating Emojis: 🔥, ❤️, 🎮, 🚀, 👏)
  socket.on('stream:reaction', ({ roomId, emoji }) => {
    if (!roomId || !emoji) return;

    const room = rooms.get(roomId);
    if (!room) return;

    const participant = room.participants.get(socket.id);
    const reaction = {
      id: `rx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      socketId: socket.id,
      senderName: participant ? participant.name : 'A viewer',
      emoji,
      timestamp: Date.now()
    };

    io.in(roomId).emit('stream:reaction', reaction);
  });

  // 12. Speaking / Voice Activity State Sync (for audio indicator ring)
  socket.on('audio:speaking', ({ roomId, isSpeaking }) => {
    if (!roomId) return;
    socket.to(roomId).emit('audio:peer-speaking', {
      socketId: socket.id,
      isSpeaking
    });
  });

  // 13. Room Leave
  socket.on('room:leave', () => {
    handleUserLeave();
  });

  // 14. Socket Disconnect
  socket.on('disconnect', () => {
    console.log(`[Socket Disconnected] ID: ${socket.id}`);
    handleUserLeave();
  });

  function handleUserLeave() {
    if (!currentRoomId) return;

    const room = rooms.get(currentRoomId);
    if (!room) return;

    const participant = room.participants.get(socket.id);
    room.participants.delete(socket.id);

    // If this user was active streamer, stop the stream
    if (room.activeStreamer && room.activeStreamer.socketId === socket.id) {
      room.activeStreamer = null;
      io.in(currentRoomId).emit('stream:stopped', { socketId: socket.id });
    }

    // Notify room of departure
    socket.to(currentRoomId).emit('room:user-left', {
      socketId: socket.id,
      user: participant
    });

    console.log(`[Room Leave] User left ${currentRoomId}. Remaining: ${room.participants.size}`);

    // Cleanup empty room if no participants left after 30 seconds
    if (room.participants.size === 0) {
      setTimeout(() => {
        const checkRoom = rooms.get(currentRoomId);
        if (checkRoom && checkRoom.participants.size === 0) {
          rooms.delete(currentRoomId);
          console.log(`[Room Cleaned] Deleted inactive room: ${currentRoomId}`);
        }
      }, 30000);
    }

    socket.leave(currentRoomId);
    currentRoomId = null;
    currentUser = null;
  }
});

// Serve static Web Client if built
const path = require('path');
const fs = require('fs');
const distPath = path.join(__dirname, '../web/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
  console.log(`[Static Web] Serving web build from ${distPath}`);
}

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 WebRTC & Socket.io Signaling Server Running on Port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});
