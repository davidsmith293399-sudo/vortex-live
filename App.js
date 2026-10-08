import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView, Platform, Dimensions, TouchableOpacity, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from './src/theme/colors';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { BandwidthProvider, useBandwidth } from './src/context/BandwidthContext';
import { CallProvider, useCall } from './src/context/CallContext';

// Components
import { Header } from './src/components/common/Header';
import { ServerRail } from './src/components/servers/ServerRail';
import { ChannelDrawer } from './src/components/channels/ChannelDrawer';
import { ChatRoom } from './src/components/chat/ChatRoom';
import { VoiceVideoRoom } from './src/components/voice/VoiceVideoRoom';
import { UserStatusBar } from './src/components/user/UserStatusBar';
import { AuthScreen } from './src/components/auth/AuthScreen';
import { MemberListDrawer } from './src/components/members/MemberListDrawer';

// Modals
import { ResolutionPickerModal } from './src/components/modals/ResolutionPickerModal';
import { DataSavingsModal } from './src/components/modals/DataSavingsModal';
import { ScreenShareModal } from './src/components/modals/ScreenShareModal';
import { SettingsModal } from './src/components/modals/SettingsModal';
import { AddServerModal } from './src/components/modals/AddServerModal';
import { AddChannelModal } from './src/components/modals/AddChannelModal';
import { LiveWebRTCView } from './src/components/voice/LiveWebRTCView';

function MainApp() {
  const { isAuthenticated } = useAuth();
  const { activeCall } = useCall();
  const [showChannelDrawer, setShowChannelDrawer] = useState(true);
  const [showMembersList, setShowMembersList] = useState(false);

  // Modal Visibility States
  const [isResPickerOpen, setIsResPickerOpen] = useState(false);
  const [isSavingsModalOpen, setIsSavingsModalOpen] = useState(false);
  const [isScreenShareOpen, setIsScreenShareOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddServerOpen, setIsAddServerOpen] = useState(false);
  const [isAddChannelOpen, setIsAddChannelOpen] = useState(false);
  const [isLiveWebRTCOpen, setIsLiveWebRTCOpen] = useState(false);

  // If user is not authenticated, display the Google & Password Auth Screen
  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar style="light" backgroundColor={THEME.bgSurface} />

      {/* Main App Layout */}
      <View style={styles.appWrapper}>
        {/* Top Header Bar */}
        <Header
          onOpenResolutionPicker={() => setIsResPickerOpen(true)}
          onOpenSavingsModal={() => setIsSavingsModalOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onToggleMembers={() => setShowMembersList(prev => !prev)}
          showMembersList={showMembersList}
          onOpenLiveRoom={() => setIsLiveWebRTCOpen(true)}
        />

        {/* Center Workspace (Server Rail + Channel Drawer + Active Chat/Call Area + Member Directory) */}
        <View style={styles.workspace}>
          {/* Discord Server Icons Vertical Rail */}
          <ServerRail onOpenServerModal={() => setIsAddServerOpen(true)} />

          {/* Collapsible Channels Drawer */}
          {showChannelDrawer && (
            <View style={styles.drawerWrapper}>
              <ChannelDrawer
                onSelectVoiceChannel={(channel) => {
                  // Can collapse drawer if screen is narrow
                }}
                onOpenAddChannel={() => setIsAddChannelOpen(true)}
              />
              <UserStatusBar onOpenSettings={() => setIsSettingsOpen(true)} />
            </View>
          )}

          {/* Drawer Toggle Handle (Tap to hide/show channel sidebar) */}
          <TouchableOpacity
            style={styles.drawerToggleHandle}
            onPress={() => setShowChannelDrawer(prev => !prev)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={showChannelDrawer ? 'chevron-back' : 'chevron-forward'}
              size={14}
              color={THEME.textMuted}
            />
          </TouchableOpacity>

          {/* Main Active Pane: Either VoiceVideoRoom or ChatRoom */}
          <View style={styles.mainPane}>
            {activeCall ? (
              <VoiceVideoRoom
                onOpenResolutionPicker={() => setIsResPickerOpen(true)}
                onOpenSavingsModal={() => setIsSavingsModalOpen(true)}
                onOpenScreenShareModal={() => setIsScreenShareOpen(true)}
              />
            ) : (
              <ChatRoom
                onJoinCallPress={() => {}}
                onOpenResolutionPicker={() => setIsResPickerOpen(true)}
              />
            )}
          </View>

          {/* Right: Online & Offline Members Directory Drawer */}
          {showMembersList && (
            <MemberListDrawer onClose={() => setShowMembersList(false)} />
          )}
        </View>
      </View>

      {/* Modals & Sheets */}
      <ResolutionPickerModal
        visible={isResPickerOpen}
        onClose={() => setIsResPickerOpen(false)}
      />

      <DataSavingsModal
        visible={isSavingsModalOpen}
        onClose={() => setIsSavingsModalOpen(false)}
      />

      <ScreenShareModal
        visible={isScreenShareOpen}
        onClose={() => setIsScreenShareOpen(false)}
      />

      <SettingsModal
        visible={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <AddServerModal
        visible={isAddServerOpen}
        onClose={() => setIsAddServerOpen(false)}
      />

      <AddChannelModal
        visible={isAddChannelOpen}
        onClose={() => setIsAddChannelOpen(false)}
      />

      {/* Embedded Real WebRTC Audio, Video & 60 FPS Gaming Stream Fullscreen Overlay */}
      {isLiveWebRTCOpen && (
        <View style={StyleSheet.absoluteFill}>
          <LiveWebRTCView
            roomId="hangout-hq"
            userName="MobileUser"
            onClose={() => setIsLiveWebRTCOpen(false)}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BandwidthProvider>
        <CallProvider>
          <MainApp />
        </CallProvider>
      </BandwidthProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: THEME.bgApp,
    paddingTop: Platform.OS === 'android' ? 24 : 0,
  },
  appWrapper: {
    flex: 1,
    backgroundColor: THEME.bgApp,
  },
  workspace: {
    flex: 1,
    flexDirection: 'row',
  },
  drawerWrapper: {
    height: '100%',
    backgroundColor: THEME.sidebarBg,
  },
  drawerToggleHandle: {
    width: 14,
    backgroundColor: '#090D15',
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: THEME.borderLight,
    zIndex: 10,
  },
  mainPane: {
    flex: 1,
    backgroundColor: THEME.bgApp,
  },
});
