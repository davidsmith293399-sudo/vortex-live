/**
 * Production WebRTC Configuration & RTCConfiguration ICE Servers
 * Includes STUN fallback servers and TURN relay template.
 */
export const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun.cloudflare.com:3478' },
    // In production, add your TURN server for symmetric NAT traversal:
    // {
    //   urls: 'turn:turn.yourdomain.com:3478',
    //   username: 'user',
    //   credential: 'password'
    // }
  ],
  iceCandidatePoolSize: 10,
};

/**
 * Audio Capture Constraints (Opus Interactive Speech & Music Optimization)
 */
export const DEFAULT_AUDIO_CONSTRAINTS = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
  sampleRate: 48000,
  channelCount: 2,
};

/**
 * Camera Resolution Presets
 */
export const RESOLUTION_PRESETS = {
  '360p': {
    id: '360p',
    label: '360p Data Saver',
    badge: 'ECO',
    width: { ideal: 640 },
    height: { ideal: 360 },
    frameRate: { max: 24 },
    bitrate: 350000, // 350 Kbps
  },
  '720p': {
    id: '720p',
    label: '720p Balanced HD',
    badge: 'HD',
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { max: 30 },
    bitrate: 1500000, // 1.5 Mbps
  },
  '1080p': {
    id: '1080p',
    label: '1080p Full HD',
    badge: 'FHD',
    width: { ideal: 1920 },
    height: { ideal: 1080 },
    frameRate: { max: 30 },
    bitrate: 3500000, // 3.5 Mbps
  },
  '60fps_game': {
    id: '60fps_game',
    label: '60 FPS Gaming Stream',
    badge: '60 FPS',
    width: { ideal: 1920 },
    height: { ideal: 1080 },
    frameRate: { ideal: 60, max: 60 },
    bitrate: 6000000, // 6.0 Mbps
  }
};

/**
 * Screen Share Presets (Optimized for text, UI or high-frame-rate game capture)
 */
export const SCREEN_SHARE_PRESETS = {
  presentation: {
    id: 'presentation',
    name: 'Presentation / Slides',
    description: 'High text sharpness, 5 FPS for lowest bandwidth',
    frameRate: { max: 5 },
    contentHint: 'detail',
    audio: true,
  },
  standard: {
    id: 'standard',
    name: 'Smooth Navigation',
    description: '30 FPS balanced motion for app demos and video',
    frameRate: { max: 30 },
    contentHint: 'motion',
    audio: true,
  },
  gaming_60fps: {
    id: 'gaming_60fps',
    name: '60 FPS Gaming Stream',
    description: 'Ultra-smooth high-definition 60 FPS gameplay with system audio',
    frameRate: { ideal: 60, max: 60 },
    contentHint: 'motion',
    audio: {
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false, // Pristine in-game audio pass-through
    },
  }
};

export const REACTION_EMOJIS = ['🔥', '🎮', '🚀', '❤️', '👏', '💀', '🎉', '🤯'];
