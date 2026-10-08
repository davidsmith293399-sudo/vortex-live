import React, { useRef, useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff, Pin, Maximize2, Monitor, Gamepad2 } from 'lucide-react';
import { useAudioLevel } from '../hooks/useAudioLevel';

export function VideoTile({
  stream,
  user,
  isMe = false,
  isAudioMuted = false,
  isVideoOff = false,
  isScreenSharing = false,
  isStreamingGame = false,
  isPinned = false,
  onTogglePin = null,
  qualityLabel = '720p HD',
}) {
  const videoRef = useRef(null);
  const { audioLevel, isSpeaking } = useAudioLevel(stream, isAudioMuted, 12);

  // Attach MediaStream to <video> element
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Handle Fullscreen on double-click
  const handleToggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      } else {
        videoRef.current.requestFullscreen().catch(() => {});
      }
    }
  };

  const displayName = user?.name || (isMe ? 'You' : 'Anonymous');
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div
      className={`group relative flex items-center justify-center rounded-2xl overflow-hidden bg-dark-900 border transition-all duration-300 w-full h-full select-none ${
        isSpeaking && !isAudioMuted
          ? 'border-brand-cyan speaking-indicator'
          : isPinned
          ? 'border-brand-purple ring-2 ring-brand-purple/40'
          : 'border-white/10 hover:border-white/25'
      }`}
    >
      {/* Actual Video Element */}
      {stream && !isVideoOff ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isMe} // Always mute local video playback to prevent audio feedback
          onDoubleClick={handleToggleFullscreen}
          className={`w-full h-full ${
            isScreenSharing || isStreamingGame ? 'object-contain bg-black' : 'object-cover'
          } ${isMe && !isScreenSharing ? '-scale-x-100' : ''}`}
        />
      ) : (
        /* Video Off / Avatar Fallback View */
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <div className="relative flex items-center justify-center">
            {/* Pulsing speaking halo behind avatar */}
            {isSpeaking && !isAudioMuted && (
              <div
                className="absolute inset-0 rounded-full bg-brand-cyan/20 animate-ping"
                style={{ transform: `scale(${1 + (audioLevel / 100) * 0.6})` }}
              />
            )}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-brand-electric to-brand-purple flex items-center justify-center shadow-lg border-2 border-white/20 text-white text-3xl font-bold font-display">
              {initial}
            </div>
          </div>
          <span className="mt-3 text-slate-300 text-sm font-medium">
            {displayName} {isMe && '(You)'}
          </span>
          <span className="text-xs text-slate-500 mt-0.5">Camera off</span>
        </div>
      )}

      {/* Top Bar Overlay: Screen Share / Gaming Badges & Pin Controls */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none opacity-90 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Gaming Stream Badge */}
          {isStreamingGame && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-brand-purple text-white shadow-glow-purple pointer-events-auto">
              <Gamepad2 className="w-3.5 h-3.5 animate-bounce" />
              <span>LIVE GAME</span>
            </div>
          )}

          {/* Screen Share Badge */}
          {!isStreamingGame && isScreenSharing && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40 pointer-events-auto">
              <Monitor className="w-3.5 h-3.5" />
              <span>SCREEN</span>
            </div>
          )}

          {/* Quality Badge */}
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-dark-950/70 text-slate-300 border border-white/10 backdrop-blur-md">
            {qualityLabel}
          </span>
        </div>

        {/* Pin / Spotlight and Fullscreen Action Buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto">
          {onTogglePin && (
            <button
              onClick={onTogglePin}
              title={isPinned ? 'Unpin video' : 'Pin / Spotlight video'}
              className={`p-1.5 rounded-lg backdrop-blur-md transition-colors ${
                isPinned
                  ? 'bg-brand-purple text-white'
                  : 'bg-dark-950/70 hover:bg-dark-800 text-slate-300 hover:text-white'
              }`}
            >
              <Pin className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={handleToggleFullscreen}
            title="Toggle Fullscreen"
            className="p-1.5 rounded-lg bg-dark-950/70 hover:bg-dark-800 text-slate-300 hover:text-white backdrop-blur-md transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom User Info Pill & Live Mic / Speaking Meter */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-dark-950/80 backdrop-blur-md border border-white/10 max-w-[85%] truncate">
          {/* Muted or Speaking Status Icon */}
          {isAudioMuted ? (
            <div className="p-1 rounded-full bg-brand-rose/20 text-brand-rose">
              <MicOff className="w-3.5 h-3.5" />
            </div>
          ) : (
            <div
              className={`p-1 rounded-full transition-colors ${
                isSpeaking ? 'bg-brand-cyan/20 text-brand-cyan' : 'bg-white/10 text-slate-400'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
            </div>
          )}

          <span className="text-xs font-medium text-slate-200 truncate">
            {displayName} {isMe && <span className="text-slate-400 font-normal">(You)</span>}
          </span>

          {/* Real-time Voice Activity Waveform */}
          {!isAudioMuted && isSpeaking && (
            <div className="flex items-end gap-0.5 h-3 ml-1">
              <span
                className="w-0.5 bg-brand-cyan rounded-full transition-all"
                style={{ height: `${Math.max(4, (audioLevel / 100) * 12)}px` }}
              />
              <span
                className="w-0.5 bg-brand-cyan rounded-full transition-all"
                style={{ height: `${Math.max(6, (audioLevel / 100) * 14)}px` }}
              />
              <span
                className="w-0.5 bg-brand-cyan rounded-full transition-all"
                style={{ height: `${Math.max(3, (audioLevel / 100) * 10)}px` }}
              />
            </div>
          )}
        </div>

        {/* Video off indicator badge */}
        {isVideoOff && (
          <div className="p-1.5 rounded-xl bg-dark-950/80 backdrop-blur-md border border-white/10 text-slate-400">
            <VideoOff className="w-3.5 h-3.5" />
          </div>
        )}
      </div>
    </div>
  );
}
