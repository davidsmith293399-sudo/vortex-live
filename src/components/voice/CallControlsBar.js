import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../theme/colors';
import { useCall } from '../../context/CallContext';
import { useBandwidth } from '../../context/BandwidthContext';

export const CallControlsBar = ({
  onOpenResolutionPicker,
  onOpenSavingsModal,
  onOpenScreenShareModal
}) => {
  const {
    isMuted,
    toggleMute,
    isDeafened,
    toggleDeafen,
    isVideoEnabled,
    toggleVideo,
    isFrontCamera,
    toggleCameraFlip,
    isScreenSharing,
    leaveCall,
    isSpeakerOn,
    toggleSpeaker,
  } = useCall();

  const {
    currentTier,
    currentScreenShareMode,
    trafficSuppressionEnabled,
    toggleTrafficSuppression,
  } = useBandwidth();

  return (
    <View style={styles.controlsWrapper}>
      {/* Top Quick Telemetry Bar */}
      <View style={styles.topTelemetryBar}>
        {/* Tier Selector Trigger Pill */}
        <TouchableOpacity
          style={[styles.tierButton, { borderColor: currentTier.tagColor }]}
          onPress={onOpenResolutionPicker}
          activeOpacity={0.8}
        >
          <Ionicons name="speedometer" size={14} color={currentTier.tagColor} />
          <Text style={[styles.tierButtonLabel, { color: currentTier.tagColor }]}>
            {currentTier.shortLabel}
          </Text>
          <Text style={styles.tierRateText}>
            ({currentTier.estimatedMbPerMin} MB/min)
          </Text>
          <Ionicons name="chevron-up" size={12} color={THEME.textSecondary} />
        </TouchableOpacity>

        {/* AI Traffic Filter Telemetry Badge */}
        <TouchableOpacity
          style={[
            styles.trafficShieldPill,
            trafficSuppressionEnabled ? styles.trafficShieldActive : styles.trafficShieldInactive
          ]}
          onPress={toggleTrafficSuppression}
          activeOpacity={0.8}
        >
          <Ionicons
            name={trafficSuppressionEnabled ? 'shield-checkmark' : 'shield-outline'}
            size={12}
            color={trafficSuppressionEnabled ? THEME.successEmerald : THEME.textMuted}
          />
          <Text style={[
            styles.trafficShieldText,
            { color: trafficSuppressionEnabled ? THEME.successEmerald : THEME.textMuted }
          ]}>
            {trafficSuppressionEnabled ? 'Traffic Filter: -42dB' : 'Traffic Filter: Off'}
          </Text>
        </TouchableOpacity>

        {/* Screen Share Mode Pill if active */}
        {isScreenSharing && (
          <TouchableOpacity
            style={styles.screenSharePill}
            onPress={onOpenScreenShareModal}
            activeOpacity={0.8}
          >
            <Ionicons name="desktop" size={12} color={THEME.accentViolet} />
            <Text style={styles.screenSharePillText}>{currentScreenShareMode.name}</Text>
          </TouchableOpacity>
        )}

        {/* Data Analytics Button */}
        <TouchableOpacity
          style={styles.dataAnalyticsBtn}
          onPress={onOpenSavingsModal}
          activeOpacity={0.8}
        >
          <Ionicons name="analytics" size={13} color={THEME.successEmerald} />
          <Text style={styles.dataAnalyticsText}>Stats</Text>
        </TouchableOpacity>
      </View>

      {/* Main Action Buttons Dock */}
      <View style={styles.buttonsDock}>
        {/* Mic Toggle */}
        <TouchableOpacity
          style={[styles.controlBtn, isMuted && styles.controlBtnDanger]}
          onPress={toggleMute}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isMuted ? 'mic-off' : 'mic'}
            size={20}
            color={isMuted ? '#FFF' : THEME.textPrimary}
          />
          <Text style={styles.btnLabel}>{isMuted ? 'Muted' : 'Mic On'}</Text>
        </TouchableOpacity>

        {/* AI Traffic Noise Suppression Quick Button */}
        <TouchableOpacity
          style={[
            styles.controlBtn,
            trafficSuppressionEnabled && styles.controlBtnActiveEmerald
          ]}
          onPress={toggleTrafficSuppression}
          activeOpacity={0.7}
        >
          <Ionicons
            name={trafficSuppressionEnabled ? 'shield-checkmark' : 'shield-outline'}
            size={20}
            color={trafficSuppressionEnabled ? THEME.successEmerald : THEME.textMuted}
          />
          <Text style={[
            styles.btnLabel,
            trafficSuppressionEnabled && { color: THEME.successEmerald }
          ]}>
            {trafficSuppressionEnabled ? 'Traffic Cut' : 'Traffic Off'}
          </Text>
        </TouchableOpacity>

        {/* Video Toggle */}
        <TouchableOpacity
          style={[styles.controlBtn, !isVideoEnabled && styles.controlBtnMuted]}
          onPress={toggleVideo}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isVideoEnabled ? 'videocam' : 'videocam-off'}
            size={20}
            color={isVideoEnabled ? THEME.accentCyan : THEME.textMuted}
          />
          <Text style={styles.btnLabel}>{isVideoEnabled ? 'Camera' : 'Cam Off'}</Text>
        </TouchableOpacity>

        {/* Camera Flip (only active when video is on) */}
        {isVideoEnabled && (
          <TouchableOpacity
            style={styles.controlBtn}
            onPress={toggleCameraFlip}
            activeOpacity={0.7}
          >
            <Ionicons name="camera-reverse" size={20} color={THEME.textSecondary} />
            <Text style={styles.btnLabel}>{isFrontCamera ? 'Front' : 'Back'}</Text>
          </TouchableOpacity>
        )}

        {/* Screen Share Toggle */}
        <TouchableOpacity
          style={[styles.controlBtn, isScreenSharing && styles.controlBtnActiveCyan]}
          onPress={onOpenScreenShareModal}
          activeOpacity={0.7}
        >
          <Ionicons
            name="desktop-outline"
            size={20}
            color={isScreenSharing ? '#080B11' : THEME.textPrimary}
          />
          <Text style={[styles.btnLabel, isScreenSharing && { color: THEME.accentCyan }]}>
            {isScreenSharing ? 'Sharing' : 'Share'}
          </Text>
        </TouchableOpacity>

        {/* Speakerphone Toggle */}
        <TouchableOpacity
          style={[styles.controlBtn, isSpeakerOn && styles.controlBtnActiveAccent]}
          onPress={toggleSpeaker}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isSpeakerOn ? 'volume-high' : 'ear-outline'}
            size={20}
            color={isSpeakerOn ? THEME.accentCyan : THEME.textMuted}
          />
          <Text style={styles.btnLabel}>{isSpeakerOn ? 'Speaker' : 'Ear'}</Text>
        </TouchableOpacity>

        {/* End Call Button */}
        <TouchableOpacity
          style={styles.endCallBtn}
          onPress={leaveCall}
          activeOpacity={0.8}
        >
          <Ionicons name="call" size={20} color="#FFF" style={styles.phoneIconRotated} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  controlsWrapper: {
    backgroundColor: '#0A0E17',
    borderTopWidth: 1,
    borderTopColor: THEME.borderLight,
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 14,
  },
  topTelemetryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  tierButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.bgCard,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: THEME.radiusSm,
    borderWidth: 1,
    gap: 4,
  },
  tierButtonLabel: {
    fontSize: 10,
    fontWeight: '800',
  },
  tierRateText: {
    fontSize: 9,
    color: THEME.textSecondary,
    fontWeight: '600',
  },
  trafficShieldPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    gap: 4,
  },
  trafficShieldActive: {
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
    borderColor: 'rgba(0, 230, 118, 0.35)',
  },
  trafficShieldInactive: {
    backgroundColor: THEME.bgCard,
    borderColor: THEME.borderLight,
  },
  trafficShieldText: {
    fontSize: 9,
    fontWeight: '700',
  },
  screenSharePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(127, 0, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(127, 0, 255, 0.4)',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  screenSharePillText: {
    fontSize: 9,
    color: THEME.accentViolet,
    fontWeight: '700',
  },
  dataAnalyticsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.3)',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  dataAnalyticsText: {
    color: THEME.successEmerald,
    fontSize: 9,
    fontWeight: '700',
  },
  buttonsDock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  controlBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: THEME.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.borderLight,
  },
  controlBtnDanger: {
    backgroundColor: THEME.dangerRose,
    borderColor: THEME.dangerRose,
  },
  controlBtnMuted: {
    backgroundColor: '#121620',
  },
  controlBtnActiveCyan: {
    backgroundColor: THEME.accentCyan,
    borderColor: THEME.accentCyan,
  },
  controlBtnActiveEmerald: {
    borderColor: THEME.successEmerald,
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
  },
  controlBtnActiveAccent: {
    borderColor: THEME.accentCyan,
  },
  btnLabel: {
    fontSize: 7.5,
    color: THEME.textSecondary,
    fontWeight: '600',
    marginTop: 1,
  },
  endCallBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: THEME.dangerRose,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: THEME.dangerRose,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 6,
  },
  phoneIconRotated: {
    transform: [{ rotate: '135deg' }],
  },
});
