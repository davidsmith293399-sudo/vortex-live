import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../theme/colors';
import { SCREEN_SHARE_MODES } from '../../constants/dataTiers';
import { useBandwidth } from '../../context/BandwidthContext';
import { useCall } from '../../context/CallContext';

export const ScreenShareModal = ({ visible, onClose }) => {
  const { screenShareModeId, setScreenShareModeId, currentScreenShareMode } = useBandwidth();
  const { isScreenSharing, toggleScreenShare } = useCall();

  const handleSelectMode = (modeId) => {
    setScreenShareModeId(modeId);
  };

  const handleToggleBroadcast = () => {
    toggleScreenShare(!isScreenSharing);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Ionicons name="desktop" size={22} color={THEME.accentViolet} />
              <View>
                <Text style={styles.title}>High-Definition Screen Sharing</Text>
                <Text style={styles.subtitle}>
                  Ultra-sharp 60 FPS streaming with auto-fit & full-screen support
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={THEME.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Current Broadcast Status Box */}
          <View style={[
            styles.statusBox,
            isScreenSharing ? styles.statusBoxActive : styles.statusBoxInactive
          ]}>
            <View style={styles.statusIndicator}>
              <View style={[
                styles.statusDot,
                { backgroundColor: isScreenSharing ? THEME.successEmerald : THEME.textMuted }
              ]} />
              <Text style={styles.statusLabel}>
                {isScreenSharing ? 'SCREEN BROADCASTING ACTIVE' : 'BROADCAST IDLE'}
              </Text>
            </View>
            <Text style={styles.statusDetail}>
              {isScreenSharing
                ? `Currently transmitting at ${currentScreenShareMode.fps} FPS (~${currentScreenShareMode.estimatedMbPerMin} MB/min)`
                : 'Select an Ultra-Sharp 60 FPS profile or Eco preset below to begin broadcasting.'}
            </Text>
          </View>

          {/* Frame Rate & Bandwidth Tiers List */}
          <Text style={styles.sectionHeading}>SELECT BANDWIDTH PRESET:</Text>
          <ScrollView contentContainerStyle={styles.modesList} showsVerticalScrollIndicator={false}>
            {SCREEN_SHARE_MODES.map((mode) => {
              const isSelected = screenShareModeId === mode.id;
              return (
                <TouchableOpacity
                  key={mode.id}
                  style={[
                    styles.modeCard,
                    isSelected && styles.modeCardSelected
                  ]}
                  onPress={() => handleSelectMode(mode.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.modeTop}>
                    <View style={styles.radioBlock}>
                      <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                        {isSelected && <View style={styles.radioDot} />}
                      </View>
                      <View>
                        <Text style={styles.modeName}>{mode.name}</Text>
                        <Text style={styles.modeFps}>{mode.fps} FPS • {mode.resolution}</Text>
                      </View>
                    </View>

                    <View style={styles.rateBox}>
                      <Text style={styles.rateValue}>{mode.estimatedMbPerMin}</Text>
                      <Text style={styles.rateUnit}>MB / min</Text>
                    </View>
                  </View>

                  <View style={styles.badgeRow}>
                    <View style={styles.ecoBadge}>
                      <Text style={styles.ecoBadgeText}>{mode.badge}</Text>
                    </View>
                  </View>

                  <Text style={styles.modeDesc}>{mode.description}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Action Button: Start or Stop Broadcast */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[
                styles.mainActionBtn,
                isScreenSharing ? styles.stopBtn : styles.startBtn
              ]}
              onPress={handleToggleBroadcast}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isScreenSharing ? 'stop-circle' : 'share-outline'}
                size={18}
                color="#FFF"
              />
              <Text style={styles.mainActionBtnText}>
                {isScreenSharing ? 'Stop Screen Sharing' : 'Start Eco Screen Share'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(4, 7, 12, 0.85)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: THEME.bgSurface,
    borderTopLeftRadius: THEME.radiusXl,
    borderTopRightRadius: THEME.radiusXl,
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(138, 43, 226, 0.4)',
    paddingBottom: 24,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.borderLight,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    color: THEME.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  subtitle: {
    color: THEME.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 15,
    backgroundColor: THEME.bgCard,
  },
  statusBox: {
    marginHorizontal: 14,
    marginTop: 12,
    padding: 12,
    borderRadius: THEME.radiusMd,
    borderWidth: 1,
  },
  statusBoxActive: {
    backgroundColor: 'rgba(0, 230, 118, 0.08)',
    borderColor: 'rgba(0, 230, 118, 0.3)',
  },
  statusBoxInactive: {
    backgroundColor: THEME.bgCard,
    borderColor: THEME.borderLight,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.textPrimary,
    letterSpacing: 0.5,
  },
  statusDetail: {
    color: THEME.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
  sectionHeading: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.textMuted,
    letterSpacing: 0.5,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 8,
  },
  modesList: {
    paddingHorizontal: 14,
    gap: 10,
  },
  modeCard: {
    backgroundColor: THEME.bgCard,
    borderRadius: THEME.radiusMd,
    padding: 12,
    borderWidth: 1.5,
    borderColor: THEME.borderLight,
  },
  modeCardSelected: {
    borderColor: THEME.accentViolet,
    backgroundColor: '#17182E',
  },
  modeTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  radioBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: THEME.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: THEME.accentViolet,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.accentViolet,
  },
  modeName: {
    color: THEME.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  modeFps: {
    color: THEME.textMuted,
    fontSize: 10,
    marginTop: 1,
  },
  rateBox: {
    alignItems: 'flex-end',
  },
  rateValue: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME.accentViolet,
  },
  rateUnit: {
    fontSize: 9,
    color: THEME.textMuted,
  },
  badgeRow: {
    marginTop: 8,
  },
  ecoBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(138, 43, 226, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ecoBadgeText: {
    color: THEME.accentViolet,
    fontSize: 9,
    fontWeight: '800',
  },
  modeDesc: {
    color: THEME.textSecondary,
    fontSize: 10,
    marginTop: 6,
    lineHeight: 14,
  },
  actionRow: {
    paddingHorizontal: 14,
    paddingTop: 16,
  },
  mainActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: THEME.radiusMd,
  },
  startBtn: {
    backgroundColor: THEME.accentViolet,
  },
  stopBtn: {
    backgroundColor: THEME.dangerRose,
  },
  mainActionBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
