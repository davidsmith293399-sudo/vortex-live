import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { RESOLUTION_TIERS, AUDIO_ONLY_TIER, SCREEN_SHARE_MODES, NETWORK_CONDITIONS } from '../constants/dataTiers';

const BandwidthContext = createContext();

export const BandwidthProvider = ({ children }) => {
  // Current active resolution tier
  const [activeTierId, setActiveTierId] = useState('360p');
  // Extreme data saver toggle
  const [extremeDataSaver, setExtremeDataSaver] = useState(true);
  // Auto downgrade on cellular
  const [autoDowngradeCellular, setAutoDowngradeCellular] = useState(true);
  // Screen share mode (default to Ultra-Sharp 60 FPS for maximum clarity)
  const [screenShareModeId, setScreenShareModeId] = useState('ultra_hd');
  // Network simulation
  const [networkCondition, setNetworkCondition] = useState(NETWORK_CONDITIONS[1]); // 3G default

  // Low-bandwidth audio AI noise suppression
  const [aiNoiseSuppression, setAiNoiseSuppression] = useState(true);

  // Deep AI Traffic & Street Noise Cancellation Engine
  const [trafficSuppressionEnabled, setTrafficSuppressionEnabled] = useState(true);
  const [trafficFilterLevel, setTrafficFilterLevel] = useState('extreme'); // 'extreme' (-42dB) | 'standard' (-28dB) | 'off'

  // Active call duration tracking
  const [isInCall, setIsInCall] = useState(false);
  const [callDurationSeconds, setCallDurationSeconds] = useState(0);
  const [accumulatedMb, setAccumulatedMb] = useState(0.00);

  // Resolution lookup
  const currentTier = useMemo(() => {
    if (activeTierId === 'audio_only') return AUDIO_ONLY_TIER;
    return RESOLUTION_TIERS.find(t => t.id === activeTierId) || RESOLUTION_TIERS[0];
  }, [activeTierId]);

  const currentScreenShareMode = useMemo(() => {
    return SCREEN_SHARE_MODES.find(m => m.id === screenShareModeId) || SCREEN_SHARE_MODES[0];
  }, [screenShareModeId]);

  // Live real-time MB accumulation counter
  useEffect(() => {
    let timer = null;
    if (isInCall) {
      timer = setInterval(() => {
        setCallDurationSeconds(prev => prev + 1);
        // Bitrate in kbps / 8 = kB/s; divided by 1024 = MB/s
        const mbPerSecond = (currentTier.bitrateKbps / (8 * 1024));
        setAccumulatedMb(prev => +(prev + mbPerSecond).toFixed(3));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isInCall, currentTier]);

  // Estimated savings compared to an uncompressed 1080p stream (13.74 MB/min)
  const savingsMb = useMemo(() => {
    const standardCostPerSec = 13.74 / 60;
    const totalStandardExpected = standardCostPerSec * callDurationSeconds;
    const diff = totalStandardExpected - accumulatedMb;
    return diff > 0 ? diff.toFixed(2) : '0.00';
  }, [callDurationSeconds, accumulatedMb]);

  const savingsPercent = useMemo(() => {
    if (currentTier.id === '1080p') return '0%';
    if (currentTier.id === '4k') return '-250%';
    return currentTier.savingsVsNormal || '75%';
  }, [currentTier]);

  const selectTier = (tierId) => {
    if (extremeDataSaver && (tierId === '1080p' || tierId === '4k')) {
      setActiveTierId(tierId);
    } else {
      setActiveTierId(tierId);
    }
  };

  const toggleExtremeDataSaver = () => {
    setExtremeDataSaver(prev => {
      const next = !prev;
      if (next && (activeTierId === '1080p' || activeTierId === '4k')) {
        setActiveTierId('360p');
      }
      return next;
    });
  };

  const toggleTrafficSuppression = () => {
    setTrafficSuppressionEnabled(prev => !prev);
  };

  const resetCallStats = () => {
    setCallDurationSeconds(0);
    setAccumulatedMb(0.00);
  };

  return (
    <BandwidthContext.Provider
      value={{
        activeTierId,
        currentTier,
        selectTier,
        extremeDataSaver,
        toggleExtremeDataSaver,
        autoDowngradeCellular,
        setAutoDowngradeCellular,
        screenShareModeId,
        setScreenShareModeId,
        currentScreenShareMode,
        networkCondition,
        setNetworkCondition,
        aiNoiseSuppression,
        setAiNoiseSuppression,
        trafficSuppressionEnabled,
        toggleTrafficSuppression,
        trafficFilterLevel,
        setTrafficFilterLevel,
        isInCall,
        setIsInCall,
        callDurationSeconds,
        accumulatedMb,
        savingsMb,
        savingsPercent,
        resetCallStats,
      }}
    >
      {children}
    </BandwidthContext.Provider>
  );
};

export const useBandwidth = () => useContext(BandwidthContext);
