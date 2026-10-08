import { useState, useEffect, useCallback } from 'react';

export function useMediaDevices() {
  const [audioInputs, setAudioInputs] = useState([]);
  const [audioOutputs, setAudioOutputs] = useState([]);
  const [videoInputs, setVideoInputs] = useState([]);
  const [selectedAudioInputId, setSelectedAudioInputId] = useState('');
  const [selectedAudioOutputId, setSelectedAudioOutputId] = useState('');
  const [selectedVideoInputId, setSelectedVideoInputId] = useState('');
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [permissionError, setPermissionError] = useState(null);

  const enumerate = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        throw new Error('navigator.mediaDevices.enumerateDevices is not supported in this browser');
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      const mics = devices.filter(d => d.kind === 'audioinput');
      const speakers = devices.filter(d => d.kind === 'audiooutput');
      const cameras = devices.filter(d => d.kind === 'videoinput');

      setAudioInputs(mics);
      setAudioOutputs(speakers);
      setVideoInputs(cameras);

      if (mics.length > 0 && !selectedAudioInputId) {
        setSelectedAudioInputId(mics[0].deviceId);
      }
      if (speakers.length > 0 && !selectedAudioOutputId) {
        setSelectedAudioOutputId(speakers[0].deviceId);
      }
      if (cameras.length > 0 && !selectedVideoInputId) {
        setSelectedVideoInputId(cameras[0].deviceId);
      }
    } catch (err) {
      console.warn('[useMediaDevices] enumerateDevices error:', err);
    }
  }, [selectedAudioInputId, selectedAudioOutputId, selectedVideoInputId]);

  // Request initial permissions to reveal device labels
  const requestPermissions = useCallback(async (audio = true, video = true) => {
    try {
      setPermissionError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio, video });
      setPermissionGranted(true);
      // Clean up temporary permission probe stream
      stream.getTracks().forEach(track => track.stop());
      await enumerate();
      return true;
    } catch (err) {
      console.error('[useMediaDevices] Permission error:', err);
      let message = 'Unable to access media devices.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        message = 'Camera and Microphone access was denied. Please allow permissions in your browser address bar.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        message = 'No camera or microphone found on this device.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        message = 'Camera or microphone is already in use by another application.';
      }
      setPermissionError(message);
      return false;
    }
  }, [enumerate]);

  useEffect(() => {
    enumerate();

    if (navigator.mediaDevices && navigator.mediaDevices.addEventListener) {
      navigator.mediaDevices.addEventListener('devicechange', enumerate);
      return () => {
        navigator.mediaDevices.removeEventListener('devicechange', enumerate);
      };
    }
  }, [enumerate]);

  return {
    audioInputs,
    audioOutputs,
    videoInputs,
    selectedAudioInputId,
    setSelectedAudioInputId,
    selectedAudioOutputId,
    setSelectedAudioOutputId,
    selectedVideoInputId,
    setSelectedVideoInputId,
    permissionGranted,
    permissionError,
    requestPermissions,
    refreshDevices: enumerate,
  };
}
