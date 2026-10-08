import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../theme/colors';
import { useCall } from '../../context/CallContext';
import { MOCK_PARTICIPANTS } from '../../constants/mockData';

export const ChannelDrawer = ({ onSelectVoiceChannel, onOpenAddChannel }) => {
  const { currentServer, activeChannelId, setActiveChannelId, activeCall, joinCall } = useCall();

  const textChannels = currentServer?.channels.filter(c => c.type === 'text') || [];
  const voiceChannels = currentServer?.channels.filter(c => c.type === 'voice' || c.type === 'video' || c.type === 'screenshare') || [];

  const handleChannelPress = (channel) => {
    if (channel.type === 'text') {
      setActiveChannelId(channel.id);
    } else {
      setActiveChannelId(channel.id);
      if (onSelectVoiceChannel) {
        onSelectVoiceChannel(channel);
      } else {
        joinCall(channel);
      }
    }
  };

  return (
    <View style={styles.drawerContainer}>
      {/* Server Header Card */}
      <View style={styles.serverHeader}>
        <View style={styles.serverTitleBlock}>
          <Text style={styles.serverName} numberOfLines={1}>
            {currentServer?.name}
          </Text>
          <Text style={styles.membersCount}>
            {currentServer?.membersCount} members • Low-Data Server
          </Text>
        </View>
        <TouchableOpacity onPress={onOpenAddChannel} style={styles.serverAddBtn}>
          <Ionicons name="add" size={18} color={THEME.accentCyan} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollList}>
        {/* TEXT CHANNELS SECTION */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="chevron-down-outline" size={12} color={THEME.textMuted} />
            <Text style={styles.sectionTitle}>TEXT CHANNELS</Text>
          </View>
          <TouchableOpacity onPress={onOpenAddChannel} style={styles.addChannelIconBtn}>
            <Ionicons name="add" size={15} color={THEME.textMuted} />
          </TouchableOpacity>
        </View>

        {textChannels.map((channel) => {
          const isSelected = channel.id === activeChannelId;
          const hasCustomPicture = !!channel.iconUrl;

          return (
            <TouchableOpacity
              key={channel.id}
              style={[styles.channelItem, isSelected && styles.channelItemSelected]}
              onPress={() => handleChannelPress(channel)}
              activeOpacity={0.7}
            >
              {hasCustomPicture ? (
                <Image source={{ uri: channel.iconUrl }} style={styles.channelPictureThumb} />
              ) : (
                <Text style={[styles.channelHash, isSelected && styles.channelHashSelected]}>#</Text>
              )}
              <Text
                style={[styles.channelName, isSelected && styles.channelNameSelected]}
                numberOfLines={1}
              >
                {channel.name}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* VOICE & VIDEO LOUNGES SECTION */}
        <View style={[styles.sectionHeader, { marginTop: 18 }]}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="chevron-down-outline" size={12} color={THEME.textMuted} />
            <Text style={styles.sectionTitle}>VOICE & VIDEO LOUNGES</Text>
          </View>
          <TouchableOpacity onPress={onOpenAddChannel} style={styles.addChannelIconBtn}>
            <Ionicons name="add" size={15} color={THEME.textMuted} />
          </TouchableOpacity>
        </View>

        {voiceChannels.map((channel) => {
          const isSelected = channel.id === activeChannelId;
          const isCurrentCall = activeCall?.channelId === channel.id;
          const activePeers = (channel.activeParticipants || []).map(id => MOCK_PARTICIPANTS[id]).filter(Boolean);
          const hasCustomPicture = !!channel.iconUrl;

          let channelIcon = 'volume-medium';
          let tierBadgeText = '0.6 MB/m';
          let badgeColor = THEME.successEmerald;

          if (channel.type === 'video') {
            channelIcon = 'videocam';
            tierBadgeText = '360p • 1.2M';
            badgeColor = THEME.accentCyan;
          } else if (channel.type === 'screenshare') {
            channelIcon = 'desktop';
            tierBadgeText = '5 FPS Eco';
            badgeColor = THEME.accentViolet;
          }

          return (
            <View key={channel.id} style={styles.voiceChannelBlock}>
              <TouchableOpacity
                style={[
                  styles.channelItem,
                  isCurrentCall && styles.channelItemActiveCall,
                  isSelected && !isCurrentCall && styles.channelItemSelected
                ]}
                onPress={() => handleChannelPress(channel)}
                activeOpacity={0.7}
              >
                {hasCustomPicture ? (
                  <Image source={{ uri: channel.iconUrl }} style={styles.channelPictureThumb} />
                ) : (
                  <Ionicons
                    name={channelIcon}
                    size={16}
                    color={isCurrentCall ? THEME.successEmerald : (isSelected ? THEME.accentCyan : THEME.textMuted)}
                    style={styles.voiceIcon}
                  />
                )}
                
                <Text
                  style={[
                    styles.channelName,
                    isCurrentCall && styles.channelNameInCall,
                    isSelected && !isCurrentCall && styles.channelNameSelected
                  ]}
                  numberOfLines={1}
                >
                  {channel.name}
                </Text>

                {/* Eco Data Tier Badge */}
                <View style={[styles.miniBadge, { backgroundColor: `${badgeColor}18`, borderColor: `${badgeColor}40` }]}>
                  <Text style={[styles.miniBadgeText, { color: badgeColor }]}>
                    {tierBadgeText}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Connected Participants List */}
              {activePeers.length > 0 && (
                <View style={styles.participantsList}>
                  {activePeers.map(peer => (
                    <View key={peer.id} style={styles.peerRow}>
                      <View style={[styles.peerAvatar, { backgroundColor: peer.avatarColor }]}>
                        {peer.isSpeaking && <View style={styles.speakingRing} />}
                        <Text style={styles.peerAvatarText}>{peer.name.charAt(0)}</Text>
                      </View>
                      <Text style={styles.peerName} numberOfLines={1}>{peer.name}</Text>
                      {peer.isSpeaking && (
                        <Ionicons name="mic" size={12} color={THEME.successEmerald} style={{ marginLeft: 4 }} />
                      )}
                      {peer.isMuted && (
                        <Ionicons name="mic-off" size={12} color={THEME.dangerRose} style={{ marginLeft: 4 }} />
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  drawerContainer: {
    width: 210,
    backgroundColor: THEME.sidebarBg,
    borderRightWidth: 1,
    borderRightColor: THEME.borderLight,
  },
  serverHeader: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: THEME.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  serverTitleBlock: {
    flex: 1,
  },
  serverName: {
    color: THEME.textPrimary,
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  membersCount: {
    color: THEME.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  serverAddBtn: {
    padding: 4,
  },
  scrollList: {
    paddingHorizontal: 8,
    paddingTop: 12,
    paddingBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingHorizontal: 6,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.textMuted,
    letterSpacing: 0.6,
  },
  addChannelIconBtn: {
    padding: 2,
  },
  channelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: THEME.radiusSm,
    marginBottom: 3,
  },
  channelItemSelected: {
    backgroundColor: THEME.bgCard,
  },
  channelItemActiveCall: {
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
    borderLeftWidth: 3,
    borderLeftColor: THEME.successEmerald,
  },
  channelPictureThumb: {
    width: 18,
    height: 18,
    borderRadius: 5,
    marginRight: 7,
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.4)',
  },
  channelHash: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME.textMuted,
    marginRight: 6,
  },
  channelHashSelected: {
    color: THEME.accentCyan,
  },
  voiceIcon: {
    marginRight: 6,
  },
  channelName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: THEME.textSecondary,
  },
  channelNameSelected: {
    color: THEME.textPrimary,
  },
  channelNameInCall: {
    color: THEME.successEmerald,
    fontWeight: '700',
  },
  miniBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  miniBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  voiceChannelBlock: {
    marginBottom: 4,
  },
  participantsList: {
    paddingLeft: 20,
    paddingTop: 2,
    paddingBottom: 6,
    gap: 5,
  },
  peerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  peerAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginRight: 6,
  },
  speakingRing: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: THEME.successEmerald,
  },
  peerAvatarText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  peerName: {
    fontSize: 11,
    color: THEME.textSecondary,
    maxWidth: 110,
  },
});
