import React from 'react';
import { X, Mic, Video, Volume2, Sliders, Check } from 'lucide-react';
import { RESOLUTION_PRESETS } from '../constants/webrtc';
import { useAudioLevel } from '../hooks/useAudioLevel';

export function DeviceSettingsModal({
  isOpen,
  onClose,
  audioInputs,
  videoInputs,
  audioOutputs,
  selectedAudioInputId,
  onSelectAudioInput,
  selectedVideoInputId,
  onSelectVideoInput,
  selectedAudioOutputId,
  onSelectAudioOutput,
  resolutionTier,
  onChangeResolutionTier,
  localStream,
}) {
  const { audioLevel } = useAudioLevel(localStream, false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-dark-900 border border-white/15 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2 text-white">
            <Sliders className="w-5 h-5 text-brand-cyan" />
            <h3 className="font-bold text-lg font-display">Audio & Video Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5 pt-4">
          {/* 1. Microphone Selection & Live Test */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-1.5">
              <Mic className="w-4 h-4 text-brand-cyan" />
              Microphone
            </label>
            <select
              value={selectedAudioInputId}
              onChange={(e) => onSelectAudioInput(e.target.value)}
              className="w-full bg-dark-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-cyan"
            >
              {audioInputs.map((d) => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.label || `Microphone (${d.deviceId.substring(0, 6)})`}
                </option>
              ))}
            </select>

            {/* Live mic test meter */}
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Mic Level:</span>
              <div className="flex-1 h-2 bg-dark-950 rounded-full overflow-hidden border border-white/5">
                <div
                  className="h-full bg-brand-cyan transition-all duration-75"
                  style={{ width: `${audioLevel}%` }}
                />
              </div>
            </div>
          </div>

          {/* 2. Speaker Selection */}
          {audioOutputs.length > 0 && (
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-1.5">
                <Volume2 className="w-4 h-4 text-brand-emerald" />
                Speakers / Output
              </label>
              <select
                value={selectedAudioOutputId}
                onChange={(e) => onSelectAudioOutput(e.target.value)}
                className="w-full bg-dark-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-emerald"
              >
                {audioOutputs.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label || `Speaker (${d.deviceId.substring(0, 6)})`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 3. Camera Selection */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-1.5">
              <Video className="w-4 h-4 text-brand-purple" />
              Camera
            </label>
            <select
              value={selectedVideoInputId}
              onChange={(e) => onSelectVideoInput(e.target.value)}
              className="w-full bg-dark-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-purple"
            >
              {videoInputs.map((d) => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.label || `Camera (${d.deviceId.substring(0, 6)})`}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Resolution & Bandwidth Preset Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Resolution & Bandwidth Tier
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {Object.values(RESOLUTION_PRESETS).map((preset) => {
                const isSelected = resolutionTier === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => onChangeResolutionTier(preset.id)}
                    className={`p-3 rounded-2xl border text-left transition-all relative ${
                      isSelected
                        ? 'border-brand-cyan bg-brand-cyan/10 shadow-glow-cyan'
                        : 'border-white/10 bg-dark-950/60 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white">{preset.label}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-dark-800 text-brand-cyan">
                        {preset.badge}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 block font-mono">
                      ~{(preset.bitrate / 1000000).toFixed(1)} Mbps
                    </span>
                    {isSelected && (
                      <div className="absolute top-2 right-2 p-0.5 rounded-full bg-brand-cyan text-dark-950">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-6 mt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-brand-cyan text-dark-950 text-xs font-bold shadow-glow-cyan hover:bg-cyan-300 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
