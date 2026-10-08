import React, { useState, useEffect } from 'react';
import {
  Share2,
  Users,
  Copy,
  Check,
  Radio,
  Wifi,
  WifiOff,
  AlertCircle,
  Gamepad2,
  Sparkles,
} from 'lucide-react';
import { useSocket } from '../hooks/useSocket';
import { useWebRTC } from '../hooks/useWebRTC';
import { useMediaDevices } from '../hooks/useMediaDevices';
import { VideoGrid } from './VideoGrid';
import { GamingStreamStage } from './GamingStreamStage';
import { CallControlsBar } from './CallControlsBar';
import { LiveChatDrawer } from './LiveChatDrawer';
import { DeviceSettingsModal } from './DeviceSettingsModal';

export function Room({
  roomId,
  currentUser,
  onLeaveRoom,
}) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // 1. Signaling Socket Hook
  const {
    socket,
    isConnected: isSocketConnected,
    connectionStatus,
    emit,
  } = useSocket();

  // 2. Multi-Peer WebRTC Hook
  const {
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
  } = useWebRTC({
    socket,
    roomId,
    currentUser,
  });

  // 3. Hardware Devices Hook
  const {
    audioInputs,
    audioOutputs,
    videoInputs,
    selectedAudioInputId,
    setSelectedAudioInputId,
    selectedAudioOutputId,
    setSelectedAudioOutputId,
    selectedVideoInputId,
    setSelectedVideoInputId,
  } = useMediaDevices();

  // Initialize local media and join room once socket is connected
  useEffect(() => {
    let mounted = true;

    async function setupRoom() {
      if (!isSocketConnected || !socket) return;

      console.log(`[Room] Initializing media & joining room "${roomId}"`);
      await initLocalMedia(selectedAudioInputId, selectedVideoInputId, resolutionTier);

      // Join room through Socket.io signaling
      socket.emit('room:join', {
        roomId,
        user: {
          id: currentUser.id,
          name: currentUser.name,
          isAudioMuted: currentUser.isAudioMuted,
          isVideoOff: currentUser.isVideoOff,
        },
      });
    }

    setupRoom();

    return () => {
      mounted = false;
    };
  }, [isSocketConnected, socket, roomId, currentUser]);

  // Notifications for peer join/leaves
  useEffect(() => {
    if (!socket) return;

    const onUserJoined = ({ user }) => {
      setToastMessage(`${user.name} joined the lounge`);
      setTimeout(() => setToastMessage(null), 3500);
    };

    const onUserLeft = ({ user }) => {
      if (user) {
        setToastMessage(`${user.name} left the room`);
        setTimeout(() => setToastMessage(null), 3500);
      }
    };

    socket.on('room:user-joined', onUserJoined);
    socket.on('room:user-left', onUserLeft);

    return () => {
      socket.off('room:user-joined', onUserJoined);
      socket.off('room:user-left', onUserLeft);
    };
  }, [socket]);

  // Copy Room Link to Clipboard
  const handleCopyInvite = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleLeave = () => {
    if (socket) {
      socket.emit('room:leave');
    }
    cleanup();
    onLeaveRoom();
  };

  const remotePeerList = Object.values(remotePeers);
  const totalParticipantCount = 1 + remotePeerList.length;

  // Determine if Gaming/Live Stage mode is active
  // Either activeStreamer exists from server, or local user is streaming
  const isGamingActive = Boolean(activeStreamer || isStreamingGame);
  const streamerIsMe = activeStreamer?.socketId === socket?.id || isStreamingGame;
  const currentStreamSource = streamerIsMe
    ? screenStream
    : remotePeers[activeStreamer?.socketId]?.stream;

  return (
    <div className="flex flex-col h-screen w-screen bg-dark-950 text-slate-100 overflow-hidden font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-dark-900/90 text-white border border-brand-cyan/40 shadow-glow-cyan text-xs font-medium animate-bounce flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-cyan" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="h-14 bg-dark-900 border-b border-white/10 px-4 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-brand-cyan shadow-glow-cyan animate-pulse" />
            <h2 className="font-display font-bold text-white text-base tracking-wide">
              {roomId.toUpperCase()}
            </h2>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-dark-950 border border-white/10 text-xs text-slate-400">
            <Users className="w-3.5 h-3.5 text-brand-cyan" />
            <span>{totalParticipantCount} Online</span>
          </div>

          {isGamingActive && (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-purple/20 text-brand-purple border border-brand-purple/40 text-xs font-semibold">
              <Gamepad2 className="w-3.5 h-3.5 animate-pulse" />
              <span>THEATER MODE</span>
            </div>
          )}
        </div>

        {/* Right Bar: Connection Health & Invite Button */}
        <div className="flex items-center gap-3">
          {/* WebRTC & Socket Connection Status Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-dark-950 border border-white/10 text-xs font-mono">
            {isSocketConnected ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-brand-emerald" />
                <span className="text-slate-300 hidden md:inline">SIGNALING ONLINE</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-brand-rose" />
                <span className="text-brand-rose">{connectionStatus.toUpperCase()}</span>
              </>
            )}
          </div>

          {/* Copy Invite Link */}
          <button
            onClick={handleCopyInvite}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-dark-800 hover:bg-dark-700 text-slate-200 text-xs font-medium border border-white/10 transition-colors"
            title="Copy room link to invite friends"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-brand-emerald" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copiedLink ? 'Copied' : 'Invite'}</span>
          </button>
        </div>
      </header>

      {/* Media Device / Permission Error Banner */}
      {mediaError && (
        <div className="bg-brand-rose/20 border-b border-brand-rose/40 px-4 py-2 text-brand-rose text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{mediaError}</span>
          </div>
          <button
            onClick={() => initLocalMedia(selectedAudioInputId, selectedVideoInputId, resolutionTier)}
            className="underline font-semibold text-white ml-2"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Workspace: Stage or Video Grid + Collapsible Live Chat */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Call Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {isGamingActive ? (
            /* Dedicated Gaming & Live Streaming Theater Mode */
            <GamingStreamStage
              streamerInfo={activeStreamer || {
                name: currentUser.name,
                gameTitle: 'Direct Gameplay Broadcast',
                fps: 60,
                resolution: '1080p',
                bitrate: '6.0 Mbps',
              }}
              stream={currentStreamSource}
              isStreamerMe={streamerIsMe}
              onStopStream={stopScreenShare}
              currentUser={currentUser}
              remotePeers={remotePeers}
              localStream={localStream}
              socket={socket}
              roomId={roomId}
            />
          ) : (
            /* Standard Grid / Multi-User Hangout Mode */
            <VideoGrid
              localStream={localStream}
              currentUser={currentUser}
              isAudioMuted={isAudioMuted}
              isVideoOff={isVideoOff}
              isScreenSharing={isScreenSharing}
              isStreamingGame={isStreamingGame}
              remotePeers={remotePeers}
              resolutionTier={resolutionTier}
            />
          )}
        </div>

        {/* Live In-Room Chat Drawer */}
        <LiveChatDrawer
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          socket={socket}
          roomId={roomId}
          currentUser={currentUser}
        />
      </div>

      {/* Bottom Call Controls Dock */}
      <CallControlsBar
        localStream={localStream}
        isAudioMuted={isAudioMuted}
        isVideoOff={isVideoOff}
        isScreenSharing={isScreenSharing}
        isStreamingGame={isStreamingGame}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onStartScreenShare={startScreenShare}
        onStopScreenShare={stopScreenShare}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleChat={() => setIsChatOpen((prev) => !prev)}
        onLeaveCall={handleLeave}
        isChatOpen={isChatOpen}
      />

      {/* Device & Resolution Settings Modal */}
      <DeviceSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        audioInputs={audioInputs}
        videoInputs={videoInputs}
        audioOutputs={audioOutputs}
        selectedAudioInputId={selectedAudioInputId}
        onSelectAudioInput={(id) => {
          setSelectedAudioInputId(id);
          initLocalMedia(id, selectedVideoInputId, resolutionTier);
        }}
        selectedVideoInputId={selectedVideoInputId}
        onSelectVideoInput={(id) => {
          setSelectedVideoInputId(id);
          initLocalMedia(selectedAudioInputId, id, resolutionTier);
        }}
        selectedAudioOutputId={selectedAudioOutputId}
        onSelectAudioOutput={setSelectedAudioOutputId}
        resolutionTier={resolutionTier}
        onChangeResolutionTier={(tier) => {
          changeResolutionTier(tier);
          initLocalMedia(selectedAudioInputId, selectedVideoInputId, tier);
        }}
        localStream={localStream}
      />
    </div>
  );
}
