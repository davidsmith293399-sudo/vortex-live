import React, { useRef, useEffect, useState } from 'react';
import { Gamepad2, Radio, Users, Flame, Heart, Rocket, ThumbsUp, Sparkles, Maximize2, Volume2, VolumeX, ShieldAlert } from 'lucide-react';
import confetti from 'canvas-confetti';
import { VideoTile } from './VideoTile';
import { REACTION_EMOJIS } from '../constants/webrtc';

export function GamingStreamStage({
  streamerInfo,
  stream,
  isStreamerMe = false,
  onStopStream,
  currentUser,
  remotePeers,
  localStream,
  socket,
  roomId,
}) {
  const videoRef = useRef(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [floatingReactions, setFloatingReactions] = useState([]);
  const [telemetry, setTelemetry] = useState({
    fps: streamerInfo?.fps || 60,
    resolution: streamerInfo?.resolution || '1080p',
    bitrate: streamerInfo?.bitrate || '6.0 Mbps',
    latency: '24ms',
    packetLoss: '0.0%',
  });

  // Attach stream to main video player
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Listen for real-time reactions from peers in room
  useEffect(() => {
    if (!socket) return;

    const onStreamReaction = (reaction) => {
      // Trigger canvas confetti if flame or rocket
      if (reaction.emoji === '🔥' || reaction.emoji === '🎉') {
        confetti({
          particleCount: 25,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#00F2FE', '#8A2BE2', '#FF3366', '#FFB800'],
        });
      }

      // Add to floating reactions
      const newReaction = {
        id: reaction.id || Date.now() + Math.random(),
        emoji: reaction.emoji,
        senderName: reaction.senderName,
        left: Math.random() * 80 + 10, // 10% to 90% horizontal position
      };

      setFloatingReactions((prev) => [...prev.slice(-15), newReaction]);

      setTimeout(() => {
        setFloatingReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
      }, 2200);
    };

    socket.on('stream:reaction', onStreamReaction);
    return () => {
      socket.off('stream:reaction', onStreamReaction);
    };
  }, [socket]);

  // Handle viewer clicking a reaction emoji
  const handleSendReaction = (emoji) => {
    if (!socket || !roomId) return;
    socket.emit('stream:reaction', { roomId, emoji });
  };

  const handleToggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      } else {
        videoRef.current.requestFullscreen().catch(() => {});
      }
    }
  };

  const remotePeerList = Object.values(remotePeers);
  const viewerCount = 1 + remotePeerList.length;

  return (
    <div className="flex-1 flex flex-col h-full bg-dark-950 overflow-hidden relative">
      {/* Top Streamer Header HUD */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-dark-900/90 backdrop-blur-md border-b border-white/10 z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-brand-rose/20 text-brand-rose border border-brand-rose/40 animate-pulse">
            <Radio className="w-4 h-4" />
            <span className="text-xs font-bold tracking-wider">LIVE 60 FPS</span>
          </div>

          <div className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-brand-purple" />
            <span className="font-display font-semibold text-white text-sm sm:text-base">
              {streamerInfo?.gameTitle || 'Live Gameplay'}
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">
              by <strong className="text-brand-cyan">{streamerInfo?.name || 'Streamer'}</strong> {isStreamerMe && '(You)'}
            </span>
          </div>
        </div>

        {/* Telemetry Stats & Spectator Counter */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:flex items-center gap-3 px-3 py-1 rounded-lg bg-dark-950/80 border border-white/10 text-xs font-mono text-slate-300">
            <span>RES: <strong className="text-white">{telemetry.resolution}</strong></span>
            <span>FPS: <strong className="text-brand-emerald">{telemetry.fps}</strong></span>
            <span>BITRATE: <strong className="text-brand-cyan">{telemetry.bitrate}</strong></span>
            <span>RTT: <strong className="text-slate-200">{telemetry.latency}</strong></span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-dark-800 text-slate-200 text-xs font-medium border border-white/10">
            <Users className="w-3.5 h-3.5 text-brand-cyan" />
            <span>{viewerCount}</span>
          </div>

          {isStreamerMe && (
            <button
              onClick={onStopStream}
              className="px-3 py-1 rounded-lg bg-brand-rose hover:bg-rose-600 text-white text-xs font-semibold shadow-glow-rose transition-colors"
            >
              End Stream
            </button>
          )}

          <button
            onClick={handleToggleFullscreen}
            className="p-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-slate-300 hover:text-white transition-colors"
            title="Theater Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main High-Performance Stream Stage */}
      <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden group">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isStreamerMe || isAudioMuted}
          className="w-full h-full object-contain"
        />

        {/* Floating Animated Reaction Bursts Layer */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
          {floatingReactions.map((reaction) => (
            <div
              key={reaction.id}
              style={{ left: `${reaction.left}%`, bottom: '80px' }}
              className="absolute animate-reaction-float flex flex-col items-center select-none"
            >
              <span className="text-4xl filter drop-shadow-lg">{reaction.emoji}</span>
              <span className="text-[10px] text-white/80 bg-black/50 px-1 rounded backdrop-blur-sm">
                {reaction.senderName}
              </span>
            </div>
          ))}
        </div>

        {/* Quick Audio Mute / Unmute Overlay Button for Viewers */}
        {!isStreamerMe && (
          <button
            onClick={() => setIsAudioMuted((prev) => !prev)}
            className="absolute bottom-4 left-4 p-2.5 rounded-xl bg-dark-900/80 hover:bg-dark-800 text-white backdrop-blur-md border border-white/10 transition-colors z-20"
            title={isAudioMuted ? 'Unmute Stream Audio' : 'Mute Stream Audio'}
          >
            {isAudioMuted ? <VolumeX className="w-5 h-5 text-brand-rose" /> : <Volume2 className="w-5 h-5 text-brand-cyan" />}
          </button>
        )}

        {/* Interactive Viewer Emoji Reaction Floating Bar */}
        <div className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-dark-900/85 backdrop-blur-md border border-white/15 shadow-xl z-20">
          <span className="text-xs text-slate-400 font-medium mr-1 hidden sm:inline">React:</span>
          {REACTION_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleSendReaction(emoji)}
              className="text-lg hover:scale-135 active:scale-95 transition-transform p-1 hover:bg-white/10 rounded-lg"
              title={`React with ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Spectators Webcams Bottom Strip */}
      <div className="h-28 bg-dark-900/90 border-t border-white/10 p-2 flex items-center gap-2 overflow-x-auto shrink-0 z-10">
        {/* Local user tile */}
        <div className="w-36 h-full shrink-0">
          <VideoTile
            stream={localStream}
            user={currentUser}
            isMe={true}
            qualityLabel="CAM"
          />
        </div>

        {/* Remote spectators */}
        {remotePeerList.map((peer) => (
          <div key={peer.socketId} className="w-36 h-full shrink-0">
            <VideoTile
              stream={peer.stream}
              user={peer.user}
              isMe={false}
              qualityLabel="CAM"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
