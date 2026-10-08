import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../theme/colors';

// Default live signaling and WebRTC interface URL
const DEFAULT_URL = 'https://vortex-live-1.onrender.com';

export const LiveWebRTCView = ({
  roomId = 'hangout-hq',
  userName = 'MobileUser',
  onClose,
  initialUrl = null,
}) => {
  const targetUrl = initialUrl || `${DEFAULT_URL}/?room=${encodeURIComponent(roomId)}&name=${encodeURIComponent(userName)}`;
  const [isLoading, setIsLoading] = useState(true);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join my live video & gaming call room on Vortex: ${targetUrl}`,
        url: targetUrl,
        title: 'Join Vortex Live Room',
      });
    } catch (err) {
      console.warn('Share error:', err);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Embedded Control Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={onClose}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={20} color="#fff" />
        </TouchableOpacity>

        <View style={styles.roomInfo}>
          <View style={styles.liveDot} />
          <Text style={styles.roomTitle} numberOfLines={1}>
            ROOM: {roomId.toUpperCase()}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.shareBtn}
          onPress={handleShare}
          activeOpacity={0.7}
        >
          <Ionicons name="share-social-outline" size={18} color="#00F2FE" />
          <Text style={styles.shareText}>Invite</Text>
        </TouchableOpacity>
      </View>

      {/* Embedded Real WebRTC Audio/Video Engine via WebView */}
      <View style={styles.webWrapper}>
        <WebView
          source={{ uri: targetUrl }}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          startInLoadingState={true}
          originWhitelist={['*']}
          userAgent="Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36 VortexApp/1.0"
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          renderLoading={() => (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#00F2FE" />
              <Text style={styles.loadingText}>Connecting to HD Video & Audio Room...</Text>
            </View>
          )}
          androidCameraPermissionOptions={{
            title: 'Permission to use camera',
            message: 'VortexChat requires camera access for high-definition video calling.',
            buttonPositive: 'Allow',
            buttonNegative: 'Deny',
          }}
          androidMicrophonePermissionOptions={{
            title: 'Permission to use microphone',
            message: 'VortexChat requires microphone access for crystal-clear voice communication.',
            buttonPositive: 'Allow',
            buttonNegative: 'Deny',
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#06080F',
  },
  topBar: {
    height: 48,
    backgroundColor: '#0B0F19',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  backBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  roomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00F2FE',
  },
  roomTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 242, 254, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.3)',
  },
  shareText: {
    color: '#00F2FE',
    fontSize: 11,
    fontWeight: '700',
  },
  webWrapper: {
    flex: 1,
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
    backgroundColor: '#06080F',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#06080F',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
});
