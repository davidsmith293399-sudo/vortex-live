import { useState, useEffect, useRef } from 'react';

/**
 * Web Audio API Hook for Voice Activity Detection (VAD) and Volume Metering
 * @param {MediaStream} stream - Local or remote MediaStream containing an audio track
 * @param {boolean} isMuted - If muted, level is forced to 0
 * @param {number} threshold - Speaking detection threshold (0-100)
 */
export function useAudioLevel(stream, isMuted = false, threshold = 14) {
  const [audioLevel, setAudioLevel] = useState(0); // 0 to 100
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    if (!stream || isMuted) {
      setAudioLevel(0);
      setIsSpeaking(false);
      return;
    }

    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0 || !audioTracks[0].enabled) {
      setAudioLevel(0);
      setIsSpeaking(false);
      return;
    }

    let isCancelled = false;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.5;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      sourceRef.current = source;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkVolume = () => {
        if (isCancelled) return;

        analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }

        const average = sum / bufferLength;
        // Normalize 0-255 to 0-100
        const normalized = Math.min(100, Math.round((average / 128) * 100));

        setAudioLevel(normalized);
        setIsSpeaking(normalized > threshold);

        animationFrameRef.current = requestAnimationFrame(checkVolume);
      };

      checkVolume();
    } catch (err) {
      console.warn('[useAudioLevel] Web Audio API init error:', err);
    }

    return () => {
      isCancelled = true;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (sourceRef.current) {
        try { sourceRef.current.disconnect(); } catch (e) {}
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try { audioContextRef.current.close(); } catch (e) {}
      }
    };
  }, [stream, isMuted, threshold]);

  return { audioLevel, isSpeaking };
}
