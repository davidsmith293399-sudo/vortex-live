import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../theme/colors';
import { useCall } from '../../context/CallContext';

export const AddServerModal = ({ visible, onClose }) => {
  const { setServers, setActiveServerId } = useCall();
  const [serverName, setServerName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#00F2FE');
  const [serverImageUrl, setServerImageUrl] = useState('');
  const [selectedPresetImage, setSelectedPresetImage] = useState('https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=200&q=80');

  const palette = ['#00F2FE', '#7F00FF', '#FF007A', '#38EF7D', '#FFB300', '#FF3366'];

  const PRESET_SERVER_ICONS = [
    { id: 'srv_img1', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=200&q=80', label: 'Tech Space' },
    { id: 'srv_img2', url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=200&q=80', label: 'Gaming Squad' },
    { id: 'srv_img3', url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=200&q=80', label: 'Cyberpunk' },
    { id: 'srv_img4', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=200&q=80', label: 'Aurora' },
  ];

  const handleCreate = () => {
    if (!serverName.trim()) return;

    const finalImage = serverImageUrl.trim() || selectedPresetImage;

    const newServer = {
      id: `srv_${Date.now()}`,
      name: serverName.trim(),
      initials: serverName.trim().slice(0, 2).toUpperCase(),
      iconColor: selectedColor,
      imageUrl: finalImage,
      unreadCount: 0,
      description: 'Custom community server with custom pictures and zero-lag communication.',
      membersCount: 1,
      channels: [
        { id: `ch_${Date.now()}_gen`, name: 'general', type: 'text', topic: 'General conversation' },
        { id: `ch_${Date.now()}_voice`, name: 'Voice Lounge', type: 'voice', bitrateKbps: 12, activeParticipants: [], isAudioEco: true },
      ]
    };

    setServers(prev => [...prev, newServer]);
    setActiveServerId(newServer.id);
    setServerName('');
    setServerImageUrl('');
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
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Ionicons name="people" size={20} color={THEME.accentCyan} />
              <Text style={styles.title}>Create Community Server</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={THEME.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            {/* Server Picture Preview */}
            <Text style={styles.label}>SERVER ICON / PICTURE</Text>
            <View style={styles.avatarPreviewRow}>
              <Image
                source={{ uri: serverImageUrl.trim() || selectedPresetImage }}
                style={styles.avatarPreview}
              />
              <View style={styles.avatarPreviewMeta}>
                <Text style={styles.avatarPreviewTitle}>Custom Server Icon Preview</Text>
                <Text style={styles.avatarPreviewSub}>Visible in the community sidebar</Text>
              </View>
            </View>

            {/* Quick Upload from Device / Randomize Button */}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  backgroundColor: 'rgba(0, 242, 254, 0.1)',
                  paddingVertical: 9,
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: 'rgba(0, 242, 254, 0.3)',
                }}
                onPress={() => {
                  const randomIcon = PRESET_SERVER_ICONS[Math.floor(Math.random() * PRESET_SERVER_ICONS.length)];
                  setSelectedPresetImage(randomIcon.url);
                  setServerImageUrl('');
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="images-outline" size={16} color={THEME.accentCyan} />
                <Text style={{ fontSize: 11, fontWeight: '700', color: THEME.accentCyan }}>
                  🎲 Cycle Icon
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  backgroundColor: 'rgba(127, 0, 255, 0.12)',
                  paddingVertical: 9,
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: 'rgba(127, 0, 255, 0.4)',
                }}
                onPress={() => {
                  setServerImageUrl('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=300&q=80');
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="cloud-upload-outline" size={16} color={THEME.accentViolet} />
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#C084FC' }}>
                  📸 Load Device Pic
                </Text>
              </TouchableOpacity>
            </View>

            {/* Presets */}
            <Text style={styles.subLabel}>CHOOSE FROM PRESET ICONS:</Text>
            <View style={styles.presetsGrid}>
              {PRESET_SERVER_ICONS.map(icon => (
                <TouchableOpacity
                  key={icon.id}
                  style={[
                    styles.presetCircle,
                    selectedPresetImage === icon.url && !serverImageUrl && styles.presetCircleSelected
                  ]}
                  onPress={() => {
                    setSelectedPresetImage(icon.url);
                    setServerImageUrl('');
                  }}
                >
                  <Image source={{ uri: icon.url }} style={styles.presetImg} />
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom URL Input */}
            <Text style={styles.subLabel}>OR PASTE CUSTOM IMAGE URL:</Text>
            <TextInput
              style={styles.input}
              placeholder="https://example.com/server-logo.png"
              placeholderTextColor={THEME.textMuted}
              value={serverImageUrl}
              onChangeText={setServerImageUrl}
            />

            <Text style={styles.label}>SERVER NAME</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Study Squad, Cyber Gamers"
              placeholderTextColor={THEME.textMuted}
              value={serverName}
              onChangeText={setServerName}
            />

            <Text style={styles.label}>ACCENT COLOR</Text>
            <View style={styles.colorRow}>
              {palette.map(color => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorCircleSelected
                  ]}
                  onPress={() => setSelectedColor(color)}
                />
              ))}
            </View>

            <TouchableOpacity
              style={[styles.createBtn, !serverName.trim() && styles.createBtnDisabled]}
              onPress={handleCreate}
              disabled={!serverName.trim()}
              activeOpacity={0.8}
            >
              <Text style={styles.createBtnText}>Create Server with Custom Icon</Text>
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
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: THEME.bgSurface,
    borderRadius: THEME.radiusLg,
    borderWidth: 1.5,
    borderColor: THEME.borderHighlight,
    overflow: 'hidden',
    maxHeight: '88%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.borderLight,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: THEME.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    padding: 16,
    gap: 10,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.textMuted,
    letterSpacing: 0.5,
  },
  subLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: THEME.textMuted,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  avatarPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: THEME.bgCard,
    padding: 10,
    borderRadius: THEME.radiusMd,
    borderWidth: 1,
    borderColor: THEME.borderLight,
  },
  avatarPreview: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: THEME.accentCyan,
  },
  avatarPreviewMeta: {
    flex: 1,
  },
  avatarPreviewTitle: {
    color: THEME.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  avatarPreviewSub: {
    color: THEME.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  presetsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  presetCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  presetCircleSelected: {
    borderColor: THEME.accentCyan,
  },
  presetImg: {
    width: '100%',
    height: '100%',
  },
  input: {
    backgroundColor: THEME.bgInput,
    borderRadius: THEME.radiusSm,
    color: THEME.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    borderWidth: 1,
    borderColor: THEME.borderLight,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 4,
  },
  colorCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  colorCircleSelected: {
    borderWidth: 2.5,
    borderColor: '#FFF',
  },
  createBtn: {
    backgroundColor: THEME.accentCyan,
    paddingVertical: 13,
    borderRadius: THEME.radiusSm,
    alignItems: 'center',
    marginTop: 8,
  },
  createBtnDisabled: {
    backgroundColor: THEME.bgCard,
  },
  createBtnText: {
    color: '#080B11',
    fontWeight: '800',
    fontSize: 13,
  },
});
