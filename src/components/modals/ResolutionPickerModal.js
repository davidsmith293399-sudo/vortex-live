import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../theme/colors';
import { RESOLUTION_TIERS, AUDIO_ONLY_TIER } from '../../constants/dataTiers';
import { useBandwidth } from '../../context/BandwidthContext';

export const ResolutionPickerModal = ({ visible, onClose }) => {
  const {
    activeTierId,
    selectTier,
    extremeDataSaver,
    toggleExtremeDataSaver,
  } = useBandwidth();

  // Call duration projection slider / tab: 15 mins, 30 mins, 60 mins
  const [projectedMinutes, setProjectedMinutes] = useState(30);

  const allTiers = [AUDIO_ONLY_TIER, ...RESOLUTION_TIERS];

  const handleSelect = (tierId) => {
    selectTier(tierId);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerTitleRow}>
              <Ionicons name="speedometer" size={22} color={THEME.accentCyan} />
              <View>
                <Text style={styles.modalTitle}>Resolution & Data Saver</Text>
                <Text style={styles.modalSubtitle}>
                  Choose resolution tier with real-time MB/min limits
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={20} color={THEME.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Extreme Data Saver Master Switch */}
          <View style={styles.masterSwitchBox}>
            <View style={styles.switchInfo}>
              <View style={styles.switchTitleRow}>
                <Ionicons name="leaf" size={16} color={THEME.successEmerald} />
                <Text style={styles.switchTitle}>Extreme Data Saver Mode</Text>
              </View>
              <Text style={styles.switchDesc}>
                Locks stream to ultra-low bitrate codecs (360p / Opus audio).
              </Text>
            </View>
            <Switch
              value={extremeDataSaver}
              onValueChange={toggleExtremeDataSaver}
              thumbColor={extremeDataSaver ? THEME.successEmerald : '#94A3B8'}
              trackColor={{ false: '#334155', true: 'rgba(0, 230, 118, 0.4)' }}
            />
          </View>

          {/* Projection Selector (Calculate projected data for 15m, 30m, 60m) */}
          <View style={styles.projectionHeader}>
            <Text style={styles.projectionTitle}>
              ESTIMATED USAGE FOR A {projectedMinutes}-MIN CALL:
            </Text>
            <View style={styles.timeTabs}>
              {[15, 30, 60].map(mins => (
                <TouchableOpacity
                  key={mins}
                  style={[
                    styles.timeTab,
                    projectedMinutes === mins && styles.timeTabActive
                  ]}
                  onPress={() => setProjectedMinutes(mins)}
                >
                  <Text style={[
                    styles.timeTabText,
                    projectedMinutes === mins && styles.timeTabTextActive
                  ]}>
                    {mins}m
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* List of Tiers: Audio Only, 360p, 480p, 720p, 1080p, 4K */}
          <ScrollView
            style={styles.tiersScrollView}
            contentContainerStyle={styles.tiersList}
            showsVerticalScrollIndicator={false}
          >
            {allTiers.map((tier) => {
              const isSelected = activeTierId === tier.id;
              const projectedMb = (tier.estimatedMbPerMin * projectedMinutes).toFixed(1);

              return (
                <TouchableOpacity
                  key={tier.id}
                  style={[
                    styles.tierCard,
                    isSelected && { borderColor: tier.tagColor, backgroundColor: '#131C2D' },
                  ]}
                  onPress={() => handleSelect(tier.id)}
                  activeOpacity={0.8}
                >
                  {/* Left Column: Radio & Name */}
                  <View style={styles.tierTopRow}>
                    <View style={styles.tierNameContainer}>
                      <View style={[
                        styles.radioCircle,
                        isSelected && { borderColor: tier.tagColor }
                      ]}>
                        {isSelected && (
                          <View style={[styles.radioFill, { backgroundColor: tier.tagColor }]} />
                        )}
                      </View>

                      <View>
                        <View style={styles.tierLabelRow}>
                          <Text style={styles.tierName}>{tier.name}</Text>
                          <View style={[
                            styles.tagBadge,
                            { backgroundColor: `${tier.tagColor}1C`, borderColor: `${tier.tagColor}40` }
                          ]}>
                            <Text style={[styles.tagBadgeText, { color: tier.tagColor }]}>
                              {tier.dataTag}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.codecText}>
                          {tier.videoCodec !== 'Disabled' ? `${tier.resolution} • ${tier.videoCodec}` : tier.audioCodec}
                        </Text>
                      </View>
                    </View>

                    {/* Right Column: Prominent MB/min telemetry */}
                    <View style={styles.consumptionBox}>
                      <Text style={[styles.consumptionValue, { color: tier.tagColor }]}>
                        {tier.estimatedMbPerMin}
                      </Text>
                      <Text style={styles.consumptionUnit}>MB / min</Text>
                    </View>
                  </View>

                  {/* Projection and Details Bottom Row */}
                  <View style={styles.tierBottomRow}>
                    <View style={styles.projectionPill}>
                      <Ionicons name="calculator-outline" size={12} color={THEME.textSecondary} />
                      <Text style={styles.projectionText}>
                        ~{projectedMb} MB for {projectedMinutes} min
                      </Text>
                    </View>

                    {tier.savingsVsNormal && (
                      <Text style={[
                        styles.savingsVsText,
                        { color: tier.savingsVsNormal.startsWith('-') ? THEME.dangerRose : THEME.successEmerald }
                      ]}>
                        {tier.savingsVsNormal.startsWith('-') ? `Consumes ${tier.savingsVsNormal.replace('-', '+')}` : `Saves ${tier.savingsVsNormal}`}
                      </Text>
                    )}
                  </View>

                  {/* Recommendation note */}
                  <Text style={styles.recommendedText}>
                    💡 {tier.recommendedFor}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Footer note */}
          <View style={styles.modalFooter}>
            <Ionicons name="information-circle-outline" size={14} color={THEME.textMuted} />
            <Text style={styles.footerNote}>
              Ultra-low bitrate codecs dynamically adjust to cellular signal drops to prevent dropped calls.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(4, 7, 12, 0.85)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: THEME.bgSurface,
    borderTopLeftRadius: THEME.radiusXl,
    borderTopRightRadius: THEME.radiusXl,
    borderTopWidth: 1.5,
    borderTopColor: THEME.borderHighlight,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  modalHeader: {
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
    flex: 1,
  },
  modalTitle: {
    color: THEME.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  modalSubtitle: {
    color: THEME.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 15,
    backgroundColor: THEME.bgCard,
  },
  masterSwitchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0E1E2C',
    marginHorizontal: 14,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: THEME.radiusMd,
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.3)',
  },
  switchInfo: {
    flex: 1,
    marginRight: 10,
  },
  switchTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  switchTitle: {
    color: THEME.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  switchDesc: {
    color: THEME.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  projectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  projectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.textMuted,
    letterSpacing: 0.5,
  },
  timeTabs: {
    flexDirection: 'row',
    gap: 6,
  },
  timeTab: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: THEME.bgCard,
    borderWidth: 1,
    borderColor: THEME.borderLight,
  },
  timeTabActive: {
    backgroundColor: THEME.accentCyan,
    borderColor: THEME.accentCyan,
  },
  timeTabText: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.textSecondary,
  },
  timeTabTextActive: {
    color: '#080B11',
  },
  tiersScrollView: {
    paddingHorizontal: 14,
  },
  tiersList: {
    gap: 10,
    paddingVertical: 4,
  },
  tierCard: {
    backgroundColor: THEME.bgCard,
    borderRadius: THEME.radiusMd,
    padding: 12,
    borderWidth: 1.5,
    borderColor: THEME.borderLight,
  },
  tierTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tierNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: THEME.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioFill: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  tierLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  tierName: {
    color: THEME.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  tagBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
  },
  tagBadgeText: {
    fontSize: 8,
    fontWeight: '800',
  },
  codecText: {
    color: THEME.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  consumptionBox: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  consumptionValue: {
    fontSize: 16,
    fontWeight: '900',
  },
  consumptionUnit: {
    fontSize: 9,
    color: THEME.textMuted,
    fontWeight: '600',
  },
  tierBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  projectionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  projectionText: {
    color: THEME.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
  savingsVsText: {
    fontSize: 10,
    fontWeight: '700',
  },
  recommendedText: {
    color: THEME.textMuted,
    fontSize: 9,
    marginTop: 6,
    fontStyle: 'italic',
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  footerNote: {
    color: THEME.textMuted,
    fontSize: 10,
    flex: 1,
  },
});
