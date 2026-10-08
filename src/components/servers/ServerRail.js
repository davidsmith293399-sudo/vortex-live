import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../theme/colors';
import { useCall } from '../../context/CallContext';

export const ServerRail = ({ onOpenServerModal }) => {
  const { servers, activeServerId, setActiveServerId, setActiveChannelId } = useCall();

  const handleSelectServer = (server) => {
    setActiveServerId(server.id);
    if (server.channels && server.channels.length > 0) {
      setActiveChannelId(server.channels[0].id);
    }
  };

  return (
    <View style={styles.railContainer}>
      {/* Vortex Home Icon */}
      <TouchableOpacity
        style={[
          styles.serverIcon,
          styles.vortexHomeIcon,
          activeServerId === 'home' && styles.serverIconActive
        ]}
        onPress={() => setActiveServerId(servers[0].id)}
        activeOpacity={0.8}
      >
        <Ionicons name="flash" size={22} color="#00F2FE" />
      </TouchableOpacity>

      <View style={styles.separator} />

      {/* Community Guilds */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {servers.map((server) => {
          const isActive = server.id === activeServerId;
          const hasImage = !!server.imageUrl;

          return (
            <View key={server.id} style={styles.serverRow}>
              {/* Active Indicator Bar on the left */}
              {isActive && <View style={styles.activePill} />}
              
              <TouchableOpacity
                style={[
                  styles.serverIcon,
                  { backgroundColor: isActive ? server.iconColor : THEME.bgCard },
                  isActive && styles.serverIconSelected,
                  hasImage && styles.serverIconImageContainer
                ]}
                onPress={() => handleSelectServer(server)}
                activeOpacity={0.7}
              >
                {hasImage ? (
                  <Image source={{ uri: server.imageUrl }} style={styles.serverCustomImage} />
                ) : (
                  <Text
                    style={[
                      styles.initialsText,
                      { color: isActive ? '#080B11' : server.iconColor }
                    ]}
                  >
                    {server.initials}
                  </Text>
                )}

                {/* Unread badge */}
                {server.unreadCount > 0 && !isActive && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{server.unreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          );
        })}

        {/* Add Server Button */}
        <TouchableOpacity
          style={[styles.serverIcon, styles.addServerIcon]}
          onPress={onOpenServerModal}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={24} color={THEME.successEmerald} />
        </TouchableOpacity>
      </ScrollView>

      {/* Extreme Data Saver indicator badge at the bottom of the rail */}
      <View style={styles.bottomPill}>
        <Ionicons name="shield-checkmark" size={16} color={THEME.accentCyan} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  railContainer: {
    width: 68,
    backgroundColor: THEME.serverRailBg,
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10,
    borderRightWidth: 1,
    borderRightColor: THEME.borderLight,
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: 4,
    gap: 12,
  },
  serverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    width: '100%',
    justifyContent: 'center',
  },
  activePill: {
    position: 'absolute',
    left: 0,
    width: 4,
    height: 36,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    backgroundColor: THEME.textPrimary,
  },
  serverIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  serverIconImageContainer: {
    backgroundColor: '#0F1626',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  serverCustomImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  vortexHomeIcon: {
    backgroundColor: '#0E1E2C',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 242, 254, 0.4)',
    marginBottom: 6,
  },
  serverIconSelected: {
    borderRadius: 16,
    shadowColor: THEME.accentCyan,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 4,
  },
  initialsText: {
    fontSize: 15,
    fontWeight: '800',
  },
  separator: {
    width: 32,
    height: 2,
    backgroundColor: THEME.borderLight,
    marginVertical: 6,
    borderRadius: 1,
  },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: THEME.dangerRose,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: THEME.serverRailBg,
  },
  unreadText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  addServerIcon: {
    backgroundColor: THEME.bgCard,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(0, 230, 118, 0.4)',
  },
  bottomPill: {
    marginTop: 'auto',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
