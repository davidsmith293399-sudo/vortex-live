import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../theme/colors';
import { useBandwidth } from '../../context/BandwidthContext';

export const DataSavingsModal = ({ visible, onClose }) => {
  const {
    accumulatedMb,
    callDurationSeconds,
    savingsMb,
    savingsPercent,
    currentTier,
    resetCallStats,
  } = useBandwidth();

  const formatDuration = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}m ${rem}s`;
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
              <Ionicons name="pie-chart" size={22} color={THEME.successEmerald} />
              <View>
                <Text style={styles.title}>Data Savings Telemetry</Text>
                <Text style={styles.subtitle}>Real-time bandwidth consumption analytics</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={THEME.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {/* Big Hero Savings Box */}
            <View style={styles.heroBox}>
              <Text style={styles.heroLabel}>TOTAL DATA SAVED THIS SESSION</Text>
              <View style={styles.heroValueRow}>
                <Text style={styles.heroNumber}>{savingsMb}</Text>
                <Text style={styles.heroUnit}>MB</Text>
              </View>
              <View style={styles.heroPercentBadge}>
                <Ionicons name="trending-down" size={14} color="#080B11" />
                <Text style={styles.heroPercentText}>{savingsPercent} Less Data Used</Text>
              </View>
            </View>

            {/* Metrics Breakdown Grid */}
            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Actual Used</Text>
                <Text style={[styles.metricValue, { color: currentTier.tagColor }]}>
                  {accumulatedMb.toFixed(2)} MB
                </Text>
                <Text style={styles.metricSub}>VortexChat {currentTier.shortLabel}</Text>
              </View>

              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Standard Benchmark</Text>
                <Text style={[styles.metricValue, { color: THEME.dangerRose }]}>
                  {(+accumulatedMb + +savingsMb).toFixed(2)} MB
                </Text>
                <Text style={styles.metricSub}>Uncompressed 1080p</Text>
              </View>

              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Active Rate</Text>
                <Text style={styles.metricValue}>{currentTier.estimatedMbPerMin} MB/m</Text>
                <Text style={styles.metricSub}>{currentTier.bitrateKbps} kbps</Text>
              </View>

              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Duration</Text>
                <Text style={styles.metricValue}>{formatDuration(callDurationSeconds)}</Text>
                <Text style={styles.metricSub}>Active Live Stream</Text>
              </View>
            </View>

            {/* Why VortexChat Saves Data Section */}
            <View style={styles.infoSection}>
              <Text style={styles.infoTitle}>OPTIMIZATION STACK IN ACTION:</Text>
              
              <View style={styles.stackRow}>
                <Ionicons name="mic-outline" size={16} color={THEME.successEmerald} />
                <View style={styles.stackTextGroup}>
                  <Text style={styles.stackName}>Opus Voice Engine (~0.6 MB/min)</Text>
                  <Text style={styles.stackDetail}>
                    Transmits wideband human voice at 12 kbps with dynamic packet loss concealment.
                  </Text>
                </View>
              </View>

              <View style={styles.stackRow}>
                <Ionicons name="videocam-outline" size={16} color={THEME.accentCyan} />
                <View style={styles.stackTextGroup}>
                  <Text style={styles.stackName}>AV1 & H.264 Constrained Baseline</Text>
                  <Text style={styles.stackDetail}>
                    Downsamples video frames to 360p/480p with minimal macroblock artifacts.
                  </Text>
                </View>
              </View>

              <View style={styles.stackRow}>
                <Ionicons name="cellular-outline" size={16} color={THEME.warningAmber} />
                <View style={styles.stackTextGroup}>
                  <Text style={styles.stackName}>Cellular Budget Guard</Text>
                  <Text style={styles.stackDetail}>
                    Prevents background bandwidth leaks and background video streaming.
                  </Text>
                </View>
              </View>
            </View>

            {/* Reset Stats Button */}
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={resetCallStats}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh" size={14} color={THEME.textMuted} />
              <Text style={styles.resetBtnText}>Reset Session Telemetry</Text>
            </TouchableOpacity>
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
    borderTopColor: 'rgba(0, 230, 118, 0.4)',
    maxHeight: '88%',
    paddingBottom: 20,
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
    gap: 14,
  },
  heroBox: {
    backgroundColor: '#0C2018',
    borderRadius: THEME.radiusMd,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.3)',
  },
  heroLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.textMuted,
    letterSpacing: 0.6,
  },
  heroValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginVertical: 4,
  },
  heroNumber: {
    fontSize: 36,
    fontWeight: '900',
    color: THEME.successEmerald,
  },
  heroUnit: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.successEmerald,
  },
  heroPercentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: THEME.successEmerald,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  heroPercentText: {
    color: '#080B11',
    fontWeight: '800',
    fontSize: 11,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: THEME.bgCard,
    padding: 12,
    borderRadius: THEME.radiusSm,
    borderWidth: 1,
    borderColor: THEME.borderLight,
  },
  metricLabel: {
    fontSize: 10,
    color: THEME.textMuted,
    fontWeight: '700',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.textPrimary,
    marginVertical: 4,
  },
  metricSub: {
    fontSize: 9,
    color: THEME.textMuted,
  },
  infoSection: {
    backgroundColor: THEME.bgCard,
    padding: 14,
    borderRadius: THEME.radiusMd,
    borderWidth: 1,
    borderColor: THEME.borderLight,
    gap: 12,
  },
  infoTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.textMuted,
    letterSpacing: 0.5,
  },
  stackRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  stackTextGroup: {
    flex: 1,
  },
  stackName: {
    color: THEME.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  stackDetail: {
    color: THEME.textSecondary,
    fontSize: 10,
    lineHeight: 14,
    marginTop: 2,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  resetBtnText: {
    color: THEME.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
});
