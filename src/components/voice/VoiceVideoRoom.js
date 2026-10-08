import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../theme/colors';
import { useCall } from '../../context/CallContext';
import { useBandwidth } from '../../context/BandwidthContext';
import { VideoTile } from './VideoTile';
import { CallControlsBar } from './CallControlsBar';
import { ScreenShareViewer } from './ScreenShareViewer';
import { playJoinSound, playLeaveSound } from '../../utils/soundEffects';

export const VoiceVideoRoom = ({
  onOpenResolutionPicker,
  onOpenSavingsModal,
  onOpenScreenShareModal
}) => {
  const {
    activeCall,
    participants,
    isScreenSharing,
    callToast,
    simulatePeerJoin,
    simulatePeerLeave,
  } = useCall();

  const {
    currentTier,
    accumulatedMb,
    callDurationSeconds,
    savingsMb,
    savingsPercent,
    currentScreenShareMode
  } = useBandwidth();

  // Format MM:SS
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remSecs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.roomContainer}>
      {/* Floating Neon Notification Toast for Join / Leave Events */}
      {callToast && (
        <View style={[
          styles.toastContainer,
          callToast.type === 'join' ? styles.toastJoin : styles.toastLeave
        ]}>
          <Ionicons
            name={callToast.type === 'join' ? 'notifications' : 'exit'}
            size={16}
            color={callToast.type === 'join' ? THEME.successEmerald : THEME.dangerRose}
          />
          <Text style={styles.toastText}>{callToast.message}</Text>
          <View style={[
            styles.toastPill,
            { backgroundColor: callToast.type === 'join' ? 'rgba(0, 230, 118, 0.2)' : 'rgba(255, 51, 102, 0.2)' }
          ]}>
            <Text style={[
              styles.toastPillText,
              { color: callToast.type === 'join' ? THEME.successEmerald : THEME.dangerRose }
            ]}>
              {callToast.type === 'join' ? 'CONNECTED' : 'DISCONNECTED'}
            </Text>
          </View>
        </View>
      )}

      {/* Room Header with Channel Name & Live Duration */}
      <View style={styles.roomHeader}>
        <View style={styles.roomHeaderLeft}>
          <View style={styles.liveBadge}>
            <View style={styles.livePulse} />
            <Text style={styles.liveText}>CRYSTAL CALL ACTIVE</Text>
          </View>
          <Text style={styles.roomTitle} numberOfLines={1}>
            {activeCall?.channelName || 'Vortex Lounge'}
          </Text>
        </View>

        <View style={styles.roomHeaderRight}>
          <View style={styles.callTimerBadge}>
            <Ionicons name="time-outline" size={13} color={THEME.accentCyan} />
            <Text style={styles.timerText}>{formatTime(callDurationSeconds)}</Text>
          </View>
        </View>
      </View>

      {/* Live WebRTC Real-Time Calling Banner */}
      <TouchableOpacity
        style={styles.liveWebrtcBanner}
        onPress={() => Linking.openURL('https://vortex-live-1.onrender.com')}
        activeOpacity={0.8}
      >
        <View style={styles.liveWebrtcLeft}>
          <Ionicons name="videocam" size={16} color="#00F2FE" />
          <View>
            <Text style={styles.liveWebrtcTitle}>WebRTC HD Video & 60 FPS Gaming</Text>
            <Text style={styles.liveWebrtcSubtitle}>Tap to open live room & invite distant friends</Text>
          </View>
        </View>
        <View style={styles.liveWebrtcBtn}>
          <Text style={styles.liveWebrtcBtnText}>Connect</Text>
          <Ionicons name="open-outline" size={11} color="#080B11" />
        </View>
      </TouchableOpacity>

      {/* Live Bandwidth & Data Consumption Telemetry HUD */}
      <View style={styles.telemetryHUD}>
        <View style={styles.hudStatBox}>
          <Text style={styles.hudStatLabel}>SESSION DATA</Text>
          <View style={styles.hudValueRow}>
            <Text style={styles.hudStatValue}>{accumulatedMb.toFixed(2)}</Text>
            <Text style={styles.hudStatUnit}>MB</Text>
          </View>
        </View>

        <View style={styles.hudDivider} />

        <View style={styles.hudStatBox}>
          <Text style={styles.hudStatLabel}>CONSUMPTION RATE</Text>
          <View style={styles.hudValueRow}>
            <Text style={[styles.hudStatValue, { color: currentTier.tagColor }]}>
              {currentTier.estimatedMbPerMin}
            </Text>
            <Text style={styles.hudStatUnit}>MB/min</Text>
          </View>
        </View>

        <View style={styles.hudDivider} />

        <View style={styles.hudStatBox}>
          <Text style={styles.hudStatLabel}>BANDWIDTH SAVED</Text>
          <View style={styles.hudValueRow}>
            <Text style={[styles.hudStatValue, { color: THEME.successEmerald }]}>
              {savingsMb}
            </Text>
            <Text style={styles.hudStatUnit}>MB ({savingsPercent})</Text>
          </View>
        </View>
      </View>

      {/* Deep AI Traffic & Street Noise Cancellation Active Banner */}
      <View style={styles.trafficBanner}>
        <View style={styles.trafficBannerLeft}>
          <View style={styles.trafficShieldIconCircle}>
            <Ionicons name="shield-checkmark" size={14} color={THEME.successEmerald} />
          </View>
          <View>
            <Text style={styles.trafficBannerTitle}>AI TRAFFIC NOISE CANCELLATION: ACTIVE</Text>
            <Text style={styles.trafficBannerSub}>
              Car horns, engine hum & street rumble suppressed (-42 dB) • Voice crystal clear
            </Text>
          </View>
        </View>
        <View style={styles.trafficStatusBadge}>
          <Text style={styles.trafficStatusBadgeText}>ISOLATED</Text>
        </View>
      </View>

      {/* Interactive Sound Effects & Peer Simulation Bar */}
      <View style={styles.soundSimulationBar}>
        <Text style={styles.soundBarLabel}>SOUND CHIMES & PEER EVENTS:</Text>
        <View style={styles.soundActionsRow}>
          <TouchableOpacity
            style={styles.soundActionBtn}
            onPress={simulatePeerJoin}
            activeOpacity={0.7}
          >
            <Ionicons name="person-add" size={12} color={THEME.successEmerald} />
            <Text style={styles.soundActionTextJoin}>🔔 Peer Join Sound</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.soundActionBtn}
            onPress={simulatePeerLeave}
            activeOpacity={0.7}
          >
            <Ionicons name="person-remove" size={12} color={THEME.dangerRose} />
            <Text style={styles.soundActionTextLeave}>👋 Peer Leave Sound</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Room Body */}
      <ScrollView
        style={styles.roomScrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Screen Share Stage with High-Definition 60 FPS & Full Screen Experience */}
        {isScreenSharing && (
          <ScreenShareViewer />
        )}

        {/* Video / Voice Participant Grid */}
        <View style={styles.tilesGrid}>
          {participants.map(participant => (
            <View key={participant.id} style={styles.tileWrapper}>
              <VideoTile
                participant={participant}
                isMe={participant.isMe}
              />
            </View>
          ))}
        </View>

        {/* Codec & Optimization Pill Footer */}
        <View style={styles.codecPillFooter}>
          <Ionicons name="radio" size={14} color={THEME.accentCyan} />
          <Text style={styles.codecInfoText}>
            Audio: {currentTier.audioCodec} • Video: {currentTier.videoCodec} • Dual Chimes Active
          </Text>
        </View>
      </ScrollView>

      {/* In-Call Controls Bottom Dock */}
      <CallControlsBar
        onOpenResolutionPicker={onOpenResolutionPicker}
        onOpenSavingsModal={onOpenSavingsModal}
        onOpenScreenShareModal={onOpenScreenShareModal}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  roomContainer: {
    flex: 1,
    backgroundColor: THEME.bgApp,
    position: 'relative',
  },
  toastContainer: {
    position: 'absolute',
    top: 58,
    left: 14,
    right: 14,
    zIndex: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: THEME.radiusMd,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
  },
  toastJoin: {
    backgroundColor: 'rgba(6, 26, 18, 0.95)',
    borderWidth: 1.5,
    borderColor: THEME.successEmerald,
  },
  toastLeave: {
    backgroundColor: 'rgba(30, 8, 14, 0.95)',
    borderWidth: 1.5,
    borderColor: THEME.dangerRose,
  },
  toastText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  toastPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  toastPillText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  roomHeader: {
    height: 52,
    backgroundColor: THEME.bgSurface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.borderLight,
  },
  roomHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  livePulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.successEmerald,
  },
  liveText: {
    fontSize: 9,
    fontWeight: '800',
    color: THEME.successEmerald,
    letterSpacing: 0.5,
  },
  roomTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.textPrimary,
  },
  roomHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  callTimerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.bgCard,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: THEME.radiusSm,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.2)',
  },
  timerText: {
    color: THEME.accentCyan,
    fontSize: 11,
    fontWeight: '800',
  },
  telemetryHUD: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#090E18',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.borderLight,
  },
  hudStatBox: {
    alignItems: 'center',
  },
  hudStatLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: THEME.textMuted,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  hudValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  hudStatValue: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.textPrimary,
  },
  hudStatUnit: {
    fontSize: 9,
    fontWeight: '600',
    color: THEME.textMuted,
  },
  hudDivider: {
    width: 1,
    height: 24,
    backgroundColor: THEME.borderLight,
  },
  soundSimulationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0D1424',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 242, 254, 0.15)',
  },
  soundBarLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: THEME.textMuted,
    letterSpacing: 0.5,
  },
  soundActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  soundActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: THEME.bgCard,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: THEME.borderLight,
  },
  soundActionTextJoin: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.successEmerald,
  },
  soundActionTextLeave: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.dangerRose,
  },
  roomScrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 8,
    paddingBottom: 20,
  },
  screenShareStage: {
    backgroundColor: '#0D1322',
    borderRadius: THEME.radiusMd,
    borderWidth: 1.5,
    borderColor: 'rgba(138, 43, 226, 0.4)',
    overflow: 'hidden',
    marginBottom: 10,
  },
  screenShareHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#121A2E',
  },
  screenShareTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  screenShareTitle: {
    color: THEME.textPrimary,
    fontSize: 11,
    fontWeight: '700',
  },
  sceneSwitchRow: {
    flexDirection: 'row',
    gap: 5,
  },
  scenePill: {
    backgroundColor: THEME.bgCard,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  scenePillActive: {
    backgroundColor: THEME.accentViolet,
  },
  scenePillText: {
    fontSize: 9,
    color: THEME.textMuted,
    fontWeight: '700',
  },
  scenePillTextActive: {
    color: '#FFF',
  },
  screenDisplay: {
    height: 180,
    backgroundColor: '#080C14',
    position: 'relative',
    justifyContent: 'center',
    padding: 10,
  },
  codePresentationMock: {
    flex: 1,
    backgroundColor: '#06080E',
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: THEME.borderLight,
  },
  mockTerminalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#101626',
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 5,
  },
  mockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  mockTerminalTitle: {
    color: THEME.textMuted,
    fontSize: 9,
    marginLeft: 6,
  },
  mockCodeContent: {
    padding: 8,
  },
  mockCodeLine: {
    fontFamily: 'monospace',
    color: THEME.textSecondary,
    fontSize: 10,
    lineHeight: 14,
  },
  slidesMockBox: {
    flex: 1,
    backgroundColor: '#0B1628',
    borderRadius: 6,
    padding: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slidesTitle: {
    color: THEME.accentCyan,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  slidesSub: {
    color: THEME.textSecondary,
    fontSize: 10,
    marginTop: 4,
  },
  slideBarRow: {
    width: '80%',
    height: 6,
    backgroundColor: THEME.bgCard,
    borderRadius: 3,
    marginVertical: 10,
    overflow: 'hidden',
  },
  slideBarFill: {
    height: '100%',
    backgroundColor: THEME.successEmerald,
  },
  slideStats: {
    color: THEME.textMuted,
    fontSize: 9,
    fontWeight: '600',
  },
  screenShareWatermark: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: THEME.accentCyan,
  },
  watermarkText: {
    color: THEME.accentCyan,
    fontSize: 9,
    fontWeight: '700',
  },
  tilesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  tileWrapper: {
    width: '50%',
    padding: 2,
  },
  codecPillFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    backgroundColor: 'rgba(0, 242, 254, 0.05)',
    paddingVertical: 6,
    borderRadius: THEME.radiusSm,
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.15)',
  },
  codecInfoText: {
    color: THEME.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  trafficBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 230, 118, 0.08)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 230, 118, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  trafficBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 8,
  },
  trafficShieldIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0, 230, 118, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trafficBannerTitle: {
    color: THEME.successEmerald,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  trafficBannerSub: {
    color: THEME.textSecondary,
    fontSize: 9,
    marginTop: 1,
  },
  trafficStatusBadge: {
    backgroundColor: THEME.successEmerald,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  trafficStatusBadgeText: {
    color: '#080B11',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  liveWebrtcBanner: {
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 4,
    backgroundColor: 'rgba(0, 242, 254, 0.08)',
    borderColor: 'rgba(0, 242, 254, 0.3)',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  liveWebrtcLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  liveWebrtcTitle: {
    color: '#00F2FE',
    fontSize: 11,
    fontWeight: '800',
  },
  liveWebrtcSubtitle: {
    color: THEME.textSecondary,
    fontSize: 9,
    marginTop: 1,
  },
  liveWebrtcBtn: {
    backgroundColor: '#00F2FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  liveWebrtcBtnText: {
    color: '#080B11',
    fontSize: 10,
    fontWeight: '900',
  },
});
