import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../theme/colors';
import { useCall } from '../../context/CallContext';
import { useBandwidth } from '../../context/BandwidthContext';
import { useAuth } from '../../context/AuthContext';

export const UserStatusBar = ({ onOpenSettings }) => {
  const { isMuted, toggleMute, isDeafened, toggleDeafen } = useCall();
  const { extremeDataSaver, currentTier } = useBandwidth();
  const { currentUser, signOut } = useAuth();

  const displayName = currentUser?.name || 'CyberPilot';
  const displayEmail = currentUser?.email || 'alex.rivera@gmail.com';
  const isGoogle = currentUser?.provider === 'google';

  return (
    <View style={styles.statusBarContainer}>
      {/* Avatar & User Info */}
      <View style={styles.userProfile}>
        <View style={[styles.avatar, { backgroundColor: THEME.accentCyan }]}>
          <Text style={styles.avatarLetter}>{displayName.charAt(0)}</Text>
          {/* Status Indicator */}
          <View style={[
            styles.statusDot,
            { backgroundColor: extremeDataSaver ? THEME.successEmerald : THEME.accentCyan }
          ]} />
        </View>

        <View style={styles.nameBlock}>
          <View style={styles.nameRow}>
            <Text style={styles.usernameText} numberOfLines={1}>
              {displayName}
            </Text>
            {isGoogle && (
              <Ionicons name="logo-google" size={10} color="#EA4335" style={{ marginLeft: 3 }} />
            )}
          </View>
          <Text style={styles.ecoStatusText} numberOfLines={1}>
            {displayEmail}
          </Text>
        </View>
      </View>

      {/* Media Action Icons */}
      <View style={styles.actionButtons}>
        {/* Mute Mic */}
        <TouchableOpacity
          style={[styles.iconButton, isMuted && styles.iconButtonDanger]}
          onPress={toggleMute}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isMuted ? 'mic-off' : 'mic'}
            size={16}
            color={isMuted ? THEME.dangerRose : THEME.textSecondary}
          />
        </TouchableOpacity>

        {/* Deafen Audio */}
        <TouchableOpacity
          style={[styles.iconButton, isDeafened && styles.iconButtonDanger]}
          onPress={toggleDeafen}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isDeafened ? 'volume-mute' : 'headset'}
            size={16}
            color={isDeafened ? THEME.dangerRose : THEME.textSecondary}
          />
        </TouchableOpacity>

        {/* Quick Settings */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onOpenSettings}
          activeOpacity={0.7}
        >
          <Ionicons name="settings-sharp" size={16} color={THEME.textSecondary} />
        </TouchableOpacity>

        {/* Quick Sign Out */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={signOut}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={16} color={THEME.dangerRose} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statusBarContainer: {
    height: 52,
    backgroundColor: '#090D15',
    borderTopWidth: 1,
    borderTopColor: THEME.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 6,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatarLetter: {
    color: '#080B11',
    fontWeight: '800',
    fontSize: 14,
  },
  statusDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#090D15',
  },
  nameBlock: {
    marginLeft: 8,
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  usernameText: {
    color: THEME.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  ecoStatusText: {
    color: THEME.textMuted,
    fontSize: 9,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonDanger: {
    backgroundColor: 'rgba(255, 51, 102, 0.15)',
  },
});
