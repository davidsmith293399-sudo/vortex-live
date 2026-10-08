import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../theme/colors';
import { NETWORK_CONDITIONS } from '../../constants/dataTiers';
import { useBandwidth } from '../../context/BandwidthContext';
import { useAuth } from '../../context/AuthContext';
import { playJoinSound, playLeaveSound, isSoundEnabled, setSoundEnabled } from '../../utils/soundEffects';

export const SettingsModal = ({ visible, onClose }) => {
  const {
    extremeDataSaver,
    toggleExtremeDataSaver,
    autoDowngradeCellular,
    setAutoDowngradeCellular,
    networkCondition,
    setNetworkCondition,
    aiNoiseSuppression,
    setAiNoiseSuppression,
  } = useBandwidth();

  const { currentUser, signOut } = useAuth();
  const [soundsActive, setSoundsActive] = useState(isSoundEnabled());

  const handleToggleSounds = (val) => {
    setSoundsActive(val);
    setSoundEnabled(val);
  };

  const handleSignOut = () => {
    signOut();
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
              <Ionicons name="settings" size={22} color={THEME.accentCyan} />
              <View>
                <Text style={styles.title}>VortexChat Settings</Text>
                <Text style={styles.subtitle}>Bandwidth, Sounds & Account Preferences</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={THEME.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {/* CALL SOUND EFFECTS & CHIMES SECTION */}
            <Text style={styles.sectionHeader}>CALL SOUND EFFECTS & CHIMES</Text>
            <View style={styles.settingCard}>
              <View style={styles.settingRow}>
                <View style={styles.settingTextGroup}>
                  <Text style={styles.settingTitle}>Join & Leave Audio Chimes</Text>
                  <Text style={styles.settingSubtitle}>
                    Plays distinct futuristic tones when you or peers enter or exit a call.
                  </Text>
                </View>
                <Switch
                  value={soundsActive}
                  onValueChange={handleToggleSounds}
                  thumbColor={soundsActive ? THEME.successEmerald : '#94A3B8'}
                  trackColor={{ false: '#334155', true: 'rgba(0, 230, 118, 0.4)' }}
                />
              </View>

              <View style={styles.divider} />

              <Text style={styles.subLabel}>TEST SYNTHESIZED AUDIO CHIMES:</Text>
              <View style={styles.soundTestRow}>
                <TouchableOpacity
                  style={[styles.testSoundBtn, styles.testSoundBtnJoin]}
                  onPress={playJoinSound}
                  activeOpacity={0.7}
                >
                  <Ionicons name="volume-high" size={16} color={THEME.successEmerald} />
                  <Text style={styles.testSoundTextJoin}>Play Join Chime</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.testSoundBtn, styles.testSoundBtnLeave]}
                  onPress={playLeaveSound}
                  activeOpacity={0.7}
                >
                  <Ionicons name="volume-mute" size={16} color={THEME.dangerRose} />
                  <Text style={styles.testSoundTextLeave}>Play Leave Chime</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* ACCOUNT & GMAIL SESSION SECTION */}
            <Text style={styles.sectionHeader}>USER ACCOUNT & AUTHENTICATION</Text>
            <View style={styles.accountCard}>
              <View style={styles.accountInfoRow}>
                <View style={styles.avatarMini}>
                  <Text style={styles.avatarMiniText}>
                    {(currentUser?.name || 'U').charAt(0)}
                  </Text>
                </View>
                <View style={styles.accountDetails}>
                  <View style={styles.accountNameLine}>
                    <Text style={styles.accountName}>{currentUser?.name || 'Demo User'}</Text>
                    {currentUser?.provider === 'google' && (
                      <View style={styles.googlePill}>
                        <Ionicons name="logo-google" size={10} color="#EA4335" />
                        <Text style={styles.googlePillText}>Google</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.accountEmail}>{currentUser?.email || 'user@gmail.com'}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.signOutBtn}
                onPress={handleSignOut}
                activeOpacity={0.7}
              >
                <Ionicons name="log-out-outline" size={15} color={THEME.dangerRose} />
                <Text style={styles.signOutBtnText}>Log Out / Switch Gmail Account</Text>
              </TouchableOpacity>
            </View>

            {/* DATA SAVER SECTION */}
            <Text style={styles.sectionHeader}>DATA & BANDWIDTH MANAGEMENT</Text>

            <View style={styles.settingCard}>
              <View style={styles.settingRow}>
                <View style={styles.settingTextGroup}>
                  <Text style={styles.settingTitle}>Extreme Data Saver</Text>
                  <Text style={styles.settingSubtitle}>
                    Locks max resolution to 360p & activates Opus 12kbps voice compression.
                  </Text>
                </View>
                <Switch
                  value={extremeDataSaver}
                  onValueChange={toggleExtremeDataSaver}
                  thumbColor={extremeDataSaver ? THEME.successEmerald : '#94A3B8'}
                  trackColor={{ false: '#334155', true: 'rgba(0, 230, 118, 0.4)' }}
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.settingRow}>
                <View style={styles.settingTextGroup}>
                  <Text style={styles.settingTitle}>Auto-Downgrade on Cellular</Text>
                  <Text style={styles.settingSubtitle}>
                    Automatically switch to 360p or Audio-only when disconnecting from Wi-Fi.
                  </Text>
                </View>
                <Switch
                  value={autoDowngradeCellular}
                  onValueChange={setAutoDowngradeCellular}
                  thumbColor={autoDowngradeCellular ? THEME.accentCyan : '#94A3B8'}
                  trackColor={{ false: '#334155', true: 'rgba(0, 242, 254, 0.4)' }}
                />
              </View>
            </View>

            {/* AUDIO & CODEC OPTIMIZATION */}
            <Text style={styles.sectionHeader}>AUDIO & VOICE CODEC</Text>

            <View style={styles.settingCard}>
              <View style={styles.settingRow}>
                <View style={styles.settingTextGroup}>
                  <Text style={styles.settingTitle}>AI Voice Isolation & Noise Suppression</Text>
                  <Text style={styles.settingSubtitle}>
                    Silences background packets when not speaking (~0.6 MB/min efficiency).
                  </Text>
                </View>
                <Switch
                  value={aiNoiseSuppression}
                  onValueChange={setAiNoiseSuppression}
                  thumbColor={aiNoiseSuppression ? THEME.accentCyan : '#94A3B8'}
                  trackColor={{ false: '#334155', true: 'rgba(0, 242, 254, 0.4)' }}
                />
              </View>
            </View>

            {/* SIMULATED NETWORK TEST */}
            <Text style={styles.sectionHeader}>SIMULATED NETWORK CONDITION</Text>
            <View style={styles.networkGrid}>
              {NETWORK_CONDITIONS.map((cond) => {
                const isSelected = networkCondition.id === cond.id;
                return (
                  <TouchableOpacity
                    key={cond.id}
                    style={[
                      styles.networkPill,
                      isSelected && { borderColor: cond.qualityColor, backgroundColor: '#131C2D' }
                    ]}
                    onPress={() => setNetworkCondition(cond)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="wifi" size={14} color={cond.qualityColor} />
                    <View>
                      <Text style={[styles.networkLabel, isSelected && { color: cond.qualityColor }]}>
                        {cond.label}
                      </Text>
                      <Text style={styles.networkSpeed}>{cond.speed}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* GOOGLE PLAY STORE COMPLIANCE & INFO */}
            <Text style={styles.sectionHeader}>ABOUT & COMPLIANCE</Text>
            <View style={styles.aboutCard}>
              <View style={styles.aboutRow}>
                <Text style={styles.aboutLabel}>Application</Text>
                <Text style={styles.aboutValue}>VortexChat Mobile v1.0.0</Text>
              </View>
              <View style={styles.aboutRow}>
                <Text style={styles.aboutLabel}>Audio Synthesis</Text>
                <Text style={styles.aboutValue}>Interactive Procedural Chimes (Zero Bandwidth)</Text>
              </View>
              <View style={styles.aboutRow}>
                <Text style={styles.aboutLabel}>Voice Engine</Text>
                <Text style={styles.aboutValue}>Opus Interactive Audio Codec (RFC 6716)</Text>
              </View>
              <View style={styles.aboutRow}>
                <Text style={styles.aboutLabel}>Video Compression</Text>
                <Text style={styles.aboutValue}>AV1 / WebRTC Low-Latency Pipeline</Text>
              </View>
            </View>
          </ScrollView>
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
    borderTopColor: THEME.borderHighlight,
    maxHeight: '88%',
    paddingBottom: 24,
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
  content: {
    padding: 14,
    gap: 12,
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.textMuted,
    letterSpacing: 0.6,
    marginTop: 6,
    marginHorizontal: 4,
  },
  subLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: THEME.textMuted,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  soundTestRow: {
    flexDirection: 'row',
    gap: 10,
  },
  testSoundBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: THEME.radiusSm,
    borderWidth: 1,
  },
  testSoundBtnJoin: {
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    borderColor: 'rgba(0, 230, 118, 0.3)',
  },
  testSoundBtnLeave: {
    backgroundColor: 'rgba(255, 51, 102, 0.1)',
    borderColor: 'rgba(255, 51, 102, 0.3)',
  },
  testSoundTextJoin: {
    color: THEME.successEmerald,
    fontSize: 11,
    fontWeight: '700',
  },
  testSoundTextLeave: {
    color: THEME.dangerRose,
    fontSize: 11,
    fontWeight: '700',
  },
  accountCard: {
    backgroundColor: THEME.bgCard,
    borderRadius: THEME.radiusMd,
    padding: 12,
    borderWidth: 1,
    borderColor: THEME.borderLight,
    gap: 10,
  },
  accountInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarMini: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: THEME.accentCyan,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarMiniText: {
    color: '#080B11',
    fontWeight: '800',
    fontSize: 16,
  },
  accountDetails: {
    flex: 1,
  },
  accountNameLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  accountName: {
    color: THEME.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  googlePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(234, 67, 53, 0.12)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  googlePillText: {
    color: '#EA4335',
    fontSize: 9,
    fontWeight: '700',
  },
  accountEmail: {
    color: THEME.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 51, 102, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 51, 102, 0.25)',
    borderRadius: THEME.radiusSm,
    paddingVertical: 8,
  },
  signOutBtnText: {
    color: THEME.dangerRose,
    fontSize: 11,
    fontWeight: '700',
  },
  settingCard: {
    backgroundColor: THEME.bgCard,
    borderRadius: THEME.radiusMd,
    padding: 14,
    borderWidth: 1,
    borderColor: THEME.borderLight,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingTextGroup: {
    flex: 1,
    marginRight: 10,
  },
  settingTitle: {
    color: THEME.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  settingSubtitle: {
    color: THEME.textMuted,
    fontSize: 10,
    lineHeight: 14,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: THEME.borderLight,
    marginVertical: 12,
  },
  networkGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  networkPill: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: THEME.bgCard,
    padding: 10,
    borderRadius: THEME.radiusSm,
    borderWidth: 1,
    borderColor: THEME.borderLight,
  },
  networkLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.textPrimary,
  },
  networkSpeed: {
    fontSize: 9,
    color: THEME.textMuted,
  },
  aboutCard: {
    backgroundColor: THEME.bgCard,
    borderRadius: THEME.radiusMd,
    padding: 14,
    borderWidth: 1,
    borderColor: THEME.borderLight,
    gap: 8,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  aboutLabel: {
    color: THEME.textMuted,
    fontSize: 11,
  },
  aboutValue: {
    color: THEME.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
});
