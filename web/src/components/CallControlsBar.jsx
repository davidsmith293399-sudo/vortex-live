import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MonitorOff,
  Gamepad2,
  Settings,
  MessageSquare,
  PhoneOff,
  ChevronUp,
} from 'lucide-react';
import { useAudioLevel } from '../hooks/useAudioLevel';

export function CallControlsBar({
  localStream,
  isAudioMuted,
  isVideoOff,
  isScreenSharing,
  isStreamingGame,
  onToggleAudio,
  onToggleVideo,
  onStartScreenShare,
  onStopScreenShare,
  onOpenSettings,
  onToggleChat,
  onLeaveCall,
  isChatOpen,
}) {
  const { audioLevel, isSpeaking } = useAudioLevel(localStream, isAudioMuted);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showGameModal, setShowGameModal] = useState(false);
  const [gameTitle, setGameTitle] = useState('Valorant');

  const handleStartGaming = (e) => {
    e?.preventDefault();
    setShowGameModal(false);
    onStartScreenShare({
      mode: 'gaming',
      fps: 60,
      gameTitle: gameTitle.trim() || 'Live Game',
    });
  };

  return (
    <>
      {/* Floating Bottom Dock */}
      <div className="h-20 bg-dark-900/90 backdrop-blur-2xl border-t border-white/10 px-4 flex items-center justify-between shrink-0 relative z-30 shadow-2xl">
        {/* Left Section: Live Mic Meter / Status */}
        <div className="hidden sm:flex items-center gap-3 w-1/4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-dark-950/80 border border-white/10">
            <span
              className={`w-2 h-2 rounded-full ${
                isAudioMuted
                  ? 'bg-brand-rose'
                  : isSpeaking
                  ? 'bg-brand-cyan animate-ping'
                  : 'bg-brand-emerald'
              }`}
            />
            <span className="text-xs font-mono text-slate-300">
              {isAudioMuted ? 'MUTED' : isSpeaking ? 'SPEAKING' : 'READY'}
            </span>
            {/* Visual volume level meter */}
            {!isAudioMuted && (
              <div className="w-12 h-1.5 bg-dark-800 rounded-full overflow-hidden ml-1">
                <div
                  className="h-full bg-brand-cyan transition-all duration-75"
                  style={{ width: `${audioLevel}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Center Section: Primary Media Toggles */}
        <div className="flex items-center gap-2 sm:gap-3 mx-auto">
          {/* 1. Microphone Toggle */}
          <button
            onClick={onToggleAudio}
            className={`p-3.5 rounded-2xl transition-all flex items-center justify-center relative ${
              isAudioMuted
                ? 'bg-brand-rose/20 text-brand-rose hover:bg-brand-rose/30 border border-brand-rose/40'
                : 'bg-dark-800 text-white hover:bg-dark-700 border border-white/10'
            }`}
            title={isAudioMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          >
            {isAudioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-brand-cyan" />}
          </button>

          {/* 2. Camera Toggle */}
          <button
            onClick={onToggleVideo}
            className={`p-3.5 rounded-2xl transition-all flex items-center justify-center ${
              isVideoOff
                ? 'bg-brand-rose/20 text-brand-rose hover:bg-brand-rose/30 border border-brand-rose/40'
                : 'bg-dark-800 text-white hover:bg-dark-700 border border-white/10'
            }`}
            title={isVideoOff ? 'Start Camera' : 'Stop Camera'}
          >
            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5 text-brand-cyan" />}
          </button>

          {/* 3. Screen Sharing Trigger with Preset Flyout */}
          <div className="relative">
            {isScreenSharing && !isStreamingGame ? (
              <button
                onClick={onStopScreenShare}
                className="p-3.5 rounded-2xl bg-brand-cyan text-dark-950 hover:bg-cyan-300 transition-all flex items-center justify-center shadow-glow-cyan"
                title="Stop Sharing Screen"
              >
                <MonitorOff className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={() => setShowShareMenu((prev) => !prev)}
                className="p-3.5 rounded-2xl bg-dark-800 text-white hover:bg-dark-700 border border-white/10 transition-all flex items-center justify-center"
                title="Share Screen"
              >
                <Monitor className="w-5 h-5" />
              </button>
            )}

            {/* Screen Share Preset Menu Popover */}
            {showShareMenu && (
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-64 bg-dark-900 border border-white/15 rounded-2xl shadow-2xl p-2 z-50">
                <span className="text-[11px] font-semibold text-slate-400 px-2 py-1 block">
                  SCREEN SHARE PRESET
                </span>
                <button
                  onClick={() => {
                    setShowShareMenu(false);
                    onStartScreenShare({ mode: 'screenshare', fps: 30 });
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 text-xs text-white flex flex-col"
                >
                  <span className="font-semibold text-brand-cyan">Standard 30 FPS</span>
                  <span className="text-[10px] text-slate-400">Smooth navigation for apps and video</span>
                </button>
                <button
                  onClick={() => {
                    setShowShareMenu(false);
                    onStartScreenShare({ mode: 'screenshare', fps: 5 });
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 text-xs text-white flex flex-col mt-1"
                >
                  <span className="font-semibold text-brand-emerald">Eco 5 FPS Slides</span>
                  <span className="text-[10px] text-slate-400">Crisp text, lowest data consumption</span>
                </button>
              </div>
            )}
          </div>

          {/* 4. Stream Game / Go Live Button (60 FPS mode) */}
          {isStreamingGame ? (
            <button
              onClick={onStopScreenShare}
              className="px-4 py-3 rounded-2xl bg-brand-purple text-white hover:bg-purple-600 transition-all flex items-center gap-2 shadow-glow-purple"
              title="Stop Gaming Stream"
            >
              <Gamepad2 className="w-5 h-5 animate-spin" />
              <span className="text-xs font-bold tracking-wide">STREAMING</span>
            </button>
          ) : (
            <button
              onClick={() => setShowGameModal(true)}
              className="px-4 py-3 rounded-2xl bg-gradient-to-r from-brand-purple to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white transition-all flex items-center gap-2 shadow-glow-purple border border-white/20"
              title="Go Live with 60 FPS Gaming Stream"
            >
              <Gamepad2 className="w-5 h-5" />
              <span className="text-xs font-bold tracking-wide hidden md:inline">GO LIVE (60 FPS)</span>
            </button>
          )}

          {/* 5. In-Room Chat Drawer Toggle */}
          <button
            onClick={onToggleChat}
            className={`p-3.5 rounded-2xl transition-all flex items-center justify-center relative ${
              isChatOpen
                ? 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40'
                : 'bg-dark-800 text-white hover:bg-dark-700 border border-white/10'
            }`}
            title="Toggle Live Chat"
          >
            <MessageSquare className="w-5 h-5" />
          </button>

          {/* 6. Settings Modal Trigger */}
          <button
            onClick={onOpenSettings}
            className="p-3.5 rounded-2xl bg-dark-800 text-slate-300 hover:text-white hover:bg-dark-700 border border-white/10 transition-all flex items-center justify-center"
            title="Audio & Video Settings"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* 7. Disconnect / Leave Call Button */}
          <button
            onClick={onLeaveCall}
            className="p-3.5 rounded-2xl bg-brand-rose hover:bg-rose-600 text-white shadow-glow-rose transition-all flex items-center justify-center ml-2"
            title="Disconnect from Room"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>

        {/* Right Section: Stream Mode Pill */}
        <div className="hidden sm:flex items-center justify-end w-1/4">
          <span className="text-xs px-2.5 py-1 rounded-full bg-dark-950 text-slate-400 border border-white/10">
            WebRTC P2P Mesh
          </span>
        </div>
      </div>

      {/* Start Game Stream Modal */}
      {showGameModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 border border-white/15 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-brand-purple/20 text-brand-purple border border-brand-purple/40">
                <Gamepad2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-display">Go Live: 60 FPS Gaming Stream</h3>
                <p className="text-xs text-slate-400">Stream high-action gameplay with crystal-clear game audio</p>
              </div>
            </div>

            <form onSubmit={handleStartGaming} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Game / Application Title
                </label>
                <input
                  type="text"
                  value={gameTitle}
                  onChange={(e) => setGameTitle(e.target.value)}
                  placeholder="e.g. Valorant, League of Legends, GTA V..."
                  className="w-full bg-dark-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-brand-purple transition-colors"
                />
              </div>

              <div className="p-3 rounded-xl bg-dark-950/70 border border-white/5 space-y-1 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>Stream Quality:</span>
                  <strong className="text-brand-cyan">1080p @ 60 FPS Ultra</strong>
                </div>
                <div className="flex justify-between">
                  <span>Audio Pass-Through:</span>
                  <strong className="text-brand-emerald">Raw System Audio (No DSP)</strong>
                </div>
                <div className="flex justify-between">
                  <span>Latency:</span>
                  <strong className="text-brand-purple">Sub-50ms Ultra-Low</strong>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGameModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-brand-purple hover:bg-purple-600 text-white text-xs font-bold shadow-glow-purple transition-colors"
                >
                  Start 60 FPS Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
