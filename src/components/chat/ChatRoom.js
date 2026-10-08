import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../theme/colors';
import { useCall } from '../../context/CallContext';
import { useBandwidth } from '../../context/BandwidthContext';
import { useAuth } from '../../context/AuthContext';
import { INITIAL_CHAT_MESSAGES } from '../../constants/mockData';
import { MediaUploadModal } from '../modals/MediaUploadModal';

export const ChatRoom = ({ onJoinCallPress, onOpenResolutionPicker }) => {
  const { currentChannel, currentServer, joinCall, activeCall } = useCall();
  const { currentTier } = useBandwidth();
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState(INITIAL_CHAT_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  // Attachment Viewer Modals
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);

  // Real-Time Turbo Download States for Attachments
  // Map of attachmentId => { status: 'idle' | 'downloading' | 'completed', progress: number, speed: string }
  const [downloadStates, setDownloadStates] = useState({});

  // Voice channel to suggest joining
  const defaultVoiceChannel = currentServer?.channels.find(c => c.type === 'voice' || c.type === 'video');

  const handleSend = () => {
    if (!inputText.trim()) return;
    const newMsg = {
      id: `msg_${Date.now()}`,
      userId: currentUser?.id || 'usr_me',
      userName: `${currentUser?.name || 'CyberPilot'} (You)`,
      avatarColor: '#00F2FE',
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      resolutionTag: `${currentTier.shortLabel}`,
    };
    setMessages(prev => [...prev, newMsg]);
    setInputText('');
  };

  const handleAttachMedia = (media) => {
    const sizeStr = media.sizeDisplay || media.origSize || (media.mediaType === 'photo' ? '45 MB' : '2.5 GB');
    const newMsg = {
      id: `msg_media_${Date.now()}`,
      userId: currentUser?.id || 'usr_me',
      userName: `${currentUser?.name || 'CyberPilot'} (You)`,
      avatarColor: '#00F2FE',
      text: media.mediaType === 'photo'
        ? `Shared a high-res photo: "${media.title}" (${sizeStr})`
        : media.mediaType === 'video'
        ? `Shared a 4K video clip: "${media.title}" (${sizeStr})`
        : `Shared a large file: "${media.title}" (${sizeStr})`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mediaAttachment: {
        ...media,
        id: media.id || `att_${Date.now()}`,
        origSize: sizeStr,
        isTurbo: media.isTurbo !== false,
        transferSpeed: media.transferSpeed || '135 MB/s',
      },
      resolutionTag: media.isTurbo ? `⚡ ${sizeStr}` : 'Eco Transcoded',
    };
    setMessages(prev => [...prev, newMsg]);
  };

  // Trigger Rapid Turbo Download Simulation
  const triggerTurboDownload = (attachment) => {
    const id = attachment.id || attachment.title;
    const current = downloadStates[id];
    if (current && (current.status === 'downloading' || current.status === 'completed')) {
      return;
    }

    const speed = (110 + Math.random() * 50).toFixed(1);
    setDownloadStates(prev => ({
      ...prev,
      [id]: { status: 'downloading', progress: 10, speed: `${speed} MB/s` }
    }));

    let progress = 10;
    const interval = setInterval(() => {
      progress += 22 + Math.random() * 15;
      if (progress >= 100) {
        clearInterval(interval);
        setDownloadStates(prev => ({
          ...prev,
          [id]: { status: 'completed', progress: 100, speed: `${speed} MB/s` }
        }));
      } else {
        setDownloadStates(prev => ({
          ...prev,
          [id]: { status: 'downloading', progress: Math.min(99, Math.round(progress)), speed: `${speed} MB/s` }
        }));
      }
    }, 200);
  };

  const renderMessageItem = ({ item }) => {
    const attachment = item.mediaAttachment;
    const attId = attachment ? (attachment.id || attachment.title) : null;
    const downloadInfo = attId ? downloadStates[attId] : null;

    return (
      <View style={styles.messageItem}>
        <View style={[styles.avatar, { backgroundColor: item.avatarColor }]}>
          <Text style={styles.avatarText}>{item.userName.charAt(0)}</Text>
        </View>

        <View style={styles.messageContent}>
          <View style={styles.messageHeader}>
            <Text style={styles.authorName}>{item.userName}</Text>
            <Text style={styles.timestamp}>{item.timestamp}</Text>
            {item.resolutionTag && (
              <View style={styles.resTag}>
                <Ionicons name="speedometer-outline" size={10} color={THEME.accentCyan} />
                <Text style={styles.resTagText}>{item.resolutionTag}</Text>
              </View>
            )}
          </View>
          <Text style={styles.messageBody}>{item.text}</Text>

          {/* ================= Attached Photo Card ================= */}
          {attachment && attachment.mediaType === 'photo' && (
            <View style={styles.attachmentCard}>
              <TouchableOpacity
                onPress={() => setPreviewPhoto(attachment)}
                activeOpacity={0.85}
              >
                <Image source={{ uri: attachment.url }} style={styles.attachmentImage} />
                <View style={styles.imageOverlayBadge}>
                  <Ionicons name="expand-outline" size={14} color="#FFF" />
                </View>
              </TouchableOpacity>

              <View style={styles.attachmentMetaRow}>
                <View style={styles.fileMetaBlock}>
                  <Text style={styles.attachmentFileName} numberOfLines={1}>
                    {attachment.title}
                  </Text>
                  <View style={styles.metaBadgeRow}>
                    <View style={styles.turboPill}>
                      <Ionicons name="flash" size={10} color="#00F2FE" />
                      <Text style={styles.turboPillText}>
                        {attachment.sizeDisplay || attachment.origSize || '100 MB Max'}
                      </Text>
                    </View>
                    <Text style={styles.formatTag}>{attachment.format || 'RAW Photo'}</Text>
                  </View>
                </View>

                {/* Turbo Rapid Download Action Button */}
                <TouchableOpacity
                  style={[
                    styles.turboDownloadBtn,
                    downloadInfo?.status === 'completed' && styles.turboDownloadBtnDone
                  ]}
                  onPress={() => triggerTurboDownload(attachment)}
                  disabled={downloadInfo?.status === 'downloading'}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={downloadInfo?.status === 'completed' ? 'checkmark-circle' : 'cloud-download'}
                    size={13}
                    color={downloadInfo?.status === 'completed' ? THEME.successEmerald : '#080B11'}
                  />
                  <Text
                    style={[
                      styles.turboDownloadText,
                      downloadInfo?.status === 'completed' && styles.turboDownloadTextDone
                    ]}
                  >
                    {downloadInfo?.status === 'completed' ? 'Saved' : 'Download'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Dynamic Download Stream Progress Bar */}
              {downloadInfo?.status === 'downloading' && (
                <View style={styles.downloadStreamBar}>
                  <View style={[styles.downloadStreamFill, { width: `${downloadInfo.progress}%` }]} />
                  <Text style={styles.downloadStreamText}>
                    ⚡ Downloading: {downloadInfo.progress}% • {downloadInfo.speed}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* ================= Attached Video Card ================= */}
          {attachment && attachment.mediaType === 'video' && (
            <View style={styles.attachmentCard}>
              <TouchableOpacity
                style={styles.videoPlayerBox}
                onPress={() => setPreviewVideo(attachment)}
                activeOpacity={0.85}
              >
                <Ionicons name="play-circle" size={42} color={THEME.accentViolet} />
                <Text style={styles.videoDuration}>{attachment.duration || '24:30'}</Text>
                <View style={styles.videoHdBadge}>
                  <Text style={styles.videoHdText}>{attachment.quality || '4K 60FPS'}</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.attachmentMetaRow}>
                <View style={styles.fileMetaBlock}>
                  <Text style={styles.attachmentFileName} numberOfLines={1}>
                    {attachment.title}
                  </Text>
                  <View style={styles.metaBadgeRow}>
                    <View style={[styles.turboPill, { backgroundColor: 'rgba(127, 0, 255, 0.15)', borderColor: 'rgba(127, 0, 255, 0.4)' }]}>
                      <Ionicons name="flash" size={10} color={THEME.accentViolet} />
                      <Text style={[styles.turboPillText, { color: '#C084FC' }]}>
                        {attachment.sizeDisplay || attachment.origSize || '10 GB Tier'}
                      </Text>
                    </View>
                    <Text style={styles.formatTag}>{attachment.format || 'Direct Video Stream'}</Text>
                  </View>
                </View>

                {/* Turbo Rapid Download Action Button */}
                <TouchableOpacity
                  style={[
                    styles.turboDownloadBtn,
                    { backgroundColor: '#7F00FF' },
                    downloadInfo?.status === 'completed' && styles.turboDownloadBtnDone
                  ]}
                  onPress={() => triggerTurboDownload(attachment)}
                  disabled={downloadInfo?.status === 'downloading'}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={downloadInfo?.status === 'completed' ? 'checkmark-circle' : 'cloud-download'}
                    size={13}
                    color={downloadInfo?.status === 'completed' ? THEME.successEmerald : '#FFF'}
                  />
                  <Text
                    style={[
                      styles.turboDownloadText,
                      { color: '#FFF' },
                      downloadInfo?.status === 'completed' && styles.turboDownloadTextDone
                    ]}
                  >
                    {downloadInfo?.status === 'completed' ? 'Saved' : 'Download'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Dynamic Download Stream Progress Bar */}
              {downloadInfo?.status === 'downloading' && (
                <View style={styles.downloadStreamBar}>
                  <View style={[styles.downloadStreamFill, { width: `${downloadInfo.progress}%`, backgroundColor: '#7F00FF' }]} />
                  <Text style={styles.downloadStreamText}>
                    ⚡ High-Speed Stream: {downloadInfo.progress}% • {downloadInfo.speed}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* ================= Attached General File / Archive Card ================= */}
          {attachment && attachment.mediaType === 'file' && (
            <View style={styles.fileAttachmentRow}>
              <View style={[styles.fileIconMini, { backgroundColor: `${attachment.color || '#00F2FE'}20` }]}>
                <Ionicons name={attachment.icon || 'archive'} size={24} color={attachment.color || '#00F2FE'} />
              </View>
              
              <View style={styles.fileInfo}>
                <Text style={styles.fileName} numberOfLines={1}>{attachment.title}</Text>
                <View style={styles.metaBadgeRow}>
                  <View style={[styles.turboPill, { backgroundColor: `${attachment.color || '#00F2FE'}18`, borderColor: `${attachment.color || '#00F2FE'}40` }]}>
                    <Ionicons name="flash" size={10} color={attachment.color || '#00F2FE'} />
                    <Text style={[styles.turboPillText, { color: attachment.color || '#00F2FE' }]}>
                      {attachment.sizeDisplay || attachment.origSize || attachment.size || '10 GB Tier'}
                    </Text>
                  </View>
                  <Text style={styles.formatTag}>{attachment.type || 'Archive'}</Text>
                </View>

                {/* Progress if downloading */}
                {downloadInfo?.status === 'downloading' && (
                  <View style={[styles.downloadStreamBar, { marginTop: 4, width: '100%' }]}>
                    <View style={[styles.downloadStreamFill, { width: `${downloadInfo.progress}%`, backgroundColor: attachment.color || '#00F2FE' }]} />
                    <Text style={styles.downloadStreamText}>
                      ⚡ {downloadInfo.progress}% • {downloadInfo.speed}
                    </Text>
                  </View>
                )}
              </View>

              {/* Download Action Button */}
              <TouchableOpacity
                style={[
                  styles.turboDownloadBtn,
                  downloadInfo?.status === 'completed' && styles.turboDownloadBtnDone
                ]}
                onPress={() => triggerTurboDownload(attachment)}
                disabled={downloadInfo?.status === 'downloading'}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={downloadInfo?.status === 'completed' ? 'checkmark-circle' : 'download'}
                  size={14}
                  color={downloadInfo?.status === 'completed' ? THEME.successEmerald : '#080B11'}
                />
                <Text
                  style={[
                    styles.turboDownloadText,
                    downloadInfo?.status === 'completed' && styles.turboDownloadTextDone
                  ]}
                >
                  {downloadInfo?.status === 'completed' ? 'Done' : 'Get'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Top Banner: Active Lounge Prompt if not already in a call */}
      {!activeCall && defaultVoiceChannel && (
        <View style={styles.activeCallBanner}>
          <View style={styles.bannerInfo}>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveLabel}>LIVE LOUNGE</Text>
            </View>
            <Text style={styles.bannerChannelName} numberOfLines={1}>
              {defaultVoiceChannel.name}
            </Text>
            <Text style={styles.bannerSubtext}>
              ~0.6 MB/min • Ultra Low Bandwidth
            </Text>
          </View>

          <TouchableOpacity
            style={styles.joinCallBtn}
            onPress={() => joinCall(defaultVoiceChannel)}
            activeOpacity={0.8}
          >
            <Ionicons name="call" size={14} color="#080B11" />
            <Text style={styles.joinCallBtnText}>Join Voice</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* High-Speed File Transfer & Bandwidth Status Notice */}
      <View style={styles.turboNoticeBar}>
        <View style={styles.turboNoticeLeft}>
          <Ionicons name="flash" size={14} color="#00F2FE" />
          <Text style={styles.turboNoticeText}>
            ⚡ Turbo Mode: Share 100 MB Photos & 10 GB Videos/Files at Full Internet Speed
          </Text>
        </View>
        <TouchableOpacity
          style={styles.turboNoticeUploadBtn}
          onPress={() => setIsMediaModalOpen(true)}
        >
          <Text style={styles.turboNoticeUploadText}>+ Upload</Text>
        </TouchableOpacity>
      </View>

      {/* Messages List */}
      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessageItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Input Field Bar */}
      <View style={styles.inputContainer}>
        {/* Media / Photo / Video / File Button */}
        <TouchableOpacity
          style={styles.addMediaBtn}
          onPress={() => setIsMediaModalOpen(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="add-circle" size={26} color={THEME.accentCyan} />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder={`Message #${currentChannel?.name || 'chat'}...`}
          placeholderTextColor={THEME.textMuted}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />

        <TouchableOpacity
          style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim()}
          activeOpacity={0.8}
        >
          <Ionicons
            name="send"
            size={16}
            color={inputText.trim() ? '#080B11' : THEME.textMuted}
          />
        </TouchableOpacity>
      </View>

      {/* High-Speed Media Upload Modal */}
      <MediaUploadModal
        visible={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onAttachMedia={handleAttachMedia}
      />

      {/* Photo Lightbox Preview Modal */}
      {previewPhoto && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setPreviewPhoto(null)}>
          <View style={styles.lightboxOverlay}>
            <View style={styles.lightboxHeader}>
              <View>
                <Text style={styles.lightboxTitle}>{previewPhoto.title}</Text>
                <Text style={styles.lightboxSub}>
                  {previewPhoto.sizeDisplay || previewPhoto.origSize} • Full Resolution Lightbox
                </Text>
              </View>
              <TouchableOpacity onPress={() => setPreviewPhoto(null)} style={styles.lightboxClose}>
                <Ionicons name="close" size={22} color="#FFF" />
              </TouchableOpacity>
            </View>
            <Image source={{ uri: previewPhoto.url }} style={styles.lightboxImage} resizeMode="contain" />
          </View>
        </Modal>
      )}

      {/* Video Player Preview Modal */}
      {previewVideo && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setPreviewVideo(null)}>
          <View style={styles.lightboxOverlay}>
            <View style={styles.lightboxHeader}>
              <View>
                <Text style={styles.lightboxTitle}>{previewVideo.title}</Text>
                <Text style={styles.lightboxSub}>
                  {previewVideo.sizeDisplay || previewVideo.origSize} • {previewVideo.quality || '4K 60FPS Video'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setPreviewVideo(null)} style={styles.lightboxClose}>
                <Ionicons name="close" size={22} color="#FFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.lightboxVideoBody}>
              <Ionicons name="play-circle-outline" size={72} color={THEME.accentViolet} />
              <Text style={styles.lightboxVideoText}>High-Definition Video Stream</Text>
              <Text style={styles.lightboxVideoTime}>{previewVideo.duration || '24:30'}</Text>
            </View>
          </View>
        </Modal>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bgApp,
  },
  activeCallBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0E1E2C',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 242, 254, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  bannerInfo: {
    flex: 1,
    marginRight: 10,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.successEmerald,
  },
  liveLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: THEME.successEmerald,
    letterSpacing: 0.5,
  },
  bannerChannelName: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.textPrimary,
  },
  bannerSubtext: {
    fontSize: 10,
    color: THEME.textMuted,
  },
  joinCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: THEME.accentCyan,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: THEME.radiusSm,
  },
  joinCallBtnText: {
    color: '#080B11',
    fontWeight: '800',
    fontSize: 12,
  },
  turboNoticeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#08121D',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 242, 254, 0.2)',
  },
  turboNoticeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  turboNoticeText: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.textPrimary,
    flex: 1,
  },
  turboNoticeUploadBtn: {
    backgroundColor: 'rgba(0, 242, 254, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.4)',
  },
  turboNoticeUploadText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00F2FE',
  },
  listContent: {
    padding: 12,
    gap: 14,
  },
  messageItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 2,
  },
  authorName: {
    color: THEME.textPrimary,
    fontWeight: '700',
    fontSize: 13,
  },
  timestamp: {
    color: THEME.textMuted,
    fontSize: 10,
  },
  resTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0, 242, 254, 0.1)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  resTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: THEME.accentCyan,
  },
  messageBody: {
    color: THEME.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  attachmentCard: {
    marginTop: 8,
    backgroundColor: THEME.bgCard,
    borderRadius: THEME.radiusMd,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: THEME.borderLight,
    maxWidth: 320,
  },
  attachmentImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#000',
  },
  imageOverlayBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.65)',
    padding: 5,
    borderRadius: 6,
  },
  attachmentMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#0A101C',
  },
  fileMetaBlock: {
    flex: 1,
    marginRight: 8,
  },
  attachmentFileName: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.textPrimary,
  },
  metaBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  turboPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0, 242, 254, 0.12)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.3)',
  },
  turboPillText: {
    color: '#00F2FE',
    fontSize: 9,
    fontWeight: '800',
  },
  formatTag: {
    color: THEME.textMuted,
    fontSize: 9,
    fontWeight: '600',
  },
  turboDownloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#00F2FE',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
  },
  turboDownloadBtnDone: {
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
    borderWidth: 1,
    borderColor: THEME.successEmerald,
  },
  turboDownloadText: {
    color: '#080B11',
    fontWeight: '800',
    fontSize: 10,
  },
  turboDownloadTextDone: {
    color: THEME.successEmerald,
  },
  downloadStreamBar: {
    height: 18,
    backgroundColor: '#090D15',
    position: 'relative',
    justifyContent: 'center',
    paddingHorizontal: 6,
    overflow: 'hidden',
  },
  downloadStreamFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0, 242, 254, 0.35)',
  },
  downloadStreamText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#00F2FE',
    zIndex: 2,
  },
  videoPlayerBox: {
    height: 140,
    backgroundColor: '#0B1320',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  videoDuration: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    color: '#FFF',
    fontSize: 9,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  videoHdBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(127, 0, 255, 0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  videoHdText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
  },
  fileAttachmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: THEME.bgCard,
    padding: 10,
    borderRadius: THEME.radiusSm,
    marginTop: 6,
    borderWidth: 1,
    borderColor: THEME.borderLight,
    maxWidth: 320,
  },
  fileIconMini: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    color: THEME.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.bgInput,
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: THEME.radiusMd,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  addMediaBtn: {
    padding: 4,
  },
  input: {
    flex: 1,
    color: THEME.textPrimary,
    fontSize: 13,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.accentCyan,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: THEME.bgCard,
  },
  lightboxOverlay: {
    flex: 1,
    backgroundColor: 'rgba(4, 7, 12, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  lightboxHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
  },
  lightboxTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
  lightboxSub: {
    color: THEME.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  lightboxClose: {
    padding: 6,
    backgroundColor: THEME.bgCard,
    borderRadius: 15,
  },
  lightboxImage: {
    width: '100%',
    height: '75%',
  },
  lightboxVideoBody: {
    width: '100%',
    height: '60%',
    backgroundColor: '#0B1320',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: THEME.borderHighlight,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  lightboxVideoText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  lightboxVideoTime: {
    color: THEME.accentViolet,
    fontSize: 12,
    fontWeight: '700',
  },
});
