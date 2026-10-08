import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../theme/colors';
import { useBandwidth } from '../../context/BandwidthContext';
import { useCall } from '../../context/CallContext';

export const Header = ({
  onOpenResolutionPicker,
  onOpenSavingsModal,
  onOpenSettings,
  onToggleMembers,
  showMembersList,
  onOpenLiveRoom,
}) => {
  const {
    currentTier,
    extremeDataSaver,
    toggleExtremeDataSaver,
    accumulatedMb,
    isInCall,
    trafficSuppressionEnabled,
    toggleTrafficSuppression,
  } = useBandwidth();
  const { currentServer, currentChannel } = useCall();

  return (
    <View style={styles.headerContainer}>
      {/* Left: Server and Channel indicator */}
      <View style={styles.leftInfo}>
        <View style={styles.titleRow}>
          <Text style={styles.hashtag}>#</Text>
          <Text style={styles.channelTitle} numberOfLines={1}>
            {currentChannel?.name || 'Vortex Lounge'}
          </Text>
        </View>
        <Text style={styles.serverSubtitle} numberOfLines={1}>
          {currentServer?.name}
        </Text>
      </View>

      {/* Right: Telemetry, AI Traffic Shield, Members & Settings */}
      <View style={styles.rightActions}>
        {/* Live Bandwidth Indicator Button */}
        <TouchableOpacity
          style={[
            styles.telemetryPill,
            isInCall && styles.telemetryPillActive,
            { borderColor: currentTier.tagColor }
          ]}
          onPress={onOpenResolutionPicker}
          activeOpacity={0.8}
        >
          <View style={[styles.pulseDot, { backgroundColor: currentTier.tagColor }]} />
          <View>
            <Text style={[styles.tierLabel, { color: currentTier.tagColor }]}>
              {currentTier.shortLabel}
            </Text>
            <Text style={styles.rateText}>
              {currentTier.estimatedMbPerMin} MB/min
            </Text>
          </View>
        </TouchableOpacity>

        {/* AI Traffic Shield Button */}
        <TouchableOpacity
          style={[
            styles.trafficButton,
            trafficSuppressionEnabled && styles.trafficButtonActive
          ]}
          onPress={toggleTrafficSuppression}
          activeOpacity={0.7}
        >
          <Ionicons
            name={trafficSuppressionEnabled ? 'shield-checkmark' : 'shield-outline'}
            size={16}
            color={trafficSuppressionEnabled ? THEME.successEmerald : THEME.textMuted}
          />
        </TouchableOpacity>

        {/* Live Call Accumulator Badge */}
        {isInCall && (
          <TouchableOpacity
            style={styles.savingsTrigger}
            onPress={onOpenSavingsModal}
            activeOpacity={0.7}
          >
            <Ionicons name="cellular-sharp" size={14} color={THEME.successEmerald} />
            <Text style={styles.savingsText}>{accumulatedMb.toFixed(1)} MB</Text>
          </TouchableOpacity>
        )}

        {/* Quick Extreme Data Saver Toggle */}
        <TouchableOpacity
          style={[
            styles.ecoButton,
            extremeDataSaver && styles.ecoButtonActive
          ]}
          onPress={toggleExtremeDataSaver}
          activeOpacity={0.7}
        >
          <Ionicons
            name="leaf"
            size={16}
            color={extremeDataSaver ? '#00E676' : THEME.textMuted}
          />
        </TouchableOpacity>

        {/* Online / Offline Member List Toggle */}
        <TouchableOpacity
          style={[
            styles.iconButton,
            showMembersList && styles.iconButtonActive
          ]}
          onPress={onToggleMembers}
          activeOpacity={0.7}
        >
          <Ionicons
            name="people"
            size={17}
            color={showMembersList ? THEME.accentCyan : THEME.textSecondary}
          />
          {/* Green Online Dot badge */}
          <View style={styles.memberOnlineBadge} />
        </TouchableOpacity>

        {/* Live WebRTC Call Trigger */}
        {onOpenLiveRoom && (
          <TouchableOpacity
            style={styles.liveRoomBtn}
            onPress={onOpenLiveRoom}
            activeOpacity={0.7}
          >
            <Ionicons name="videocam" size={14} color="#00F2FE" />
            <Text style={styles.liveRoomBtnText}>LIVE</Text>
          </TouchableOpacity>
        )}

        {/* Settings button */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onOpenSettings}
          activeOpacity={0.7}
        >
          <Ionicons name="settings-outline" size={17} color={THEME.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    height: 60,
    backgroundColor: THEME.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  leftInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hashtag: {
    fontSize: 17,
    fontWeight: '800',
    color: THEME.textMuted,
    marginRight: 4,
  },
  channelTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.textPrimary,
    maxWidth: 160,
  },
  serverSubtitle: {
    fontSize: 11,
    color: THEME.textMuted,
    marginTop: 1,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  telemetryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.bgPill,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: THEME.radiusMd,
    borderWidth: 1,
  },
  telemetryPillActive: {
    backgroundColor: '#0E1E2C',
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  tierLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  rateText: {
    fontSize: 9,
    color: THEME.textSecondary,
    fontWeight: '600',
  },
  trafficButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.borderLight,
  },
  trafficButtonActive: {
    borderColor: THEME.successEmerald,
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
  },
  savingsTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.3)',
    borderRadius: THEME.radiusSm,
    paddingHorizontal: 6,
    paddingVertical: 5,
    gap: 4,
  },
  savingsText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.successEmerald,
  },
  ecoButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.borderLight,
  },
  ecoButtonActive: {
    borderColor: '#00E676',
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.borderLight,
    position: 'relative',
  },
  iconButtonActive: {
    borderColor: THEME.accentCyan,
    backgroundColor: 'rgba(0, 242, 254, 0.12)',
  },
  memberOnlineBadge: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.successEmerald,
  },
  liveRoomBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 32,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 242, 254, 0.15)',
    borderWidth: 1,
    borderColor: '#00F2FE',
  },
  liveRoomBtnText: {
    color: '#00F2FE',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
