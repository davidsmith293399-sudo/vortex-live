import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../theme/colors';
import { useCall } from '../../context/CallContext';

export const AddChannelModal = ({ visible, onClose }) => {
  const { currentServer, setServers, setActiveChannelId } = useCall();
  const [channelName, setChannelName] = useState('');
  const [channelType, setChannelType] = useState('voice'); // 'text' | 'voice' | 'video' | 'screenshare'
  const [selectedImage, setSelectedImage] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80');
  const [customImageUrl, setCustomImageUrl] = useState('');

  // Curated Preset Channel Pictures
  const PRESET_PICTURES = [
    { id: 'img_cyber', label: 'Cyberpunk', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80' },
    { id: 'img_gaming', label: 'Neon Arena', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=200&q=80' },
    { id: 'img_studio', label: 'Studio Audio', url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=200&q=80' },
    { id: 'img_study', label: 'Study Calm', url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=200&q=80' },
    { id: 'img_nature', label: 'Aurora', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=200&q=80' },
    { id: 'img_space', label: 'Cosmic Nebula', url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=200&q=80' },
    { id: 'img_tech', label: 'Dev Matrix', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=200&q=80' },
    { id: 'img_retro', label: 'Synth Sunset', url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=200&q=80' },
  ];

  const handleCreateChannel = () => {
    if (!channelName.trim()) return;

    const formattedName = channelType === 'text'
      ? channelName.trim().toLowerCase().replace(/\s+/g, '-')
      : channelName.trim();

    const finalImage = customImageUrl.trim() || selectedImage;

    const newChannel = {
      id: `ch_${Date.now()}`,
      name: formattedName,
      type: channelType,
      topic: `Custom ${channelType} room with dedicated channel picture`,
      iconUrl: finalImage,
      activeParticipants: [],
      isAudioEco: true,
      bitrateKbps: 12,
    };

    setServers(prev => prev.map(s => {
      if (s.id === currentServer.id) {
        return {
          ...s,
          channels: [...s.channels, newChannel]
        };
      }
      return s;
    }));

    setActiveChannelId(newChannel.id);
    setChannelName('');
    setCustomImageUrl('');
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
              <Ionicons name="add-circle" size={22} color={THEME.accentCyan} />
              <View>
                <Text style={styles.title}>Create Custom Channel</Text>
                <Text style={styles.subtitle}>In {currentServer?.name}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={THEME.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            {/* Channel Type Selector */}
            <Text style={styles.sectionLabel}>CHANNEL TYPE</Text>
            <View style={styles.typeGrid}>
              {[
                { type: 'voice', label: 'Voice Lounge', icon: 'volume-high', desc: 'Crystal 12kbps Opus' },
                { type: 'video', label: 'Video Room', icon: 'videocam', desc: 'Low-Data 360p/480p' },
                { type: 'text', label: 'Text Chat', icon: 'chatbubble-ellipses', desc: 'Discussion & Media' },
                { type: 'screenshare', label: 'Screen Share', icon: 'desktop', desc: '5 FPS Eco Slides' },
              ].map(item => (
                <TouchableOpacity
                  key={item.type}
                  style={[
                    styles.typeCard,
                    channelType === item.type && styles.typeCardSelected
                  ]}
                  onPress={() => setChannelType(item.type)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={channelType === item.type ? THEME.accentCyan : THEME.textMuted}
                  />
                  <Text style={[styles.typeTitle, channelType === item.type && styles.typeTitleSelected]}>
                    {item.label}
                  </Text>
                  <Text style={styles.typeDesc}>{item.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Channel Name Input */}
            <Text style={styles.sectionLabel}>CHANNEL NAME</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. night-gamers, study-lounge"
              placeholderTextColor={THEME.textMuted}
              value={channelName}
              onChangeText={setChannelName}
            />

            {/* CUSTOM PICTURE / BANNER SECTION */}
            <Text style={styles.sectionLabel}>CUSTOM CHANNEL PICTURE</Text>
            
            {/* Live Picture Preview Box */}
            <View style={styles.previewBox}>
              <Image
                source={{ uri: customImageUrl.trim() || selectedImage }}
                style={styles.previewImage}
              />
              <View style={styles.previewOverlay}>
                <Ionicons name="camera" size={16} color="#FFF" />
                <Text style={styles.previewText}>Active Channel Picture Preview</Text>
              </View>
            </View>

            {/* Quick Upload from Device / Randomize Button */}
            <View style={{ flexDirection: 'row', gap: 8 }}>
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
                  const randomPic = PRESET_PICTURES[Math.floor(Math.random() * PRESET_PICTURES.length)];
                  setSelectedImage(randomPic.url);
                  setCustomImageUrl('');
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="images-outline" size={16} color={THEME.accentCyan} />
                <Text style={{ fontSize: 11, fontWeight: '700', color: THEME.accentCyan }}>
                  🎲 Cycle Avatar
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
                  setCustomImageUrl('https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=300&q=80');
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="cloud-upload-outline" size={16} color={THEME.accentViolet} />
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#C084FC' }}>
                  📸 Load Device Pic
                </Text>
              </TouchableOpacity>
            </View>

            {/* Preset Pictures Horizontal List */}
            <Text style={styles.subLabel}>CHOOSE FROM PRESETS:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetsRow}>
              {PRESET_PICTURES.map(pic => (
                <TouchableOpacity
                  key={pic.id}
                  style={[
                    styles.presetThumbWrapper,
                    selectedImage === pic.url && !customImageUrl && styles.presetThumbSelected
                  ]}
                  onPress={() => {
                    setSelectedImage(pic.url);
                    setCustomImageUrl('');
                  }}
                >
                  <Image source={{ uri: pic.url }} style={styles.presetThumb} />
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Custom URL Input */}
            <Text style={styles.subLabel}>OR PASTE CUSTOM IMAGE URL:</Text>
            <TextInput
              style={styles.input}
              placeholder="https://example.com/your-custom-picture.jpg"
              placeholderTextColor={THEME.textMuted}
              value={customImageUrl}
              onChangeText={setCustomImageUrl}
            />

            {/* Create Button */}
            <TouchableOpacity
              style={[styles.createBtn, !channelName.trim() && styles.createBtnDisabled]}
              onPress={handleCreateChannel}
              disabled={!channelName.trim()}
              activeOpacity={0.8}
            >
              <Text style={styles.createBtnText}>Create Channel with Custom Picture</Text>
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
    borderTopColor: THEME.borderHighlight,
    maxHeight: '90%',
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
  body: {
    padding: 16,
    gap: 12,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.textMuted,
    letterSpacing: 0.6,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: THEME.bgCard,
    padding: 10,
    borderRadius: THEME.radiusSm,
    borderWidth: 1,
    borderColor: THEME.borderLight,
  },
  typeCardSelected: {
    borderColor: THEME.accentCyan,
    backgroundColor: '#0F1E2C',
  },
  typeTitle: {
    color: THEME.textPrimary,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  typeTitleSelected: {
    color: THEME.accentCyan,
  },
  typeDesc: {
    color: THEME.textMuted,
    fontSize: 9,
    marginTop: 2,
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
  previewBox: {
    height: 110,
    borderRadius: THEME.radiusMd,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 242, 254, 0.3)',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  previewText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  subLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: THEME.textMuted,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  presetsRow: {
    gap: 8,
    paddingVertical: 4,
  },
  presetThumbWrapper: {
    width: 60,
    height: 60,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  presetThumbSelected: {
    borderColor: THEME.accentCyan,
  },
  presetThumb: {
    width: '100%',
    height: '100%',
  },
  createBtn: {
    backgroundColor: THEME.accentCyan,
    paddingVertical: 13,
    borderRadius: THEME.radiusMd,
    alignItems: 'center',
    marginTop: 10,
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
