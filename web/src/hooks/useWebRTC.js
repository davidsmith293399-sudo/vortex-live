import { useState, useEffect, useRef, useCallback } from 'react';
import { ICE_SERVERS, DEFAULT_AUDIO_CONSTRAINTS, RESOLUTION_PRESETS } from '../constants/webrtc';

/**
 * Robust Multi-Peer WebRTC Engine (1-on-1 & N-Way Group Mesh)
 * Manages RTCPeerConnections, ICE candidates queueing, renegotiation,
 * screen share track replacement, and local media streams.
 */
export function useWebRTC({ socket, roomId, currentUser }) {
  // Local media state
  const [localStream, setLocalStream] = useState(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [resolutionTier, setResolutionTier] = useState('720p');
  const [mediaError, setMediaError] = useState(null);

  // Screen share & gaming state
  const [screenStream, setScreenStream] = useState(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isStreamingGame, setIsStreamingGame] = useState(false);

  // Remote peers and streams map: { [socketId]: { socketId, user, stream, connectionState, iceState } }
  const [remotePeers, setRemotePeers] = useState({});

  // Active streamer in the room (if someone is game streaming / screen sharing)
  const [activeStreamer, setActiveStreamer] = useState(null);

  // Internal references
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const originalVideoTrackRef = useRef(null);
  const originalAudioTrackRef = useRef(null);
  const peersRef = useRef({}); // { [socketId]: { pc, senders: {}, pendingCandidates: [], user: {} } }
  const isAudioMutedRef = useRef(false);
  const isVideoOffRef = useRef(false);

  // Sync refs
  useEffect(() => {
    isAudioMutedRef.current = isAudioMuted;
  }, [isAudioMuted]);

  useEffect(() => {
    isVideoOffRef.current = isVideoOff;
  }, [isVideoOff]);

  /**
   * Initialize Local Audio & Video Stream
   */
  const initLocalMedia = useCallback(async (audioDeviceId = null, videoDeviceId = null, tier = '720p') => {
    try {
      setMediaError(null);
      const resConfig = RESOLUTION_PRESETS[tier] || RESOLUTION_PRESETS['720p'];

      const audioConstraints = {
        ...DEFAULT_AUDIO_CONSTRAINTS,
        ...(audioDeviceId ? { deviceId: { exact: audioDeviceId } } : {}),
      };

      const videoConstraints = {
        width: resConfig.width,
        height: resConfig.height,
        frameRate: resConfig.frameRate,
        ...(videoDeviceId ? { deviceId: { exact: videoDeviceId } } : {}),
      };

      console.log('[WebRTC] Requesting local media stream with constraints:', { audio: audioConstraints, video: videoConstraints });
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: audioConstraints,
        video: videoConstraints,
      });

      // Preserve track states
      if (isAudioMutedRef.current) {
        stream.getAudioTracks().forEach(t => { t.enabled = false; });
      }
      if (isVideoOffRef.current) {
        stream.getVideoTracks().forEach(t => { t.enabled = false; });
      }

      localStreamRef.current = stream;
      if (stream.getVideoTracks().length > 0) {
        originalVideoTrackRef.current = stream.getVideoTracks()[0];
      }
      if (stream.getAudioTracks().length > 0) {
        originalAudioTrackRef.current = stream.getAudioTracks()[0];
      }

      setLocalStream(stream);
      return stream;
    } catch (err) {
      console.error('[WebRTC] Failed to access local media:', err);
      let errorMsg = 'Could not access camera or microphone.';
      if (err.name === 'NotAllowedError') {
        errorMsg = 'Permission denied. Please allow microphone and camera access in your browser settings.';
      } else if (err.name === 'NotFoundError') {
        errorMsg = 'No camera or microphone device found.';
      } else if (err.name === 'NotReadableError') {
        errorMsg = 'Media device is currently in use by another program.';
      }
      setMediaError(errorMsg);
      return null;
    }
  }, []);

  /**
   * Helper: Create Peer Connection for a remote user
   */
  const createPeerConnection = useCallback((remoteSocketId, remoteUser) => {
    if (peersRef.current[remoteSocketId]) {
      console.log(`[WebRTC] Peer connection for ${remoteSocketId} already exists, returning it.`);
      return peersRef.current[remoteSocketId].pc;
    }

    console.log(`[WebRTC] Creating new RTCPeerConnection for ${remoteSocketId} (${remoteUser?.name || 'Peer'})`);
    const pc = new RTCPeerConnection(ICE_SERVERS);
    const peerData = {
      pc,
      senders: {},
      pendingCandidates: [],
      user: remoteUser || { socketId: remoteSocketId, name: 'Peer' },
    };
    peersRef.current[remoteSocketId] = peerData;

    // Attach local tracks if available
    const activeStream = localStreamRef.current;
    if (activeStream) {
      activeStream.getTracks().forEach((track) => {
        const sender = pc.addTrack(track, activeStream);
        peerData.senders[track.kind] = sender;
      });
    }

    // ICE Candidate Generation
    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('signal:ice-candidate', {
          targetSocketId: remoteSocketId,
          candidate: event.candidate,
        });
      }
    };

    // Connection State Listeners
    pc.onconnectionstatechange = () => {
      console.log(`[WebRTC PC State] ${remoteSocketId}: ${pc.connectionState}`);
      setRemotePeers((prev) => {
        if (!prev[remoteSocketId]) return prev;
        return {
          ...prev,
          [remoteSocketId]: {
            ...prev[remoteSocketId],
            connectionState: pc.connectionState,
          },
        };
      });

      if (pc.connectionState === 'failed') {
        console.warn(`[WebRTC PC Failed] Attempting ICE restart for ${remoteSocketId}`);
        pc.restartIce();
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log(`[WebRTC ICE State] ${remoteSocketId}: ${pc.iceConnectionState}`);
      setRemotePeers((prev) => {
        if (!prev[remoteSocketId]) return prev;
        return {
          ...prev,
          [remoteSocketId]: {
            ...prev[remoteSocketId],
            iceState: pc.iceConnectionState,
          },
        };
      });
    };

    // Remote Track Handling
    pc.ontrack = (event) => {
      console.log(`[WebRTC ontrack] Received remote ${event.track.kind} track from ${remoteSocketId}`);
      const remoteMediaStream = event.streams[0] || new MediaStream([event.track]);

      setRemotePeers((prev) => ({
        ...prev,
        [remoteSocketId]: {
          socketId: remoteSocketId,
          user: peerData.user,
          stream: remoteMediaStream,
          connectionState: pc.connectionState,
          iceState: pc.iceConnectionState,
          isAudioMuted: Boolean(peerData.user?.isAudioMuted),
          isVideoOff: Boolean(peerData.user?.isVideoOff),
          isScreenSharing: Boolean(peerData.user?.isScreenSharing),
          isStreamingGame: Boolean(peerData.user?.isStreamingGame),
        },
      }));
    };

    return pc;
  }, [socket]);

  /**
   * Helper: Initiate WebRTC Offer to a peer
   */
  const initiateOffer = useCallback(async (remoteSocketId, remoteUser) => {
    try {
      const pc = createPeerConnection(remoteSocketId, remoteUser);
      console.log(`[WebRTC Offer] Creating offer for ${remoteSocketId}...`);

      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });

      await pc.setLocalDescription(offer);

      if (socket) {
        socket.emit('signal:offer', {
          targetSocketId: remoteSocketId,
          sdp: pc.localDescription,
        });
      }
    } catch (err) {
      console.error(`[WebRTC Offer Error] Failed to create offer for ${remoteSocketId}:`, err);
    }
  }, [createPeerConnection, socket]);

  /**
   * Handle Incoming Offer
   */
  const handleReceiveOffer = useCallback(async ({ callerSocketId, sdp }) => {
    try {
      console.log(`[WebRTC Offer] Received offer from ${callerSocketId}`);
      const pc = createPeerConnection(callerSocketId, peersRef.current[callerSocketId]?.user);

      await pc.setRemoteDescription(new RTCSessionDescription(sdp));

      // Process any queued ICE candidates that arrived before remote description
      const peerData = peersRef.current[callerSocketId];
      if (peerData && peerData.pendingCandidates.length > 0) {
        console.log(`[WebRTC ICE] Flushing ${peerData.pendingCandidates.length} queued ICE candidates for ${callerSocketId}`);
        for (const candidate of peerData.pendingCandidates) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
        peerData.pendingCandidates = [];
      }

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      if (socket) {
        socket.emit('signal:answer', {
          targetSocketId: callerSocketId,
          sdp: pc.localDescription,
        });
      }
    } catch (err) {
      console.error(`[WebRTC Answer Error] Failed to handle offer from ${callerSocketId}:`, err);
    }
  }, [createPeerConnection, socket]);

  /**
   * Handle Incoming Answer
   */
  const handleReceiveAnswer = useCallback(async ({ responderSocketId, sdp }) => {
    try {
      console.log(`[WebRTC Answer] Received answer from ${responderSocketId}`);
      const peerData = peersRef.current[responderSocketId];
      if (!peerData || !peerData.pc) {
        console.warn(`[WebRTC Answer] No peer connection found for ${responderSocketId}`);
        return;
      }

      const pc = peerData.pc;
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));

      // Flush queued candidates
      if (peerData.pendingCandidates.length > 0) {
        console.log(`[WebRTC ICE] Flushing ${peerData.pendingCandidates.length} queued candidates after answer for ${responderSocketId}`);
        for (const candidate of peerData.pendingCandidates) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
        peerData.pendingCandidates = [];
      }
    } catch (err) {
      console.error(`[WebRTC Answer Error] Failed to set remote description from ${responderSocketId}:`, err);
    }
  }, []);

  /**
   * Handle Incoming ICE Candidate
   */
  const handleReceiveIceCandidate = useCallback(async ({ senderSocketId, candidate }) => {
    try {
      const peerData = peersRef.current[senderSocketId];
      if (!peerData || !peerData.pc) {
        return;
      }

      const pc = peerData.pc;
      if (pc.remoteDescription && pc.remoteDescription.type) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } else {
        // Queue until remote description is set
        peerData.pendingCandidates.push(candidate);
      }
    } catch (err) {
      console.warn(`[WebRTC ICE Candidate Error] for ${senderSocketId}:`, err);
    }
  }, []);

  /**
   * Handle User Left
   */
  const handlePeerLeft = useCallback((remoteSocketId) => {
    console.log(`[WebRTC Peer Left] Cleaning up peer ${remoteSocketId}`);
    const peerData = peersRef.current[remoteSocketId];
    if (peerData && peerData.pc) {
      peerData.pc.close();
    }
    delete peersRef.current[remoteSocketId];

    setRemotePeers((prev) => {
      const next = { ...prev };
      delete next[remoteSocketId];
      return next;
    });
  }, []);

  /**
   * Socket.io Event Bindings for Signaling
   */
  useEffect(() => {
    if (!socket) return;

    // 1. Initial Room Join Response: Connect to all existing peers
    const onRoomJoined = ({ roomId: joinedRoomId, existingPeers, activeStreamer: streamer }) => {
      console.log(`[WebRTC] Successfully joined room "${joinedRoomId}". Found ${existingPeers.length} existing peers.`);
      if (streamer) setActiveStreamer(streamer);

      // Existing peers: Newcomer creates offers to all existing peers
      existingPeers.forEach((peer) => {
        initiateOffer(peer.socketId, peer);
      });
    };

    // 2. Someone else joined after us
    const onUserJoined = ({ user }) => {
      console.log(`[WebRTC] Peer joined room: ${user.name} (${user.socketId})`);
      // We store user info; the newly joined user will send us an offer
      peersRef.current[user.socketId] = {
        pc: null,
        senders: {},
        pendingCandidates: [],
        user,
      };
      setRemotePeers(prev => ({
        ...prev,
        [user.socketId]: {
          socketId: user.socketId,
          user,
          stream: null,
          connectionState: 'connecting',
          iceState: 'new',
          isAudioMuted: Boolean(user.isAudioMuted),
          isVideoOff: Boolean(user.isVideoOff),
          isScreenSharing: false,
          isStreamingGame: false,
        }
      }));
    };

    // 3. User Left
    const onUserLeft = ({ socketId }) => {
      handlePeerLeft(socketId);
    };

    // 4. Remote Peer Media Toggle Updated
    const onPeerMediaUpdated = ({ socketId, type, enabled, participant }) => {
      setRemotePeers(prev => {
        const current = prev[socketId];
        if (!current) return prev;
        return {
          ...prev,
          [socketId]: {
            ...current,
            user: participant || current.user,
            isAudioMuted: type === 'audio' ? !enabled : current.isAudioMuted,
            isVideoOff: type === 'video' ? !enabled : current.isVideoOff,
            isScreenSharing: type === 'screenshare' ? enabled : current.isScreenSharing,
            isStreamingGame: type === 'gaming' ? enabled : current.isStreamingGame,
          }
        };
      });
    };

    // 5. Active Stream Started / Stopped
    const onStreamStarted = (streamerData) => {
      console.log('[WebRTC] Stream started by:', streamerData);
      setActiveStreamer(streamerData);
    };

    const onStreamStopped = () => {
      console.log('[WebRTC] Active stream stopped');
      setActiveStreamer(null);
    };

    socket.on('room:joined', onRoomJoined);
    socket.on('room:user-joined', onUserJoined);
    socket.on('room:user-left', onUserLeft);
    socket.on('signal:offer', handleReceiveOffer);
    socket.on('signal:answer', handleReceiveAnswer);
    socket.on('signal:ice-candidate', handleReceiveIceCandidate);
    socket.on('state:peer-media-updated', onPeerMediaUpdated);
    socket.on('stream:started', onStreamStarted);
    socket.on('stream:stopped', onStreamStopped);

    return () => {
      socket.off('room:joined', onRoomJoined);
      socket.off('room:user-joined', onUserJoined);
      socket.off('room:user-left', onUserLeft);
      socket.off('signal:offer', handleReceiveOffer);
      socket.off('signal:answer', handleReceiveAnswer);
      socket.off('signal:ice-candidate', handleReceiveIceCandidate);
      socket.off('state:peer-media-updated', onPeerMediaUpdated);
      socket.off('stream:started', onStreamStarted);
      socket.off('stream:stopped', onStreamStopped);
    };
  }, [
    socket,
    initiateOffer,
    handleReceiveOffer,
    handleReceiveAnswer,
    handleReceiveIceCandidate,
    handlePeerLeft
  ]);

  /**
   * Toggle Local Microphone
   */
  const toggleAudio = useCallback(() => {
    if (!localStreamRef.current) return;
    const nextMuted = !isAudioMutedRef.current;
    localStreamRef.current.getAudioTracks().forEach((track) => {
      track.enabled = !nextMuted;
    });
    setIsAudioMuted(nextMuted);

    if (socket && roomId) {
      socket.emit('state:media-toggle', {
        roomId,
        type: 'audio',
        enabled: !nextMuted,
      });
    }
  }, [socket, roomId]);

  /**
   * Toggle Local Video / Webcam
   */
  const toggleVideo = useCallback(() => {
    if (!localStreamRef.current) return;
    const nextVideoOff = !isVideoOffRef.current;
    localStreamRef.current.getVideoTracks().forEach((track) => {
      track.enabled = !nextVideoOff;
    });
    setIsVideoOff(nextVideoOff);

    if (socket && roomId) {
      socket.emit('state:media-toggle', {
        roomId,
        type: 'video',
        enabled: !nextVideoOff,
      });
    }
  }, [socket, roomId]);

  /**
   * Start Screen Sharing or Gaming Broadcast
   * @param {Object} options - { mode: 'screenshare' | 'gaming', fps: 30 | 60, title: string, gameTitle: string }
   */
  const startScreenShare = useCallback(async (options = { mode: 'screenshare', fps: 30 }) => {
    try {
      const isGaming = options.mode === 'gaming';
      const frameRate = options.fps || (isGaming ? 60 : 30);

      const displayMediaOptions = {
        video: {
          cursor: 'always',
          displaySurface: isGaming ? 'monitor' : 'browser',
          frameRate: { ideal: frameRate, max: frameRate },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: isGaming ? {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: 48000,
        } : true,
      };

      console.log(`[ScreenShare] Launching getDisplayMedia for ${options.mode} at ${frameRate} FPS...`);
      const stream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
      screenStreamRef.current = stream;
      setScreenStream(stream);

      const screenVideoTrack = stream.getVideoTracks()[0];
      if (screenVideoTrack) {
        screenVideoTrack.contentHint = 'motion';

        // When user clicks the native browser "Stop sharing" button
        screenVideoTrack.onended = () => {
          console.log('[ScreenShare] Native stop sharing triggered');
          stopScreenShare();
        };

        // Hot-swap video track on all active peer connections
        Object.keys(peersRef.current).forEach((peerSocketId) => {
          const peerData = peersRef.current[peerSocketId];
          if (peerData && peerData.pc) {
            const senders = peerData.pc.getSenders();
            const videoSender = senders.find(s => s.track && s.track.kind === 'video');
            if (videoSender) {
              videoSender.replaceTrack(screenVideoTrack);
            }
          }
        });
      }

      setIsScreenSharing(true);
      setIsStreamingGame(isGaming);

      if (socket && roomId) {
        socket.emit('state:media-toggle', {
          roomId,
          type: isGaming ? 'gaming' : 'screenshare',
          enabled: true,
        });

        socket.emit('stream:start', {
          roomId,
          streamInfo: {
            title: options.title || (isGaming ? '60 FPS Live Game Broadcast' : 'Screen Share Presentation'),
            gameTitle: options.gameTitle || (isGaming ? 'Direct Gameplay Stream' : 'Shared Screen'),
            fps: frameRate,
            resolution: '1080p',
            bitrate: isGaming ? '6.0 Mbps' : '2.5 Mbps',
            mode: options.mode,
          }
        });
      }

      return stream;
    } catch (err) {
      console.warn('[ScreenShare] User cancelled or error:', err);
      return null;
    }
  }, [socket, roomId]);

  /**
   * Stop Screen Sharing and revert back to camera track
   */
  const stopScreenShare = useCallback(() => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
    setScreenStream(null);
    setIsScreenSharing(false);
    setIsStreamingGame(false);

    // Revert video sender back to webcam track
    const camTrack = originalVideoTrackRef.current;
    if (camTrack) {
      Object.keys(peersRef.current).forEach((peerSocketId) => {
        const peerData = peersRef.current[peerSocketId];
        if (peerData && peerData.pc) {
          const senders = peerData.pc.getSenders();
          const videoSender = senders.find(s => s.track && s.track.kind === 'video');
          if (videoSender) {
            videoSender.replaceTrack(camTrack);
          }
        }
      });
    }

    if (socket && roomId) {
      socket.emit('state:media-toggle', {
        roomId,
        type: 'screenshare',
        enabled: false,
      });
      socket.emit('stream:stop', { roomId });
    }
  }, [socket, roomId]);

  /**
   * Change Resolution / Bandwidth Tier dynamically
   */
  const changeResolutionTier = useCallback(async (newTier) => {
    setResolutionTier(newTier);
    if (!localStreamRef.current) return;

    const preset = RESOLUTION_PRESETS[newTier];
    if (!preset) return;

    const videoTrack = localStreamRef.current.getVideoTracks()[0];
    if (videoTrack) {
      try {
        await videoTrack.applyConstraints({
          width: preset.width,
          height: preset.height,
          frameRate: preset.frameRate,
        });
        console.log(`[WebRTC] Applied constraints for resolution tier: ${preset.label}`);
      } catch (err) {
        console.warn('[WebRTC] applyConstraints error:', err);
      }
    }
  }, []);

  /**
   * Clean up all peer connections on unmount or room exit
   */
  const cleanup = useCallback(() => {
    console.log('[WebRTC] Cleaning up all connections and tracks');
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(t => t.stop());
      screenStreamRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }

    Object.keys(peersRef.current).forEach((peerSocketId) => {
      const peerData = peersRef.current[peerSocketId];
      if (peerData && peerData.pc) {
        peerData.pc.close();
      }
    });

    peersRef.current = {};
    setRemotePeers({});
    setLocalStream(null);
    setScreenStream(null);
    setIsScreenSharing(false);
    setIsStreamingGame(false);
  }, []);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    localStream,
    remotePeers,
    isAudioMuted,
    isVideoOff,
    isScreenSharing,
    isStreamingGame,
    screenStream,
    activeStreamer,
    resolutionTier,
    mediaError,
    initLocalMedia,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
    changeResolutionTier,
    cleanup,
  };
}
