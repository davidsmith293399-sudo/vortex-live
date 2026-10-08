import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../theme/colors';
import { useBandwidth } from '../../context/BandwidthContext';
import { useCall } from '../../context/CallContext';

export const ScreenShareViewer = () => {
  const { currentScreenShareMode, screenShareModeId, setScreenShareModeId } = useBandwidth();
  const { isScreenSharing, toggleScreenShare, activeCall } = useCall();

  // Active scene: 'code' | 'dashboard' | 'gaming'
  const [activeScene, setActiveScene] = useState('code');

  // Full-screen state
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Floating controls overlay visibility in full screen
  const [showControls, setShowControls] = useState(true);

  // Zoom scale: 1.0 (100%), 1.25 (125%), 1.5 (150%), 2.0 (200%)
  const [zoomScale, setZoomScale] = useState(1.0);

  // Fit mode: 'fit' (contain 16:9) | 'fill'
  const [fitMode, setFitMode] = useState('fit');

  // Live 60 FPS animation ticker to demonstrate smooth continuous streaming
  const [frameTick, setFrameTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setFrameTick(t => (t + 1) % 60);
    }, 100);
    return () => clearInterval(timer);
  }, []);

  const handleZoomIn = () => {
    setZoomScale(prev => Math.min(2.0, +(prev + 0.25).toFixed(2)));
  };

  const handleZoomOut = () => {
    setZoomScale(prev => Math.max(1.0, +(prev - 0.25).toFixed(2)));
  };

  const handleResetZoom = () => {
    setZoomScale(1.0);
  };

  // Render the inner shared screen content with razor-sharp fidelity
  const renderScreenContent = (isFull = false) => {
    return (
      <View
        style={[
          styles.viewportCanvas,
          isFull && styles.viewportCanvasFullScreen,
          fitMode === 'fill' && styles.viewportCanvasFill,
          { transform: [{ scale: zoomScale }] }
        ]}
      >
        {/* ================= SCENE 1: ULTRA-SHARP CODE IDE ================= */}
        {activeScene === 'code' && (
          <View style={styles.ideContainer}>
            {/* IDE Top Tab Bar */}
            <View style={styles.ideTopBar}>
              <View style={styles.ideWindowButtons}>
                <View style={[styles.windowCircle, { backgroundColor: '#FF5F56' }]} />
                <View style={[styles.windowCircle, { backgroundColor: '#FFBD2E' }]} />
                <View style={[styles.windowCircle, { backgroundColor: '#27C93F' }]} />
              </View>

              <View style={styles.ideTabsList}>
                <View style={[styles.ideTab, styles.ideTabActive]}>
                  <Ionicons name="logo-react" size={12} color="#00F2FE" />
                  <Text style={styles.ideTabTextActive}>VortexScreenStreamer.tsx</Text>
                  <Ionicons name="close" size={10} color={THEME.textMuted} />
                </View>

                <View style={styles.ideTab}>
                  <Ionicons name="code-slash" size={12} color="#E056FD" />
                  <Text style={styles.ideTabText}>AudioDSP.rs</Text>
                </View>

                <View style={styles.ideTab}>
                  <Ionicons name="document-text" size={12} color="#F39C12" />
                  <Text style={styles.ideTabText}>package.json</Text>
                </View>
              </View>

              <View style={styles.ideLiveBadge}>
                <View style={styles.ideLiveDot} />
                <Text style={styles.ideLiveText}>60.0 FPS</Text>
              </View>
            </View>

            {/* IDE Workspace (Activity Bar + File Tree + Editor) */}
            <View style={styles.ideBody}>
              {/* Activity Bar Left */}
              <View style={styles.ideActivityBar}>
                <Ionicons name="documents-outline" size={14} color="#FFF" style={styles.activeActivityIcon} />
                <Ionicons name="search-outline" size={14} color={THEME.textMuted} />
                <Ionicons name="git-branch-outline" size={14} color={THEME.textMuted} />
                <Ionicons name="play-outline" size={14} color={THEME.textMuted} />
                <Ionicons name="settings-outline" size={14} color={THEME.textMuted} />
              </View>

              {/* Code Lines Editor */}
              <ScrollView style={styles.ideEditor} showsVerticalScrollIndicator={false}>
                <View style={styles.codeLineRow}>
                  <Text style={styles.lineNumber}>1</Text>
                  <Text style={styles.codeText}>
                    <Text style={styles.cKeyword}>import</Text> <Text style={styles.cType}>&#123; NativeStreamEngine &#125;</Text> <Text style={styles.cKeyword}>from</Text> <Text style={styles.cString}>'@vortex/screen-streamer'</Text>;
                  </Text>
                </View>

                <View style={styles.codeLineRow}>
                  <Text style={styles.lineNumber}>2</Text>
                  <Text style={styles.codeText}>
                    <Text style={styles.cKeyword}>import</Text> <Text style={styles.cType}>&#123; OpusCodec, SubpixelCanvas &#125;</Text> <Text style={styles.cKeyword}>from</Text> <Text style={styles.cString}>'@vortex/core'</Text>;
                  </Text>
                </View>

                <View style={styles.codeLineRow}>
                  <Text style={styles.lineNumber}>3</Text>
                  <Text style={styles.codeText}>&nbsp;</Text>
                </View>

                <View style={styles.codeLineRow}>
                  <Text style={styles.lineNumber}>4</Text>
                  <Text style={styles.codeText}>
                    <Text style={styles.cComment}>// Broadcast full 1920x1080 60FPS stream with zero dropped frames</Text>
                  </Text>
                </View>

                <View style={styles.codeLineRow}>
                  <Text style={styles.lineNumber}>5</Text>
                  <Text style={styles.codeText}>
                    <Text style={styles.cKeyword}>export async function</Text> <Text style={styles.cFunction}>startUltraClearScreenShare</Text>(config: <Text style={styles.cType}>StreamConfig</Text>) &#123;
                  </Text>
                </View>

                <View style={styles.codeLineRow}>
                  <Text style={styles.lineNumber}>6</Text>
                  <Text style={styles.codeText}>
                    &nbsp;&nbsp;<Text style={styles.cKeyword}>const</Text> pipeline = <Text style={styles.cKeyword}>await</Text> NativeStreamEngine.<Text style={styles.cFunction}>initialize</Text>(&#123;
                  </Text>
                </View>

                <View style={styles.codeLineRow}>
                  <Text style={styles.lineNumber}>7</Text>
                  <Text style={styles.codeText}>
                    &nbsp;&nbsp;&nbsp;&nbsp;resolution: <Text style={styles.cString}>'1920x1080'</Text>,
                  </Text>
                </View>

                <View style={styles.codeLineRow}>
                  <Text style={styles.lineNumber}>8</Text>
                  <Text style={styles.codeText}>
                    &nbsp;&nbsp;&nbsp;&nbsp;targetFPS: <Text style={styles.cNumber}>60</Text>,
                  </Text>
                </View>

                <View style={styles.codeLineRow}>
                  <Text style={styles.lineNumber}>9</Text>
                  <Text style={styles.codeText}>
                    &nbsp;&nbsp;&nbsp;&nbsp;subpixelSharpness: <Text style={styles.cKeyword}>true</Text>,
                  </Text>
                </View>

                <View style={styles.codeLineRow}>
                  <Text style={styles.lineNumber}>10</Text>
                  <Text style={styles.codeText}>
                    &nbsp;&nbsp;&nbsp;&nbsp;autoFitViewerDisplay: <Text style={styles.cKeyword}>true</Text>,
                  </Text>
                </View>

                <View style={styles.codeLineRow}>
                  <Text style={styles.lineNumber}>11</Text>
                  <Text style={styles.codeText}>
                    &nbsp;&nbsp;&#125;);
                  </Text>
                </View>

                <View style={styles.codeLineRow}>
                  <Text style={styles.lineNumber}>12</Text>
                  <Text style={styles.codeText}>&nbsp;</Text>
                </View>

                <View style={styles.codeLineRow}>
                  <Text style={styles.lineNumber}>13</Text>
                  <Text style={styles.codeText}>
                    &nbsp;&nbsp;<Text style={styles.cComment}>// Attach high-efficiency WebRTC data pipeline</Text>
                  </Text>
                </View>

                <View style={styles.codeLineRow}>
                  <Text style={styles.lineNumber}>14</Text>
                  <Text style={styles.codeText}>
                    &nbsp;&nbsp;<Text style={styles.cKeyword}>return</Text> pipeline.<Text style={styles.cFunction}>broadcastToAllPeers</Text>();
                  </Text>
                </View>

                <View style={styles.codeLineRow}>
                  <Text style={styles.lineNumber}>15</Text>
                  <Text style={styles.codeText}>&#125;</Text>
                </View>
              </ScrollView>
            </View>

            {/* IDE Integrated Terminal Footer */}
            <View style={styles.ideTerminalBar}>
              <View style={styles.terminalPromptRow}>
                <Ionicons name="terminal" size={11} color="#38EF7D" />
                <Text style={styles.terminalText}>
                  vortex-streamer: <Text style={{ color: '#38EF7D' }}>60.0 FPS [Pristine 1080p Stream Active]</Text> • Ping: 18ms • Frame #{frameTick}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* ================= SCENE 2: HIGH-DEF ANALYTICS DASHBOARD ================= */}
        {activeScene === 'dashboard' && (
          <View style={styles.dashboardContainer}>
            <View style={styles.dashHeader}>
              <View style={styles.dashHeaderTitleRow}>
                <Ionicons name="analytics" size={14} color="#00F2FE" />
                <Text style={styles.dashTitle}>VORTEX GLOBAL NETWORK TELEMETRY • LIVE HUD</Text>
              </View>
              <View style={styles.dashLivePill}>
                <Text style={styles.dashLivePillText}>ULTRA HD 60FPS</Text>
              </View>
            </View>

            <View style={styles.dashGrid}>
              <View style={styles.dashCard}>
                <Text style={styles.dashCardLabel}>ACTIVE PEERS</Text>
                <Text style={styles.dashCardValue}>28,490</Text>
                <Text style={styles.dashCardSub}>+14.2% Peak Concurrency</Text>
              </View>

              <View style={styles.dashCard}>
                <Text style={styles.dashCardLabel}>DATA SAVINGS</Text>
                <Text style={[styles.dashCardValue, { color: '#38EF7D' }]}>94.8%</Text>
                <Text style={styles.dashCardSub}>~1.2 MB/min Average</Text>
              </View>

              <View style={styles.dashCard}>
                <Text style={styles.dashCardLabel}>EDGE LATENCY</Text>
                <Text style={[styles.dashCardValue, { color: '#00F2FE' }]}>14 ms</Text>
                <Text style={styles.dashCardSub}>Sub-50ms Global QoS</Text>
              </View>

              <View style={styles.dashCard}>
                <Text style={styles.dashCardLabel}>STREAM FPS</Text>
                <Text style={[styles.dashCardValue, { color: '#E056FD' }]}>60.0</Text>
                <Text style={styles.dashCardSub}>0.0% Frame Drops</Text>
              </View>
            </View>

            {/* Simulated Live Throughput Graph */}
            <View style={styles.graphContainer}>
              <Text style={styles.graphTitle}>LIVE REAL-TIME THROUGHPUT STREAM</Text>
              <View style={styles.graphBarsRow}>
                {[45, 62, 58, 80, 75, 90, 85, 95, 88, 92, 85, 98, 94, 91, 99].map((height, i) => (
                  <View key={i} style={styles.graphBarCol}>
                    <View style={[styles.graphBarItem, { height: `${height}%` }]} />
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* ================= SCENE 3: 60 FPS GAMING STREAM ================= */}
        {activeScene === 'gaming' && (
          <View style={styles.gamingContainer}>
            <View style={styles.gamingOverlayTop}>
              <View style={styles.gamingTitleRow}>
                <Ionicons name="game-controller" size={16} color="#FF007A" />
                <Text style={styles.gamingTitle}>CYBER-ARENA: CHAMPIONSHIP MATCH (60 FPS)</Text>
              </View>

              <View style={styles.fpsCounterBox}>
                <Text style={styles.fpsNumber}>60.0</Text>
                <Text style={styles.fpsLabel}>FPS</Text>
              </View>
            </View>

            {/* Gaming Visual Stage */}
            <View style={styles.gamingVisual}>
              <View style={styles.gamingCrosshair} />
              <View style={styles.gamingRadarBox}>
                <View style={styles.radarSweep} />
                <View style={styles.radarDot} />
              </View>

              <View style={styles.gamingScoreboard}>
                <Text style={styles.scoreText}>MATCH SCORE: 14 - 9 • ROUND 24</Text>
                <Text style={styles.latencyText}>PING: 18ms • RENDER: 16.6ms • ZERO LAG</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <>
      {/* ================= IN-ROOM STAGE (STANDARD VIEW) ================= */}
      <View style={styles.stageWrapper}>
        {/* Stage Header */}
        <View style={styles.stageHeader}>
          <View style={styles.stageHeaderLeft}>
            <View style={styles.liveBroadcastPulse}>
              <View style={styles.livePulseDot} />
              <Text style={styles.liveBroadcastText}>LIVE 60 FPS</Text>
            </View>
            <Text style={styles.stageSharerName} numberOfLines={1}>
              {activeCall?.channelName ? `${activeCall.channelName} Screen` : "Alex Rivera's Screen"}
            </Text>
          </View>

          {/* Scene Selector Tabs */}
          <View style={styles.sceneTabs}>
            <TouchableOpacity
              style={[styles.sceneTab, activeScene === 'code' && styles.sceneTabActive]}
              onPress={() => setActiveScene('code')}
              activeOpacity={0.7}
            >
              <Ionicons name="code-slash" size={11} color={activeScene === 'code' ? '#080B11' : THEME.textMuted} />
              <Text style={[styles.sceneTabText, activeScene === 'code' && styles.sceneTabTextActive]}>Code</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sceneTab, activeScene === 'dashboard' && styles.sceneTabActive]}
              onPress={() => setActiveScene('dashboard')}
              activeOpacity={0.7}
            >
              <Ionicons name="stats-chart" size={11} color={activeScene === 'dashboard' ? '#080B11' : THEME.textMuted} />
              <Text style={[styles.sceneTabText, activeScene === 'dashboard' && styles.sceneTabTextActive]}>Dashboard</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sceneTab, activeScene === 'gaming' && styles.sceneTabActive]}
              onPress={() => setActiveScene('gaming')}
              activeOpacity={0.7}
            >
              <Ionicons name="game-controller" size={11} color={activeScene === 'gaming' ? '#080B11' : THEME.textMuted} />
              <Text style={[styles.sceneTabText, activeScene === 'gaming' && styles.sceneTabTextActive]}>60FPS Game</Text>
            </TouchableOpacity>
          </View>

          {/* Controls: Fit Mode & Full Screen Trigger */}
          <View style={styles.stageHeaderRight}>
            {/* FULL SCREEN BUTTON (PROMINENT) */}
            <TouchableOpacity
              style={styles.fullScreenButton}
              onPress={() => setIsFullScreen(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="scan-outline" size={14} color="#080B11" />
              <Text style={styles.fullScreenButtonText}>Full Screen</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Viewport Container (Maintains 16:9 Aspect Ratio cleanly) */}
        <TouchableOpacity
          style={styles.stageViewport}
          onPress={() => setIsFullScreen(true)}
          activeOpacity={0.95}
        >
          {renderScreenContent(false)}

          {/* Bottom Telemetry Floating Strip */}
          <View style={styles.viewportBottomBar}>
            <View style={styles.viewportQualityBadge}>
              <Ionicons name="shield-checkmark" size={11} color="#00F2FE" />
              <Text style={styles.viewportQualityText}>
                {currentScreenShareMode.name} • 1080p 60FPS • Crystal Sharp Text
              </Text>
            </View>

            <View style={styles.expandPrompt}>
              <Ionicons name="expand" size={12} color="#FFF" />
              <Text style={styles.expandPromptText}>Tap to View Full Screen</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* ================= DEDICATED FULL-SCREEN MODAL ================= */}
      {/* Maximum display utilization, hides ALL room UI, responsive 16:9 auto-fit */}
      <Modal
        visible={isFullScreen}
        animationType="fade"
        transparent={false}
        onRequestClose={() => setIsFullScreen(false)}
      >
        <TouchableOpacity
          style={styles.fullScreenModalBackdrop}
          activeOpacity={1}
          onPress={() => setShowControls(p => !p)}
        >
          {/* FLOATING TOP CONTROL BAR (AUTO-MAXIMIZES SCREEN AREA) */}
          {showControls && (
            <View style={styles.fsFloatingHeader}>
              <View style={styles.fsHeaderLeft}>
                <View style={styles.fsLiveBadge}>
                  <View style={styles.livePulseDot} />
                  <Text style={styles.fsLiveText}>LIVE 60 FPS</Text>
                </View>
                <View>
                  <Text style={styles.fsTitle}>
                    {activeCall?.channelName ? `${activeCall.channelName} Broadcast` : "Alex Rivera's Screen"}
                  </Text>
                  <Text style={styles.fsSubtitle}>1080p Ultra-HD • Zero Distortion • Auto-Fit</Text>
                </View>
              </View>

              {/* Scene Switcher Pills */}
              <View style={styles.fsSceneSwitch}>
                <TouchableOpacity
                  style={[styles.fsSceneBtn, activeScene === 'code' && styles.fsSceneBtnActive]}
                  onPress={() => setActiveScene('code')}
                >
                  <Text style={[styles.fsSceneText, activeScene === 'code' && styles.fsSceneTextActive]}>Code</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.fsSceneBtn, activeScene === 'dashboard' && styles.fsSceneBtnActive]}
                  onPress={() => setActiveScene('dashboard')}
                >
                  <Text style={[styles.fsSceneText, activeScene === 'dashboard' && styles.fsSceneTextActive]}>Dashboard</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.fsSceneBtn, activeScene === 'gaming' && styles.fsSceneBtnActive]}
                  onPress={() => setActiveScene('gaming')}
                >
                  <Text style={[styles.fsSceneText, activeScene === 'gaming' && styles.fsSceneTextActive]}>60FPS Game</Text>
                </TouchableOpacity>
              </View>

              {/* Zoom & Exit Actions */}
              <View style={styles.fsHeaderRight}>
                {/* Zoom Scale Selector */}
                <View style={styles.zoomControlGroup}>
                  <TouchableOpacity style={styles.zoomBtn} onPress={handleZoomOut}>
                    <Ionicons name="remove" size={14} color="#FFF" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.zoomResetBtn} onPress={handleResetZoom}>
                    <Text style={styles.zoomLabel}>{Math.round(zoomScale * 100)}%</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.zoomBtn} onPress={handleZoomIn}>
                    <Ionicons name="add" size={14} color="#FFF" />
                  </TouchableOpacity>
                </View>

                {/* Fit Mode Toggle */}
                <TouchableOpacity
                  style={[styles.fsActionPill, fitMode === 'fill' && styles.fsActionPillActive]}
                  onPress={() => setFitMode(fitMode === 'fit' ? 'fill' : 'fit')}
                >
                  <Ionicons name={fitMode === 'fit' ? 'contract-outline' : 'expand-outline'} size={13} color="#FFF" />
                  <Text style={styles.fsActionText}>{fitMode === 'fit' ? '16:9 Fit' : 'Fill Screen'}</Text>
                </TouchableOpacity>

                {/* EXIT FULL SCREEN BUTTON (PROMINENT & RELIABLE) */}
                <TouchableOpacity
                  style={styles.exitFullScreenBtn}
                  onPress={() => setIsFullScreen(false)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="close-circle" size={16} color="#080B11" />
                  <Text style={styles.exitFullScreenText}>Exit Full Screen</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* FULL SCREEN DISPLAY WORKSPACE (100% UTILIZATION) */}
          <View style={styles.fsDisplayArea}>
            {renderScreenContent(true)}
          </View>

          {/* FLOATING BOTTOM TELEMETRY STRIP */}
          {showControls && (
            <View style={styles.fsFloatingFooter}>
              <View style={styles.fsFooterLeft}>
                <View style={styles.greenDot} />
                <Text style={styles.fsFooterText}>
                  Transmission: <Text style={{ color: '#00F2FE' }}>1080p 60FPS High-Definition</Text> • Latency: 16ms • Loss: 0.0%
                </Text>
              </View>

              <Text style={styles.fsTapHint}>Tap screen anywhere to hide/show controls</Text>
            </View>
          )}
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  stageWrapper: {
    backgroundColor: '#0A0F1D',
    borderRadius: THEME.radiusMd,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 242, 254, 0.35)',
    overflow: 'hidden',
    marginBottom: 10,
  },
  stageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: '#0D1424',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 242, 254, 0.15)',
    gap: 8,
  },
  stageHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  liveBroadcastPulse: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 51, 102, 0.18)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FF3366',
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF3366',
  },
  liveBroadcastText: {
    color: '#FF3366',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  stageSharerName: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.textPrimary,
  },
  sceneTabs: {
    flexDirection: 'row',
    backgroundColor: THEME.bgCard,
    borderRadius: 6,
    padding: 2,
    gap: 2,
  },
  sceneTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
  },
  sceneTabActive: {
    backgroundColor: THEME.accentCyan,
  },
  sceneTabText: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.textMuted,
  },
  sceneTabTextActive: {
    color: '#080B11',
  },
  stageHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fullScreenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#00F2FE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  fullScreenButtonText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#080B11',
  },
  stageViewport: {
    height: 210,
    backgroundColor: '#05070D',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  viewportCanvas: {
    width: '100%',
    height: '100%',
    backgroundColor: '#05070D',
  },
  viewportCanvasFullScreen: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  viewportCanvasFill: {
    transform: [{ scale: 1.05 }],
  },
  viewportBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(5, 7, 13, 0.88)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  viewportQualityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  viewportQualityText: {
    fontSize: 10,
    color: '#00F2FE',
    fontWeight: '700',
  },
  expandPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  expandPromptText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: '700',
  },

  // ================= IDE MOCK STYLES =================
  ideContainer: {
    flex: 1,
    backgroundColor: '#0A0E17',
  },
  ideTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#080B12',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#121826',
  },
  ideWindowButtons: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  windowCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  ideTabsList: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  ideTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  ideTabActive: {
    backgroundColor: '#101625',
    borderTopWidth: 1,
    borderTopColor: '#00F2FE',
  },
  ideTabText: {
    fontSize: 10,
    color: THEME.textMuted,
  },
  ideTabTextActive: {
    fontSize: 10,
    color: THEME.textPrimary,
    fontWeight: '700',
  },
  ideLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ideLiveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#38EF7D',
  },
  ideLiveText: {
    fontSize: 9,
    color: '#38EF7D',
    fontWeight: '800',
  },
  ideBody: {
    flex: 1,
    flexDirection: 'row',
  },
  ideActivityBar: {
    width: 26,
    backgroundColor: '#06080E',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
    borderRightWidth: 1,
    borderRightColor: '#121826',
  },
  activeActivityIcon: {
    color: '#00F2FE',
  },
  ideEditor: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#0A0E17',
  },
  codeLineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  lineNumber: {
    width: 24,
    fontSize: 10,
    color: '#3E4C66',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    textAlign: 'right',
    marginRight: 10,
  },
  codeText: {
    fontSize: 11,
    color: '#E2E8F0',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  cKeyword: { color: '#FF79C6', fontWeight: '700' },
  cType: { color: '#8BE9FD' },
  cFunction: { color: '#50FA7B' },
  cString: { color: '#F1FA8C' },
  cNumber: { color: '#BD93F9' },
  cComment: { color: '#6272A4', fontStyle: 'italic' },
  ideTerminalBar: {
    backgroundColor: '#06080E',
    borderTopWidth: 1,
    borderTopColor: '#121826',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  terminalPromptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  terminalText: {
    fontSize: 10,
    color: THEME.textMuted,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },

  // ================= DASHBOARD SCENE =================
  dashboardContainer: {
    flex: 1,
    backgroundColor: '#080E1C',
    padding: 10,
  },
  dashHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dashHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dashTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#00F2FE',
    letterSpacing: 0.5,
  },
  dashLivePill: {
    backgroundColor: 'rgba(0, 242, 254, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dashLivePillText: {
    fontSize: 9,
    color: '#00F2FE',
    fontWeight: '800',
  },
  dashGrid: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  dashCard: {
    flex: 1,
    backgroundColor: '#0F182C',
    borderRadius: 6,
    padding: 6,
    borderWidth: 1,
    borderColor: '#19253F',
  },
  dashCardLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: THEME.textMuted,
    letterSpacing: 0.4,
  },
  dashCardValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFF',
    marginTop: 2,
  },
  dashCardSub: {
    fontSize: 8,
    color: THEME.textMuted,
    marginTop: 1,
  },
  graphContainer: {
    flex: 1,
    backgroundColor: '#0C1322',
    borderRadius: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: '#19253F',
  },
  graphTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: THEME.textMuted,
    marginBottom: 6,
  },
  graphBarsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: 50,
  },
  graphBarCol: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  graphBarItem: {
    backgroundColor: '#00F2FE',
    borderRadius: 2,
  },

  // ================= GAMING SCENE =================
  gamingContainer: {
    flex: 1,
    backgroundColor: '#05070E',
    position: 'relative',
    justifyContent: 'space-between',
    padding: 10,
  },
  gamingOverlayTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  gamingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gamingTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FF007A',
    letterSpacing: 0.5,
  },
  fpsCounterBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#38EF7D',
  },
  fpsNumber: {
    fontSize: 12,
    fontWeight: '900',
    color: '#38EF7D',
  },
  fpsLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#38EF7D',
  },
  gamingVisual: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  gamingCrosshair: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#00F2FE',
  },
  gamingRadarBox: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(56, 239, 125, 0.4)',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  radarSweep: {
    position: 'absolute',
    top: 4,
    left: 21,
    width: 2,
    height: 18,
    backgroundColor: '#38EF7D',
  },
  radarDot: {
    position: 'absolute',
    top: 14,
    left: 28,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FF3366',
  },
  gamingScoreboard: {
    alignItems: 'center',
    backgroundColor: 'rgba(5, 7, 14, 0.85)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  scoreText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFF',
  },
  latencyText: {
    fontSize: 9,
    color: '#00F2FE',
    fontWeight: '700',
    marginTop: 1,
  },

  // ================= FULL SCREEN MODAL STYLES =================
  fullScreenModalBackdrop: {
    flex: 1,
    backgroundColor: '#04060B',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fsFloatingHeader: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 24 : 14,
    left: 14,
    right: 14,
    backgroundColor: 'rgba(9, 13, 22, 0.92)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 10,
  },
  fsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fsLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 51, 102, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FF3366',
  },
  fsLiveText: {
    fontSize: 9,
    color: '#FF3366',
    fontWeight: '800',
  },
  fsTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFF',
  },
  fsSubtitle: {
    fontSize: 9,
    color: THEME.textMuted,
  },
  fsSceneSwitch: {
    flexDirection: 'row',
    backgroundColor: THEME.bgCard,
    borderRadius: 6,
    padding: 2,
    gap: 3,
  },
  fsSceneBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  fsSceneBtnActive: {
    backgroundColor: '#00F2FE',
  },
  fsSceneText: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.textMuted,
  },
  fsSceneTextActive: {
    color: '#080B11',
  },
  fsHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  zoomControlGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.bgCard,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: THEME.borderLight,
  },
  zoomBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  zoomResetBtn: {
    paddingHorizontal: 4,
  },
  zoomLabel: {
    fontSize: 10,
    color: '#00F2FE',
    fontWeight: '800',
  },
  fsActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: THEME.bgCard,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: THEME.borderLight,
  },
  fsActionPillActive: {
    backgroundColor: 'rgba(0, 242, 254, 0.2)',
    borderColor: '#00F2FE',
  },
  fsActionText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: '700',
  },
  exitFullScreenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#00F2FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  exitFullScreenText: {
    color: '#080B11',
    fontWeight: '800',
    fontSize: 11,
  },
  fsDisplayArea: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  fsFloatingFooter: {
    position: 'absolute',
    bottom: Platform.OS === 'android' ? 20 : 14,
    left: 14,
    right: 14,
    backgroundColor: 'rgba(9, 13, 22, 0.88)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 9999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  fsFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#38EF7D',
  },
  fsFooterText: {
    fontSize: 10,
    color: THEME.textSecondary,
    fontWeight: '600',
  },
  fsTapHint: {
    fontSize: 9,
    color: THEME.textMuted,
    fontStyle: 'italic',
  },
});
