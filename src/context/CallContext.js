import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_SERVERS, CURRENT_USER, MOCK_PARTICIPANTS } from '../constants/mockData';
import { useBandwidth } from './BandwidthContext';
import { playJoinSound, playLeaveSound, playToggleSound } from '../utils/soundEffects';

const CallContext = createContext();

export const CallProvider = ({ children }) => {
  const { setIsInCall, resetCallStats, activeTierId, selectTier } = useBandwidth();

  const [servers, setServers] = useState(MOCK_SERVERS);
  const [activeServerId, setActiveServerId] = useState('srv_vortex_hq');
  const [activeChannelId, setActiveChannelId] = useState('ch_general');

  // Active call state
  const [activeCall, setActiveCall] = useState(null);

  // Local media controls
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);

  // Room participants
  const [participants, setParticipants] = useState([]);

  // In-call Toast notification for joins/leaves
  const [callToast, setCallToast] = useState(null);

  const showToast = (message, type = 'join') => {
    setCallToast({ id: Date.now(), message, type });
    setTimeout(() => {
      setCallToast(null);
    }, 3500);
  };

  // Active server & channel resolution
  const currentServer = servers.find(s => s.id === activeServerId) || servers[0];
  const currentChannel = currentServer.channels.find(c => c.id === activeChannelId) || currentServer.channels[0];

  // Helper to start or join a call
  const joinCall = (channel) => {
    // Play futuristic ascending join chime
    playJoinSound();

    if (channel.defaultResolution) {
      selectTier(channel.defaultResolution);
    } else if (channel.type === 'voice') {
      selectTier('audio_only');
    }

    const newCall = {
      channelId: channel.id,
      channelName: channel.name,
      serverId: currentServer.id,
      serverName: currentServer.name,
      type: channel.type,
      startedAt: Date.now(),
    };

    setActiveCall(newCall);
    setIsInCall(true);
    resetCallStats();

    // Populate room participants
    const initialPeers = (channel.activeParticipants || []).map(pId => MOCK_PARTICIPANTS[pId] || {
      id: pId,
      name: 'Guest User',
      avatarColor: '#888',
      isSpeaking: false,
      isMuted: false,
      isVideoOn: channel.type !== 'voice',
      currentTier: activeTierId,
    });

    const me = {
      id: CURRENT_USER.id,
      name: `${CURRENT_USER.username} (You)`,
      avatarColor: CURRENT_USER.avatarBg,
      isSpeaking: false,
      isMuted: isMuted,
      isVideoOn: channel.type !== 'voice' ? isVideoEnabled : false,
      currentTier: activeTierId,
      isMe: true,
    };

    setParticipants([me, ...initialPeers]);
    showToast(`You joined ${channel.name}`, 'join');
  };

  // Leave active call
  const leaveCall = () => {
    // Play mellow descending leave chime
    playLeaveSound();

    setActiveCall(null);
    setIsInCall(false);
    setIsScreenSharing(false);
    resetCallStats();
    showToast('You disconnected from the lounge', 'leave');
  };

  // Simulate another user joining
  const simulatePeerJoin = () => {
    const newGuest = {
      id: `usr_guest_${Date.now()}`,
      name: 'Elena Rostova',
      avatarColor: '#E056FD',
      isSpeaking: false,
      isMuted: false,
      isVideoOn: true,
      networkQuality: 'Good (4G LTE)',
      currentTier: '360p',
      pingMs: 38,
    };
    playJoinSound();
    setParticipants(prev => [...prev, newGuest]);
    showToast('Elena Rostova connected to the room', 'join');
  };

  // Simulate another user leaving
  const simulatePeerLeave = () => {
    if (participants.length <= 1) return;
    const peerToRemove = participants[participants.length - 1];
    if (peerToRemove.isMe) return;

    playLeaveSound();
    setParticipants(prev => prev.slice(0, prev.length - 1));
    showToast(`${peerToRemove.name} left the room`, 'leave');
  };

  // Media toggles
  const toggleMute = () => {
    setIsMuted(prev => {
      const next = !prev;
      playToggleSound(next);
      setParticipants(pList => pList.map(p => p.isMe ? { ...p, isMuted: next } : p));
      return next;
    });
  };

  const toggleDeafen = () => {
    setIsDeafened(prev => {
      const next = !prev;
      playToggleSound(next);
      if (next) setIsMuted(true);
      return next;
    });
  };

  const toggleVideo = () => {
    setIsVideoEnabled(prev => {
      const next = !prev;
      setParticipants(list => list.map(p => p.isMe ? { ...p, videoOn: next } : p));
      return next;
    });
  };

  const toggleCameraFlip = () => {
    setIsFrontCamera(prev => !prev);
  };

  const toggleScreenShare = (overrideState) => {
    const nextState = typeof overrideState === 'boolean' ? overrideState : !isScreenSharing;
    setIsScreenSharing(nextState);
    if (nextState) {
      setIsVideoEnabled(true);
    }
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(prev => !prev);
  };

  // Simulate subtle participant voice activity
  useEffect(() => {
    if (!activeCall) return;
    const interval = setInterval(() => {
      setParticipants(prev =>
        prev.map(p => {
          if (p.isMuted) return { ...p, isSpeaking: false };
          return {
            ...p,
            isSpeaking: Math.random() > 0.6,
          };
        })
      );
    }, 2500);
    return () => clearInterval(interval);
  }, [activeCall]);

  return (
    <CallContext.Provider
      value={{
        servers,
        setServers,
        activeServerId,
        setActiveServerId,
        activeChannelId,
        setActiveChannelId,
        currentServer,
        currentChannel,
        activeCall,
        joinCall,
        leaveCall,
        simulatePeerJoin,
        simulatePeerLeave,
        callToast,
        isMuted,
        toggleMute,
        isDeafened,
        toggleDeafen,
        isVideoEnabled,
        toggleVideo,
        isFrontCamera,
        toggleCameraFlip,
        isScreenSharing,
        toggleScreenShare,
        isSpeakerOn,
        toggleSpeaker,
        participants,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => useContext(CallContext);
