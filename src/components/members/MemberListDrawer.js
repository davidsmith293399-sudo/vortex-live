import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../theme/colors';
import { MOCK_COMMUNITY_MEMBERS } from '../../constants/mockData';
import { useCall } from '../../context/CallContext';

export const MemberListDrawer = ({ onClose }) => {
  const { joinCall, currentServer } = useCall();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMembers = MOCK_COMMUNITY_MEMBERS.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.customStatus.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onlineMembers = filteredMembers.filter(m => m.status === 'online');
  const offlineMembers = filteredMembers.filter(m => m.status === 'offline');

  const defaultVoiceChannel = currentServer?.channels.find(c => c.type === 'voice');

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Ionicons name="people" size={18} color={THEME.accentCyan} />
          <Text style={styles.title}>Members ({filteredMembers.length})</Text>
        </View>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={18} color={THEME.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Search Input */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={14} color={THEME.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search online members..."
          placeholderTextColor={THEME.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={14} color={THEME.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {/* ONLINE MEMBERS SECTION */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.onlineDot} />
          <Text style={styles.sectionTitle}>ONLINE — {onlineMembers.length}</Text>
        </View>

        {onlineMembers.map((member) => (
          <View key={member.id} style={styles.memberRow}>
            <View style={styles.avatarWrapper}>
              <View style={[styles.avatar, { backgroundColor: member.avatarColor }]}>
                <Text style={styles.avatarLetter}>{member.name.charAt(0)}</Text>
              </View>
              {/* Glowing Emerald Online Dot */}
              <View style={styles.statusIndicatorOnline} />
            </View>

            <View style={styles.memberInfo}>
              <View style={styles.nameLine}>
                <Text style={styles.memberName} numberOfLines={1}>{member.name}</Text>
                {member.role && (
                  <View style={[
                    styles.roleBadge,
                    member.role === 'Admin' ? styles.roleBadgeAdmin : styles.roleBadgeMember
                  ]}>
                    <Text style={[
                      styles.roleText,
                      member.role === 'Admin' ? styles.roleTextAdmin : styles.roleTextMember
                    ]}>
                      {member.role}
                    </Text>
                  </View>
                )}
              </View>

              <Text style={styles.customStatusText} numberOfLines={1}>
                {member.customStatus}
              </Text>
            </View>

            {/* Quick action: Call */}
            {defaultVoiceChannel && (
              <TouchableOpacity
                style={styles.quickCallBtn}
                onPress={() => joinCall(defaultVoiceChannel)}
                activeOpacity={0.7}
              >
                <Ionicons name="call" size={12} color={THEME.successEmerald} />
              </TouchableOpacity>
            )}
          </View>
        ))}

        {/* OFFLINE MEMBERS SECTION */}
        <View style={[styles.sectionHeaderRow, { marginTop: 20 }]}>
          <View style={styles.offlineDot} />
          <Text style={styles.sectionTitle}>OFFLINE — {offlineMembers.length}</Text>
        </View>

        {offlineMembers.map((member) => (
          <View key={member.id} style={[styles.memberRow, styles.memberRowOffline]}>
            <View style={styles.avatarWrapper}>
              <View style={[styles.avatar, styles.avatarOffline, { backgroundColor: member.avatarColor + '55' }]}>
                <Text style={[styles.avatarLetter, { color: '#888' }]}>{member.name.charAt(0)}</Text>
              </View>
              {/* Muted Offline Dot */}
              <View style={styles.statusIndicatorOffline} />
            </View>

            <View style={styles.memberInfo}>
              <View style={styles.nameLine}>
                <Text style={[styles.memberName, styles.memberNameOffline]} numberOfLines={1}>
                  {member.name}
                </Text>
              </View>
              <Text style={styles.lastSeenText} numberOfLines={1}>
                {member.customStatus}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 220,
    backgroundColor: '#0A0E18',
    borderLeftWidth: 1,
    borderLeftColor: THEME.borderLight,
    height: '100%',
  },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.borderLight,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.bgInput,
    marginHorizontal: 10,
    marginTop: 10,
    marginBottom: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: THEME.radiusSm,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    color: THEME.textPrimary,
    fontSize: 11,
    padding: 0,
  },
  list: {
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    paddingHorizontal: 6,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.successEmerald,
  },
  offlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.textMuted,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.textMuted,
    letterSpacing: 0.6,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 6,
    borderRadius: THEME.radiusSm,
    marginBottom: 2,
  },
  memberRowOffline: {
    opacity: 0.6,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 9,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarOffline: {
    borderWidth: 1,
    borderColor: '#334155',
  },
  avatarLetter: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },
  statusIndicatorOnline: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: THEME.successEmerald,
    borderWidth: 2,
    borderColor: '#0A0E18',
  },
  statusIndicatorOffline: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: THEME.textMuted,
    borderWidth: 2,
    borderColor: '#0A0E18',
  },
  memberInfo: {
    flex: 1,
  },
  nameLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  memberName: {
    color: THEME.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  memberNameOffline: {
    color: THEME.textSecondary,
  },
  roleBadge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  roleBadgeAdmin: {
    backgroundColor: 'rgba(0, 242, 254, 0.15)',
  },
  roleBadgeMember: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  roleText: {
    fontSize: 8,
    fontWeight: '800',
  },
  roleTextAdmin: {
    color: THEME.accentCyan,
  },
  roleTextMember: {
    color: THEME.textMuted,
  },
  customStatusText: {
    color: THEME.textSecondary,
    fontSize: 9,
    marginTop: 2,
  },
  lastSeenText: {
    color: THEME.textMuted,
    fontSize: 9,
    marginTop: 2,
  },
  quickCallBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.3)',
  },
});
