import React, { useState, useEffect, useRef } from 'react';
import { Video, VideoOff, Mic, MicOff, Users, Gamepad2, ArrowRight, ShieldCheck, Sparkles, Volume2 } from 'lucide-react';
import { useAudioLevel } from '../hooks/useAudioLevel';

export function Lobby({
  onJoinRoom,
  initialRoomId = 'hangout-hq',
  initialUserName = '',
}) {
  const [userName, setUserName] = useState(
    initialUserName || `Pilot_${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [roomId, setRoomId] = useState(initialRoomId);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [localStream, setLocalStream] = useState(null);

  const previewVideoRef = useRef(null);
  const { audioLevel, isSpeaking } = useAudioLevel(localStream, isAudioMuted);

  // Initialize preview stream
  useEffect(() => {
    let streamInstance = null;
    async function startPreview() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: { width: 1280, height: 720 },
        });
        streamInstance = stream;
        setLocalStream(stream);
        if (previewVideoRef.current) {
          previewVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn('[Lobby] Camera/mic preview error:', err);
      }
    }

    startPreview();

    return () => {
      if (streamInstance) {
        streamInstance.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Update track enabled state on toggle
  const toggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((t) => {
        t.enabled = isAudioMuted;
      });
    }
    setIsAudioMuted((prev) => !prev);
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((t) => {
        t.enabled = isVideoOff;
      });
    }
    setIsVideoOff((prev) => !prev);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userName.trim() || !roomId.trim()) return;

    onJoinRoom({
      userName: userName.trim(),
      roomId: roomId.trim().toLowerCase(),
      isAudioMuted,
      isVideoOff,
    });
  };

  const PRESET_ROOMS = [
    { id: 'gaming-arena', name: 'Gaming Arena 🎮', desc: '60 FPS Ultra Stream' },
    { id: 'friends-hangout', name: 'Friends Lounge ☕', desc: 'Casual 4-6 Group Room' },
    { id: 'code-and-chill', name: 'Devs Collab 🚀', desc: 'Screen Share & Review' },
  ];

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambient Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-cyan/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-purple/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header Branding */}
      <div className="text-center mb-8 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>VORTEX LIVE CALLS & 60 FPS GAMING</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white font-display tracking-tight">
          Hangout, Talk & Stream
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-md mx-auto mt-2">
          High-definition WebRTC video calling, low-latency group rooms, and 60 FPS game broadcasting.
        </p>
      </div>

      {/* Main Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 shadow-2xl relative z-10">
        {/* Left Column: Camera Preview & Test HUD */}
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Device Preview
          </span>

          <div className="relative aspect-video rounded-2xl overflow-hidden bg-dark-900 border border-white/10 flex items-center justify-center">
            {localStream && !isVideoOff ? (
              <video
                ref={previewVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover -scale-x-100"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-500">
                <VideoOff className="w-12 h-12 mb-2 opacity-50" />
                <span className="text-xs">Camera is off</span>
              </div>
            )}

            {/* Speaking halo indicator */}
            {isSpeaking && !isAudioMuted && (
              <div className="absolute inset-0 border-2 border-brand-cyan pointer-events-none animate-pulse rounded-2xl" />
            )}

            {/* Quick Media Toggles on Preview */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-dark-950/80 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/10">
              <button
                type="button"
                onClick={toggleAudio}
                className={`p-2 rounded-xl transition-colors ${
                  isAudioMuted
                    ? 'bg-brand-rose/20 text-brand-rose'
                    : 'bg-dark-800 text-brand-cyan hover:bg-dark-700'
                }`}
                title={isAudioMuted ? 'Unmute' : 'Mute'}
              >
                {isAudioMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={toggleVideo}
                className={`p-2 rounded-xl transition-colors ${
                  isVideoOff
                    ? 'bg-brand-rose/20 text-brand-rose'
                    : 'bg-dark-800 text-brand-cyan hover:bg-dark-700'
                }`}
                title={isVideoOff ? 'Start Camera' : 'Stop Camera'}
              >
                {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Real-time Microphone Audio Meter */}
          <div className="mt-3 flex items-center gap-2 bg-dark-950/80 p-2.5 rounded-xl border border-white/5">
            <Volume2 className={`w-4 h-4 ${isAudioMuted ? 'text-slate-600' : 'text-brand-cyan'}`} />
            <div className="flex-1 h-2 bg-dark-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-cyan transition-all duration-75"
                style={{ width: `${isAudioMuted ? 0 : audioLevel}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              {isAudioMuted ? 'MUTED' : `${audioLevel}%`}
            </span>
          </div>
        </div>

        {/* Right Column: Room & Identity Form */}
        <form onSubmit={handleSubmit} className="flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Your Display Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-dark-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-cyan transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Room ID or Passcode
              </label>
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="e.g. hangout-hq"
                className="w-full bg-dark-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-brand-cyan transition-colors"
                required
              />
            </div>

            {/* Preset Rooms Selection */}
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                Quick Join Popular Lounges
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {PRESET_ROOMS.map((room) => (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => setRoomId(room.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                      roomId === room.id
                        ? 'border-brand-cyan bg-brand-cyan/10'
                        : 'border-white/5 bg-dark-950/40 hover:border-white/15'
                    }`}
                  >
                    <span className="text-xs font-medium text-slate-200">{room.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{room.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Join Call Button */}
          <div className="pt-6">
            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-brand-cyan to-brand-electric text-dark-950 font-bold text-sm shadow-glow-cyan hover:opacity-95 transition-all flex items-center justify-center gap-2"
            >
              <span>Connect to Room</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Footer Info */}
      <div className="mt-8 flex items-center gap-6 text-xs text-slate-500 relative z-10">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-brand-emerald" /> End-to-End P2P Encrypted
        </span>
        <span className="flex items-center gap-1.5">
          <Gamepad2 className="w-4 h-4 text-brand-purple" /> 60 FPS Gaming Stream Ready
        </span>
      </div>
    </div>
  );
}
