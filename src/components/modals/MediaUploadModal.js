import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Image, TextInput, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../theme/colors';

// System Transfer Limits per User Specification
export const TRANSFER_LIMITS = {
  photo: { maxMB: 100, label: '100 MB Maximum', desc: 'Full-resolution RAW, 8K PNG, lossless DSLR photos' },
  video: { maxMB: 10240, label: '10 GB Maximum', desc: 'Uncompressed 4K/8K 60FPS clips, full feature videos & streams' },
  file: { maxMB: 10240, label: '10 GB Maximum', desc: 'Large 7z/ZIP archives, ISO disk images, game builds & datasets' },
};

export const MediaUploadModal = ({ visible, onClose, onAttachMedia }) => {
  const [selectedType, setSelectedType] = useState('photo'); // 'photo' | 'video' | 'file'
  const [transferMode, setTransferMode] = useState('turbo'); // 'turbo' (unthrottled full speed) | 'eco' (data saving)
  
  // Custom file upload states
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customFileName, setCustomFileName] = useState('');
  const [customFileSizeVal, setCustomFileSizeVal] = useState('4.2');
  const [customFileUnit, setCustomFileUnit] = useState('GB'); // 'MB' | 'GB'
  const [customFileError, setCustomFileError] = useState('');

  // Live Turbo Upload simulation state
  const [uploadingItem, setUploadingItem] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [transferSpeed, setTransferSpeed] = useState(128.4);
  const [transferredMB, setTransferredMB] = useState(0);
  const [totalMB, setTotalMB] = useState(0);

  // Showcase Items respecting the flexible high capacities
  const showcasePhotos = [
    {
      id: 'p_raw_94mb',
      title: 'DSC_0942_NIGHT_SKY_8K.DNG',
      label: 'Ultra-HD RAW Camera Shot',
      url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      sizeBytes: 94.2 * 1024 * 1024,
      sizeDisplay: '94.2 MB',
      format: '8K DNG RAW',
      resolution: '8256 × 5504',
      isWithinLimit: true,
    },
    {
      id: 'p_master_62mb',
      title: 'VORTEX_BRAND_MASTER_2026.PSD',
      label: 'Lossless Design Master File',
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      sizeBytes: 62.8 * 1024 * 1024,
      sizeDisplay: '62.8 MB',
      format: 'Uncompressed PSD',
      resolution: '7680 × 4320',
      isWithinLimit: true,
    },
    {
      id: 'p_cyber_38mb',
      title: 'NEON_CITY_PANORAMA_HDR.PNG',
      label: 'Uncompressed 8K Panorama',
      url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
      sizeBytes: 38.5 * 1024 * 1024,
      sizeDisplay: '38.5 MB',
      format: 'Lossless PNG',
      resolution: '8000 × 3200',
      isWithinLimit: true,
    },
    {
      id: 'p_desk_18mb',
      title: 'DEV_RIG_SETUP_HDR.JPG',
      label: 'High-Res Developer Desk',
      url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
      sizeBytes: 18.4 * 1024 * 1024,
      sizeDisplay: '18.4 MB',
      format: 'Pristine 100% JPEG',
      resolution: '5120 × 2880',
      isWithinLimit: true,
    },
  ];

  const showcaseVideos = [
    {
      id: 'v_match_8gb',
      title: 'TOURNAMENT_GRAND_FINALS_RAW.MOV',
      label: '4K 60FPS Raw Esports Match',
      duration: '42:15',
      sizeBytes: 8.4 * 1024 * 1024 * 1024,
      sizeDisplay: '8.4 GB',
      format: 'ProRes 422 HQ (4K 60FPS)',
      isWithinLimit: true,
    },
    {
      id: 'v_stream_4gb',
      title: 'COMMUNITY_DEV_STREAM_UNCUT.MKV',
      label: 'Full Dev Conference Recording',
      duration: '1:18:40',
      sizeBytes: 4.6 * 1024 * 1024 * 1024,
      sizeDisplay: '4.6 GB',
      format: 'H.265 10-Bit (1440p 60FPS)',
      isWithinLimit: true,
    },
    {
      id: 'v_gameplay_2gb',
      title: 'APEX_RANKED_CLUTCH_PLAY.MP4',
      label: 'High-FPS Gameplay Reel',
      duration: '12:05',
      sizeBytes: 2.1 * 1024 * 1024 * 1024,
      sizeDisplay: '2.1 GB',
      format: '1080p 60FPS Direct Stream',
      isWithinLimit: true,
    },
    {
      id: 'v_highlight_850mb',
      title: 'VORTEX_SPEEDRUN_SESSION.MP4',
      label: 'Action Speedrun Clip',
      duration: '06:30',
      sizeBytes: 850 * 1024 * 1024,
      sizeDisplay: '850 MB',
      format: 'Full HD 1080p',
      isWithinLimit: true,
    },
  ];

  const showcaseFiles = [
    {
      id: 'f_assets_9gb',
      title: 'VORTEX_3D_ASSETS_SHADERS.7Z',
      label: 'Game Shaders & Uncut 3D Assets',
      type: '7-Zip Compressed Archive',
      sizeBytes: 9.6 * 1024 * 1024 * 1024,
      sizeDisplay: '9.6 GB',
      icon: 'archive',
      color: '#00F2FE',
      isWithinLimit: true,
    },
    {
      id: 'f_iso_5gb',
      title: 'UBUNTU_CUSTOM_DEV_WORKSTATION.ISO',
      label: 'Bootable System Disc Image',
      type: 'OS Bootable ISO',
      sizeBytes: 5.8 * 1024 * 1024 * 1024,
      sizeDisplay: '5.8 GB',
      icon: 'disc',
      color: '#E056FD',
      isWithinLimit: true,
    },
    {
      id: 'f_weights_4gb',
      title: 'LLAMA3_8B_INSTRUCT_Q8.SAFETENSORS',
      label: 'AI Neural Model Weights',
      type: 'SafeTensors Binary',
      sizeBytes: 4.2 * 1024 * 1024 * 1024,
      sizeDisplay: '4.2 GB',
      icon: 'hardware-chip',
      color: '#38EF7D',
      isWithinLimit: true,
    },
    {
      id: 'f_dataset_1gb',
      title: 'TELEMETRY_AUTONOMOUS_DATA.PARQUET',
      label: 'High-Frequency Sensor Dataset',
      type: 'Apache Parquet Database',
      sizeBytes: 1.4 * 1024 * 1024 * 1024,
      sizeDisplay: '1.4 GB',
      icon: 'server',
      color: '#FFB300',
      isWithinLimit: true,
    },
  ];

  // Start High-Speed Turbo Multi-Stream Upload
  const startUpload = (item, type) => {
    let targetMB = 0;
    if (item.sizeBytes) {
      targetMB = Math.round(item.sizeBytes / (1024 * 1024));
    } else {
      targetMB = 4500;
    }

    setUploadingItem({ ...item, mediaType: type });
    setUploadProgress(0);
    setTransferredMB(0);
    setTotalMB(targetMB);

    // Dynamic speed simulation scaling with modern high-speed broadband (85 - 165 MB/s)
    const baseSpeed = 115 + Math.random() * 45;
    setTransferSpeed(parseFloat(baseSpeed.toFixed(1)));

    let current = 0;
    const interval = setInterval(() => {
      current += 16 + Math.random() * 14;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setUploadProgress(100);
        setTransferredMB(targetMB);

        setTimeout(() => {
          onAttachMedia({
            ...item,
            mediaType: type,
            isTurbo: transferMode === 'turbo',
            transferSpeed: `${baseSpeed.toFixed(1)} MB/s`,
            origSize: item.sizeDisplay || `${targetMB} MB`,
            compressedSize: transferMode === 'eco' ? 'Eco-Optimized' : item.sizeDisplay,
          });
          setUploadingItem(null);
          onClose();
        }, 400);
      } else {
        setUploadProgress(Math.min(99, Math.round(current)));
        setTransferredMB(Math.round((current / 100) * targetMB));
      }
    }, 180);
  };

  // Validate and submit Custom File
  const handleCustomUpload = () => {
    const val = parseFloat(customFileSizeVal);
    if (isNaN(val) || val <= 0) {
      setCustomFileError('Please enter a valid numeric size.');
      return;
    }

    const sizeInMB = customFileUnit === 'GB' ? val * 1024 : val;
    const maxLimitMB = TRANSFER_LIMITS[selectedType].maxMB;

    if (sizeInMB > maxLimitMB) {
      setCustomFileError(`Size exceeds maximum limit of ${TRANSFER_LIMITS[selectedType].label}.`);
      return;
    }

    setCustomFileError('');
    const name = customFileName.trim() || `custom_${selectedType}_${Date.now()}.${selectedType === 'photo' ? 'raw' : selectedType === 'video' ? 'mp4' : 'zip'}`;
    const displaySize = customFileUnit === 'GB' ? `${val} GB` : `${val} MB`;

    const customItem = {
      id: `custom_${Date.now()}`,
      title: name,
      label: `User Uploaded ${selectedType.toUpperCase()}`,
      sizeBytes: sizeInMB * 1024 * 1024,
      sizeDisplay: displaySize,
      url: selectedType === 'photo' ? 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80' : undefined,
      duration: selectedType === 'video' ? '18:45' : undefined,
      icon: selectedType === 'file' ? 'document' : undefined,
      color: '#00F2FE',
    };

    startUpload(customItem, selectedType);
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
              <View style={styles.turboIconBadge}>
                <Ionicons name="flash" size={16} color="#080B11" />
              </View>
              <View>
                <Text style={styles.title}>Turbo High-Speed File Transfer</Text>
                <Text style={styles.subtitle}>
                  Photos up to 100 MB • Videos & Files up to 10 GB
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={THEME.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Transfer Limits Banner */}
          <View style={styles.limitsBanner}>
            <View style={styles.limitBadge}>
              <Ionicons name="image" size={13} color={THEME.accentCyan} />
              <Text style={styles.limitText}>Photos: <Text style={styles.limitBold}>100 MB</Text></Text>
            </View>
            <View style={styles.limitDivider} />
            <View style={styles.limitBadge}>
              <Ionicons name="videocam" size={13} color={THEME.accentViolet} />
              <Text style={styles.limitText}>Videos: <Text style={styles.limitBold}>10 GB</Text></Text>
            </View>
            <View style={styles.limitDivider} />
            <View style={styles.limitBadge}>
              <Ionicons name="folder" size={13} color={THEME.successEmerald} />
              <Text style={styles.limitText}>Files: <Text style={styles.limitBold}>10 GB</Text></Text>
            </View>
          </View>

          {/* Pipeline Mode Switcher */}
          <View style={styles.pipelineBar}>
            <TouchableOpacity
              style={[styles.pipeOption, transferMode === 'turbo' && styles.pipeOptionActiveTurbo]}
              onPress={() => setTransferMode('turbo')}
              activeOpacity={0.8}
            >
              <Ionicons name="speedometer" size={16} color={transferMode === 'turbo' ? '#080B11' : THEME.accentCyan} />
              <View>
                <Text style={[styles.pipeTitle, transferMode === 'turbo' && styles.pipeTitleActive]}>
                  ⚡ Turbo Pipeline (Max Speed)
                </Text>
                <Text style={[styles.pipeSub, transferMode === 'turbo' && styles.pipeSubActive]}>
                  Unthrottled multi-stream • Up to 10 GB
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.pipeOption, transferMode === 'eco' && styles.pipeOptionActiveEco]}
              onPress={() => setTransferMode('eco')}
              activeOpacity={0.8}
            >
              <Ionicons name="leaf" size={16} color={transferMode === 'eco' ? '#080B11' : THEME.successEmerald} />
              <View>
                <Text style={[styles.pipeTitle, transferMode === 'eco' && styles.pipeTitleActive]}>
                  🌿 Eco Compressor
                </Text>
                <Text style={[styles.pipeSub, transferMode === 'eco' && styles.pipeSubActive]}>
                  Transcode to save cellular data
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Media Category Tabs */}
          <View style={styles.tabsRow}>
            <TouchableOpacity
              style={[styles.tabBtn, selectedType === 'photo' && styles.tabBtnActive]}
              onPress={() => { setSelectedType('photo'); setIsCustomMode(false); }}
            >
              <Ionicons name="image" size={16} color={selectedType === 'photo' ? '#080B11' : THEME.textSecondary} />
              <Text style={[styles.tabText, selectedType === 'photo' && styles.tabTextActive]}>
                Photos (100 MB)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, selectedType === 'video' && styles.tabBtnActive]}
              onPress={() => { setSelectedType('video'); setIsCustomMode(false); }}
            >
              <Ionicons name="videocam" size={16} color={selectedType === 'video' ? '#080B11' : THEME.textSecondary} />
              <Text style={[styles.tabText, selectedType === 'video' && styles.tabTextActive]}>
                Videos (10 GB)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, selectedType === 'file' && styles.tabBtnActive]}
              onPress={() => { setSelectedType('file'); setIsCustomMode(false); }}
            >
              <Ionicons name="folder" size={16} color={selectedType === 'file' ? '#080B11' : THEME.textSecondary} />
              <Text style={[styles.tabText, selectedType === 'file' && styles.tabTextActive]}>
                Files (10 GB)
              </Text>
            </TouchableOpacity>
          </View>

          {/* ACTIVE UPLOAD STREAM OVERLAY (IF CURRENTLY UPLOADING) */}
          {uploadingItem ? (
            <View style={styles.uploadingBox}>
              <View style={styles.uploadingHeader}>
                <View style={styles.pulseDot} />
                <Text style={styles.uploadingTitle}>
                  TURBO MULTI-STREAM UPLOAD ACTIVE (8 PIPES)
                </Text>
              </View>

              <Text style={styles.uploadingFileName} numberOfLines={1}>
                {uploadingItem.title}
              </Text>

              {/* Progress Bar */}
              <View style={styles.progressBarTrack}>
                <View style={[styles.progressBarFill, { width: `${uploadProgress}%` }]} />
              </View>

              {/* Live Telemetry */}
              <View style={styles.telemetryRow}>
                <Text style={styles.telemetryText}>
                  {transferredMB} MB / {totalMB} MB ({uploadProgress}%)
                </Text>
                <View style={styles.speedBadge}>
                  <Ionicons name="flash" size={12} color="#00F2FE" />
                  <Text style={styles.speedBadgeText}>{transferSpeed} MB/s</Text>
                </View>
              </View>

              <Text style={styles.broadbandNotice}>
                Operating at maximum available network speed via parallel chunk streaming.
              </Text>
            </View>
          ) : (
            <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
              {/* Custom Device File Picker Bar */}
              <View style={styles.customUploadSection}>
                <TouchableOpacity
                  style={styles.customPickerBtn}
                  onPress={() => setIsCustomMode(!isCustomMode)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="cloud-upload-outline" size={18} color={THEME.accentCyan} />
                  <Text style={styles.customPickerBtnText}>
                    {isCustomMode ? 'Hide Custom Upload Panel' : '⚡ Pick / Upload Any Custom File From Device'}
                  </Text>
                  <Ionicons name={isCustomMode ? 'chevron-up' : 'chevron-down'} size={16} color={THEME.accentCyan} />
                </TouchableOpacity>

                {isCustomMode && (
                  <View style={styles.customForm}>
                    <Text style={styles.formLabel}>FILE NAME / TITLE:</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder={selectedType === 'photo' ? 'e.g. Vacation_8K_Master.DNG' : selectedType === 'video' ? 'e.g. Gameplay_4K_60FPS.mov' : 'e.g. Project_Build_v2.7z'}
                      placeholderTextColor={THEME.textMuted}
                      value={customFileName}
                      onChangeText={setCustomFileName}
                    />

                    <Text style={styles.formLabel}>FILE SIZE (MAX {TRANSFER_LIMITS[selectedType].label}):</Text>
                    <View style={styles.sizeInputRow}>
                      <TextInput
                        style={[styles.formInput, { flex: 1 }]}
                        placeholder="e.g. 4.8"
                        placeholderTextColor={THEME.textMuted}
                        keyboardType="numeric"
                        value={customFileSizeVal}
                        onChangeText={setCustomFileSizeVal}
                      />
                      <View style={styles.unitToggleGroup}>
                        <TouchableOpacity
                          style={[styles.unitBtn, customFileUnit === 'MB' && styles.unitBtnActive]}
                          onPress={() => setCustomFileUnit('MB')}
                        >
                          <Text style={[styles.unitBtnText, customFileUnit === 'MB' && styles.unitBtnTextActive]}>MB</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.unitBtn, customFileUnit === 'GB' && styles.unitBtnActive]}
                          onPress={() => setCustomFileUnit('GB')}
                        >
                          <Text style={[styles.unitBtnText, customFileUnit === 'GB' && styles.unitBtnTextActive]}>GB</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {customFileError ? (
                      <Text style={styles.formErrorText}>{customFileError}</Text>
                    ) : (
                      <Text style={styles.formValidText}>
                        ✓ Within {TRANSFER_LIMITS[selectedType].label} capacity. High-speed upload ready.
                      </Text>
                    )}

                    <TouchableOpacity
                      style={styles.submitCustomBtn}
                      onPress={handleCustomUpload}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="flash" size={16} color="#080B11" />
                      <Text style={styles.submitCustomBtnText}>
                        ⚡ Launch High-Speed Turbo Upload
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Showcase Presets for Current Category */}
              <Text style={styles.presetsHeaderLabel}>
                SELECT HIGH-CAPACITY {selectedType.toUpperCase()} ITEM:
              </Text>

              {/* PHOTO ITEMS */}
              {selectedType === 'photo' && (
                <View style={styles.itemsGrid}>
                  {showcasePhotos.map((photo) => (
                    <TouchableOpacity
                      key={photo.id}
                      style={styles.cardItem}
                      onPress={() => startUpload(photo, 'photo')}
                      activeOpacity={0.8}
                    >
                      <Image source={{ uri: photo.url }} style={styles.photoThumb} />
                      <View style={styles.cardBody}>
                        <Text style={styles.itemTitle} numberOfLines={1}>{photo.title}</Text>
                        <Text style={styles.itemSub}>{photo.label}</Text>
                        
                        <View style={styles.capacityBadgeRow}>
                          <View style={styles.sizePill}>
                            <Ionicons name="document-attach" size={11} color={THEME.accentCyan} />
                            <Text style={styles.sizePillText}>{photo.sizeDisplay}</Text>
                          </View>
                          <Text style={styles.formatText}>{photo.format}</Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={styles.quickUploadBtn}
                        onPress={() => startUpload(photo, 'photo')}
                      >
                        <Ionicons name="cloud-upload" size={18} color={THEME.accentCyan} />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* VIDEO ITEMS */}
              {selectedType === 'video' && (
                <View style={styles.itemsList}>
                  {showcaseVideos.map((video) => (
                    <TouchableOpacity
                      key={video.id}
                      style={styles.videoCard}
                      onPress={() => startUpload(video, 'video')}
                      activeOpacity={0.8}
                    >
                      <View style={styles.videoIconBox}>
                        <Ionicons name="play-circle" size={32} color={THEME.accentViolet} />
                        <Text style={styles.videoDuration}>{video.duration}</Text>
                      </View>
                      <View style={styles.videoBody}>
                        <Text style={styles.itemTitle} numberOfLines={1}>{video.title}</Text>
                        <Text style={styles.itemSub}>{video.label}</Text>
                        
                        <View style={styles.capacityBadgeRow}>
                          <View style={[styles.sizePill, { backgroundColor: 'rgba(127, 0, 255, 0.15)', borderColor: 'rgba(127, 0, 255, 0.4)' }]}>
                            <Ionicons name="flash" size={11} color={THEME.accentViolet} />
                            <Text style={[styles.sizePillText, { color: '#C084FC' }]}>{video.sizeDisplay}</Text>
                          </View>
                          <Text style={styles.formatText}>{video.format}</Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={styles.quickUploadBtn}
                        onPress={() => startUpload(video, 'video')}
                      >
                        <Ionicons name="cloud-upload" size={18} color={THEME.accentViolet} />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* FILE & ARCHIVE ITEMS */}
              {selectedType === 'file' && (
                <View style={styles.itemsList}>
                  {showcaseFiles.map((file) => (
                    <TouchableOpacity
                      key={file.id}
                      style={styles.fileCard}
                      onPress={() => startUpload(file, 'file')}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.fileIconBox, { backgroundColor: `${file.color}20` }]}>
                        <Ionicons name={file.icon} size={26} color={file.color} />
                      </View>
                      <View style={styles.fileBody}>
                        <Text style={styles.itemTitle} numberOfLines={1}>{file.title}</Text>
                        <Text style={styles.itemSub}>{file.label}</Text>
                        
                        <View style={styles.capacityBadgeRow}>
                          <View style={[styles.sizePill, { backgroundColor: `${file.color}15`, borderColor: `${file.color}40` }]}>
                            <Ionicons name="server" size={11} color={file.color} />
                            <Text style={[styles.sizePillText, { color: file.color }]}>{file.sizeDisplay}</Text>
                          </View>
                          <Text style={styles.formatText}>{file.type}</Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={styles.quickUploadBtn}
                        onPress={() => startUpload(file, 'file')}
                      >
                        <Ionicons name="cloud-upload" size={18} color={file.color} />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(4, 7, 12, 0.88)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: THEME.bgSurface,
    borderTopLeftRadius: THEME.radiusXl,
    borderTopRightRadius: THEME.radiusXl,
    borderTopWidth: 1.5,
    borderTopColor: THEME.borderHighlight,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.borderLight,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  turboIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#00F2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: THEME.textPrimary,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
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
  limitsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#090D15',
    marginHorizontal: 14,
    marginTop: 10,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.2)',
  },
  limitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  limitText: {
    fontSize: 10,
    color: THEME.textSecondary,
  },
  limitBold: {
    fontWeight: '800',
    color: THEME.textPrimary,
  },
  limitDivider: {
    width: 1,
    height: 14,
    backgroundColor: THEME.borderLight,
  },
  pipelineBar: {
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: 14,
    marginTop: 10,
  },
  pipeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: THEME.bgCard,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.borderLight,
  },
  pipeOptionActiveTurbo: {
    backgroundColor: '#00F2FE',
    borderColor: '#00F2FE',
  },
  pipeOptionActiveEco: {
    backgroundColor: THEME.successEmerald,
    borderColor: THEME.successEmerald,
  },
  pipeTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.textPrimary,
  },
  pipeTitleActive: {
    color: '#080B11',
  },
  pipeSub: {
    fontSize: 9,
    color: THEME.textMuted,
    marginTop: 1,
  },
  pipeSubActive: {
    color: '#080B11',
    fontWeight: '600',
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 6,
    marginHorizontal: 14,
    marginTop: 10,
    marginBottom: 6,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    backgroundColor: THEME.bgCard,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: THEME.borderLight,
  },
  tabBtnActive: {
    backgroundColor: THEME.accentCyan,
    borderColor: THEME.accentCyan,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.textSecondary,
  },
  tabTextActive: {
    color: '#080B11',
  },
  contentScroll: {
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 20,
  },
  customUploadSection: {
    marginBottom: 12,
  },
  customPickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 242, 254, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.3)',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  customPickerBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.accentCyan,
  },
  customForm: {
    backgroundColor: THEME.bgCard,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: THEME.borderLight,
    gap: 8,
  },
  formLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.textMuted,
    letterSpacing: 0.5,
  },
  formInput: {
    backgroundColor: THEME.bgSurface,
    borderWidth: 1,
    borderColor: THEME.borderLight,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: THEME.textPrimary,
    fontSize: 12,
  },
  sizeInputRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  unitToggleGroup: {
    flexDirection: 'row',
    backgroundColor: THEME.bgSurface,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: THEME.borderLight,
    overflow: 'hidden',
  },
  unitBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  unitBtnActive: {
    backgroundColor: THEME.accentCyan,
  },
  unitBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: THEME.textSecondary,
  },
  unitBtnTextActive: {
    color: '#080B11',
  },
  formErrorText: {
    fontSize: 11,
    color: THEME.dangerRose,
    fontWeight: '600',
  },
  formValidText: {
    fontSize: 11,
    color: THEME.successEmerald,
    fontWeight: '600',
  },
  submitCustomBtn: {
    backgroundColor: '#00F2FE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 4,
  },
  submitCustomBtnText: {
    color: '#080B11',
    fontWeight: '800',
    fontSize: 12,
  },
  presetsHeaderLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.textMuted,
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  itemsGrid: {
    gap: 8,
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.bgCard,
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: THEME.borderLight,
    gap: 10,
  },
  photoThumb: {
    width: 60,
    height: 60,
    borderRadius: 6,
  },
  cardBody: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.textPrimary,
  },
  itemSub: {
    fontSize: 11,
    color: THEME.textSecondary,
    marginTop: 2,
  },
  capacityBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 5,
  },
  sizePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 242, 254, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.3)',
  },
  sizePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.accentCyan,
  },
  formatText: {
    fontSize: 10,
    color: THEME.textMuted,
  },
  quickUploadBtn: {
    padding: 8,
    backgroundColor: THEME.bgSurface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.borderLight,
  },
  itemsList: {
    gap: 8,
  },
  videoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.bgCard,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: THEME.borderLight,
    gap: 12,
  },
  videoIconBox: {
    width: 64,
    height: 52,
    backgroundColor: '#0F091E',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(127, 0, 255, 0.3)',
  },
  videoDuration: {
    fontSize: 9,
    color: THEME.accentViolet,
    fontWeight: '700',
    marginTop: 1,
  },
  videoBody: {
    flex: 1,
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.bgCard,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: THEME.borderLight,
    gap: 12,
  },
  fileIconBox: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileBody: {
    flex: 1,
  },
  uploadingBox: {
    margin: 14,
    backgroundColor: '#090D15',
    borderRadius: 12,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#00F2FE',
  },
  uploadingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00F2FE',
  },
  uploadingTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#00F2FE',
    letterSpacing: 0.5,
  },
  uploadingFileName: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.textPrimary,
    marginBottom: 12,
  },
  progressBarTrack: {
    height: 10,
    backgroundColor: THEME.bgCard,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#00F2FE',
  },
  telemetryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  telemetryText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.textSecondary,
  },
  speedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 242, 254, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  speedBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#00F2FE',
  },
  broadbandNotice: {
    fontSize: 10,
    color: THEME.textMuted,
    marginTop: 10,
    textAlign: 'center',
  },
});
