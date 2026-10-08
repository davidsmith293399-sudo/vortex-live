# Vortex WebRTC Full-Stack Voice, Video & 60 FPS Game Streaming Engine

A complete, production-grade WebRTC and Socket.io communication platform designed for **1-on-1 audio/video calls, 4–8 multi-user group rooms, high-performance screen sharing, and a dedicated 60 FPS gaming live-stream theater mode**.

---

## 🌟 Features Implemented

1. **1-on-1 & Multi-User Group Calling (4–8 Users)**:
   - Multi-peer WebRTC mesh architecture with deterministic signaling.
   - Low-latency crystal-clear Opus audio with Voice Activity Detection (VAD).
   - Real-time animated speaking indicator waveforms & glowing tiles.
   - Participant spotlight / pinning mode.

2. **Dedicated Gaming & Live Streaming Mode**:
   - **60 FPS @ 1080p Ultra** game stream capture with raw system audio pass-through (bypassing speech noise suppression to keep game sound effects and music crisp).
   - Theater layout with central stream stage, stream telemetry HUD (FPS, resolution, bitrate, RTT latency, packet loss).
   - Interactive viewer emoji barrage with floating reactions (🔥, 🎮, 🚀, ❤️, 👏, 💀) and canvas particle bursts.
   - Spectator webcam thumbnail strip docked below the stream.

3. **High-Performance Screen Sharing**:
   - Integrated `navigator.mediaDevices.getDisplayMedia` with system audio support.
   - Fast track replacement (`replaceTrack`) across all active peer connections without expensive renegotiation delays.
   - Quality presets: **Eco 5 FPS Slides**, **Standard 30 FPS Apps**, **Gaming 60 FPS**.

4. **Real-Time Signaling & In-Room Chat**:
   - Socket.io room management with reconnection handling and exponential backoff.
   - WebRTC SDP offer/answer exchange with queued ICE candidate buffering.
   - Discord/Twitch style live chat drawer with timestamps and quick emojis.

5. **Audio/Video Hardware & Quality Settings**:
   - Hardware selector for Microphones, Cameras, and Speakers.
   - Live microphone test gauge.
   - Dynamic resolution tier switching (360p Data Saver, 720p HD, 1080p FHD, 60 FPS Game Stream).

---

## 🏗️ Architecture Overview

```
┌────────────────────────────────────────────────────────┐
│                      Client App                        │
│            (React + Tailwind CSS + Lucide)             │
│                                                        │
│  [Lobby] ───► [Room]                                   │
│                 ├── [GamingStreamStage] (60 FPS Mode)  │
│                 ├── [VideoGrid]         (Mesh Lounges) │
│                 ├── [LiveChatDrawer]    (Real-Time)    │
│                 ├── [CallControlsBar]   (Dock)         │
│                 └── [DeviceSettings]    (Audio/Video)  │
└───────────────▲───────────────────────▲────────────────┘
                │                       │
      WebRTC Media Tracks       Socket.io Signaling
    (Audio, Video, Screen)     (Offer, Answer, ICE, Chat)
                │                       │
                ▼                       ▼
    ┌───────────────────────┐  ┌─────────────────────────┐
    │  P2P Mesh / SFU Media │  │  Node.js Signaling Hub  │
    │  (Direct / STUN/TURN) │  │  (Express + Socket.io)  │
    │  Google STUN Pool     │  │  Port 5001               │
    └───────────────────────┘  └─────────────────────────┘
```

---

## 📁 Project Directory Structure

```
.
├── server/
│   ├── index.js                     # Express + Socket.io Signaling Engine
│   └── package.json                 # Server dependencies (express, socket.io, cors)
├── web/
│   ├── index.html                   # Web application entry & typography
│   ├── vite.config.js               # Vite bundler configuration & proxy
│   ├── tailwind.config.js           # Cyberpunk dark theme palette & animations
│   ├── postcss.config.js            # PostCSS configuration
│   ├── package.json                 # Web dependencies (react 19, tailwind, lucide)
│   └── src/
│       ├── main.jsx                 # React root mount
│       ├── App.jsx                  # Lobby/Room router & URL invite handler
│       ├── index.css                # Custom glassmorphism, glowing rings & styles
│       ├── constants/
│       │   └── webrtc.js            # STUN servers, audio DSP, resolution presets
│       ├── hooks/
│       │   ├── useSocket.js         # Socket.io connection & auto-reconnect
│       │   ├── useWebRTC.js         # Full mesh peer connection engine & track swap
│       │   ├── useAudioLevel.js     # Web Audio API VAD & volume meter
│       │   └── useMediaDevices.js   # Hardware enumeration & switching
│       └── components/
│           ├── Lobby.jsx            # Pre-call hardware preview & room selector
│           ├── Room.jsx             # Main room orchestrator
│           ├── VideoGrid.jsx        # Adaptive multi-user grid & spotlight
│           ├── VideoTile.jsx        # Video player, speaking indicator & avatars
│           ├── GamingStreamStage.jsx# 60 FPS Gaming theater & viewer reactions
│           ├── CallControlsBar.jsx  # Bottom dock with media toggles
│           ├── LiveChatDrawer.jsx   # In-room text messaging
│           └── DeviceSettingsModal.jsx # Hardware & bitrate tier selector
└── scripts/
    └── start-all.js                 # Concurrent dev runner script
```

---

## 🚀 Quick Start Guide

### 1. Run Both Servers Concurrently
From the root directory:
```bash
npm run fullstack
```
This boots:
- **Signaling Server**: `http://localhost:5001` (Health check: `/api/health`)
- **Web Application**: `http://localhost:3000`

### 2. Or Run Individually
**Terminal 1 (Backend Server):**
```bash
npm run server:start
```

**Terminal 2 (Web Client):**
```bash
npm run web:dev
```

### 3. Invite Friends
1. Open `http://localhost:3000` in your browser.
2. Enter your display name and click **Connect to Room**.
3. Open a second browser window (or Incognito tab) at `http://localhost:3000?room=hangout-hq&name=Player2`.
4. Both peers will instantly discover each other, negotiate WebRTC peer connections, and begin streaming HD audio/video.

---

## 🎮 How to Use 60 FPS Gaming Mode

1. In an active call, click the purple **GO LIVE (60 FPS)** button in the bottom dock.
2. Enter the title of your game (e.g. *Valorant*, *Forza Horizon*, *Cyberpunk*).
3. The browser will prompt for window/screen capture:
   - Select the game window or full monitor.
   - Check **"Also share system audio"** so friends can hear pristine game audio.
4. The room layout automatically switches to the **Theater Stage**:
   - Game broadcast renders in full 60 FPS center stage.
   - Live telemetry shows **1080p | 60 FPS | ~6.0 Mbps | Sub-30ms Latency**.
   - Spectators can click floating reactions (🔥, 🎮, 🚀, ❤️, 👏, 💀) to send interactive confetti bursts.

---

## 📡 Socket.io Signaling Protocol Specification

| Event Name | Direction | Payload | Description |
|---|---|---|---|
| `room:join` | Client -> Server | `{ roomId, user: { id, name, isAudioMuted, isVideoOff } }` | Join or create room |
| `room:joined` | Server -> Client | `{ roomId, self, existingPeers, activeStreamer }` | Confirmation with peer list |
| `room:user-joined`| Server -> Client | `{ user }` | Broadcast new participant to room |
| `signal:offer` | Client <-> Server | `{ targetSocketId, sdp }` | Forward WebRTC SDP offer |
| `signal:answer` | Client <-> Server | `{ targetSocketId, sdp }` | Forward WebRTC SDP answer |
| `signal:ice-candidate` | Client <-> Server | `{ targetSocketId, candidate }` | Exchange ICE candidates |
| `state:media-toggle` | Client -> Server | `{ roomId, type: 'audio'\|'video', enabled }` | Sync mic/cam status |
| `stream:start` | Client -> Server | `{ roomId, streamInfo: { title, gameTitle, fps, resolution } }` | Broadcast live stream start |
| `stream:stop` | Client -> Server | `{ roomId }` | End live stream broadcast |
| `stream:reaction` | Client -> Server | `{ roomId, emoji }` | Interactive viewer reaction burst |
| `chat:send` | Client -> Server | `{ roomId, text }` | Send in-room chat message |
| `room:user-left` | Server -> Client | `{ socketId, user }` | Participant disconnected |

---

## 🌐 Production Deployment & STUN / TURN Configuration

### Why TURN is Required in Production
WebRTC peer-to-peer mesh establishes direct UDP connections using public STUN servers (e.g., Google STUN). However, **symmetric NATs, firewalls, and 4G/5G mobile carriers block direct peer connections** in ~15-20% of network topologies. 

To ensure 100% connectivity anywhere in the world, configure a **TURN relay server** (using open-source `coturn` or a cloud provider like Twilio / Metered).

### 1. Adding TURN Credentials to [webrtc.js](file:///c:/Users/akikh/Downloads/NICE/web/src/constants/webrtc.js)
```javascript
export const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun.cloudflare.com:3478' },
    {
      urls: 'turn:turn.yourdomain.com:3478?transport=udp',
      username: process.env.VITE_TURN_USERNAME || 'turnuser',
      credential: process.env.VITE_TURN_PASSWORD || 'secretturnpassword',
    },
    {
      urls: 'turn:turn.yourdomain.com:3478?transport=tcp',
      username: process.env.VITE_TURN_USERNAME || 'turnuser',
      credential: process.env.VITE_TURN_PASSWORD || 'secretturnpassword',
    }
  ],
  iceCandidatePoolSize: 10,
};
```

### 2. HTTPS / SSL Requirement
Browsers strictly forbid `navigator.mediaDevices.getUserMedia` and `navigator.mediaDevices.getDisplayMedia` on insecure origins (`http://`). 
In production, you **MUST serve over HTTPS** (via Cloudflare, Let's Encrypt, Caddy, Nginx, or hosting platforms like Vercel/Render).

---

## ⚡ Scaling Beyond 8 Users: SFU Architecture (Mediasoup / LiveKit)

### When to switch from Mesh to SFU:
- **Full Mesh (Current Implementation)**:
  - Each user uploads $N - 1$ streams and downloads $N - 1$ streams.
  - Ideal for **1-on-1 up to 6–8 participants** (zero extra server media bandwidth cost, true peer-to-peer privacy).
- **SFU (Selective Forwarding Unit)**:
  - Each user uploads **1** stream to the central media server; the server forwards tracks to all other peers.
  - Scales effortlessly to **50–100+ participants** in a single room.

### Mediasoup Server Integration Recipe:
```javascript
// server/sfu.js
const mediasoup = require('mediasoup');

// 1. Create Media Worker
const worker = await mediasoup.createWorker({
  rtcMinPort: 40000,
  rtcMaxPort: 49999,
});

// 2. Create Media Router per room
const router = await worker.createRouter({ mediaCodecs });

// 3. Create WebRtcTransport for sending & receiving
const transport = await router.createWebRtcTransport({
  listenIps: [{ ip: '0.0.0.0', announcedIp: 'YOUR_SERVER_PUBLIC_IP' }],
  enableUdp: true,
  enableTcp: true,
  preferUdp: true,
});

// 4. Produce stream from streamer & Consume in viewers
const producer = await transport.produce({ kind, rtpParameters });
const consumer = await recvTransport.consume({ producerId: producer.id, rtpCapabilities });
```
