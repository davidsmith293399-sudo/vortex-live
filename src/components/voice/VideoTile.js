import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../theme/colors';
import { useBandwidth } from '../../context/BandwidthContext';

export const VideoTile = ({ participant, isMe }) => {
  const { currentTier } = useBandwidth();

  const isSpeaking = participant.isSpeaking && !participant.isMuted;
  const isVideoOn = participant.isVideoOn;
  const displayTier = isMe ? currentTier.shortLabel : (participant.currentTier || '360p');

  // Animated wave heights
  const [waveHeights, setWaveHeights] = useState([8, 14, 18, 10]);

  useEffect(() => {
    let interval = null;
    if (isSpeaking) {
      interval = setInterval(() => {
        setWaveHeights([
          Math.floor(Math.random() * 12) + 6,
          Math.floor(Math.random() * 18) + 8,
          Math.floor(Math.random() * 22) + 10,
          Math.floor(Math.random() * 14) + 6,
        ]);
      }, 150);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSpeaking]);

  return (
    <View style={[
      styles.tileContainer,
      isSpeaking && styles.tileSpeakingBorder,
    ]}>
      {/* Video Stream or Avatar Box */}
      {isVideoOn ? (
        <View style={styles.simulatedVideo}>
          {/* Colorful Aurora Gradient Backdrop */}
          <View style={[styles.videoBackdrop, { backgroundColor: '#09101F' }]}>
            <View style={[styles.ambientGlow, { backgroundColor: participant.avatarColor }]} />
            <View style={[styles.videoAvatarBadge, { borderColor: participant.avatarColor }]}>
              <Ionicons name="person" size={42} color={participant.avatarColor} />
            </View>

            {/* Live Video Watermark Overlay */}
            <View style={styles.liveStreamOverlay}>
              <View style={styles.cameraLiveDot} />
              <Text style={styles.cameraLiveText}>WEBRTC 60FPS SYNC</Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.avatarFallback}>
          <View style={[
            styles.largeAvatar,
            { backgroundColor: participant.avatarColor },
            isSpeaking && styles.avatarSpeakingGlow
          ]}>
            <Text style={styles.largeAvatarText}>{participant.name.charAt(0)}</Text>
          </View>

          {/* Real-time Dynamic Voice Waveform visualizer */}
          {isSpeaking && (
            <View style={styles.soundWaveRow}>
              {waveHeights.map((h, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.soundBar,
                    { height: h, backgroundColor: THEME.speakingGlow }
                  ]}
                />
              ))}
            </View>
          )}
        </View>
      )}

      {/* Top Left: Resolution & Low-Bandwidth Watermark */}
      <View style={styles.topBadgeRow}>
        <View style={[styles.tierPill, { backgroundColor: 'rgba(8, 12, 20, 0.9)' }]}>
          <Text style={[styles.tierPillText, { color: isMe ? currentTier.tagColor : THEME.accentCyan }]}>
            {displayTier}
          </Text>
        </View>

        {isSpeaking && (
          <View style={styles.speakingTag}>
            <View style={styles.speakingMiniDot} />
            <Text style={styles.speakingTagText}>SPEAKING</Text>
          </View>
        )}
      </View>

      {/* Top Right: Network Quality & Ping */}
      <View style={styles.topRightStats}>
        <Ionicons name="wifi" size={11} color={THEME.successEmerald} />
        <Text style={styles.pingText}>{participant.pingMs || 28}ms</Text>
      </View>

      {/* Bottom Bar: Participant Name & Mic Status */}
      <View style={styles.bottomBar}>
        <View style={styles.nameRow}>
          <Text style={styles.participantName} numberOfLines={1}>
            {participant.name}
          </Text>
        </View>

        <View style={styles.statusIcons}>
          {participant.isMuted && (
            <View style={styles.muteBadge}>
              <Ionicons name="mic-off" size={11} color="#FFF" />
            </View>
          )}
          {!isVideoOn && (
            <View style={styles.videoOffBadge}>
              <Ionicons name="videocam-off" size={11} color={THEME.textMuted} />
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tileContainer: {
    flex: 1,
    minHeight: 155,
    backgroundColor: THEME.bgCard,
    borderRadius: THEME.radiusLg,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    margin: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  tileSpeakingBorder: {
    borderColor: THEME.speakingGlow,
    shadowColor: THEME.speakingGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 8,
  },
  simulatedVideo: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  videoBackdrop: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  ambientGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    opacity: 0.15,
  },
  videoAvatarBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#0D1526',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  liveStreamOverlay: {
    position: 'absolute',
    bottom: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(5, 8, 14, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cameraLiveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: THEME.successEmerald,
  },
  cameraLiveText: {
    color: '#E2E8F0',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  avatarFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0E17',
  },
  largeAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  avatarSpeakingGlow: {
    borderWidth: 3,
    borderColor: THEME.speakingGlow,
  },
  largeAvatarText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900',
  },
  soundWaveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 10,
    height: 24,
    justifyContent: 'center',
  },
  soundBar: {
    width: 3.5,
    borderRadius: 2,
  },
  topBadgeRow: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  tierPill: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  tierPillText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  speakingTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 230, 118, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 0.8,
    borderColor: THEME.speakingGlow,
  },
  speakingMiniDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: THEME.speakingGlow,
  },
  speakingTagText: {
    color: THEME.speakingGlow,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  topRightStats: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(5, 8, 14, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  pingText: {
    color: '#E2E8F0',
    fontSize: 9,
    fontWeight: '700',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(9, 13, 22, 0.92)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  nameRow: {
    flex: 1,
    marginRight: 6,
  },
  participantName: {
    color: THEME.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  muteBadge: {
    backgroundColor: THEME.dangerRose,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoOffBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
