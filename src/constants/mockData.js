// VortexChat - Mock Data for Discord-grade communities & communication

export const MOCK_SERVERS = [
  {
    id: 'srv_vortex_hq',
    name: 'Vortex Global Lounge',
    initials: 'VG',
    iconColor: '#00F2FE',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
    unreadCount: 3,
    description: 'The main hub for high-speed file sharing and low-bandwidth voice & video.',
    membersCount: 1420,
    channels: [
      { 
        id: 'ch_announcements', 
        name: 'announcements', 
        type: 'text', 
        topic: 'Important VortexChat updates and data optimizations',
        iconUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=150&q=80'
      },
      { 
        id: 'ch_general', 
        name: 'general-chat', 
        type: 'text', 
        topic: 'Hang out and connect with friends',
        iconUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=150&q=80'
      },
      { 
        id: 'ch_data_tips', 
        name: 'data-saver-tips', 
        type: 'text', 
        topic: 'Strategies to call with < 50MB per day',
        iconUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=150&q=80'
      },
      { 
        id: 'ch_lounge_voice', 
        name: 'General Lounge', 
        type: 'voice', 
        bitrateKbps: 12,
        iconUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=150&q=80',
        activeParticipants: ['usr_alex', 'usr_sarah', 'usr_kenji'],
        isAudioEco: true
      },
      { 
        id: 'ch_gaming_squad', 
        name: 'Gaming Squad (360p)', 
        type: 'video', 
        defaultResolution: '360p',
        iconUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=150&q=80',
        activeParticipants: ['usr_maya', 'usr_dave'],
        isAudioEco: true
      },
      { 
        id: 'ch_study_room', 
        name: 'Study Room (Zero Data)', 
        type: 'voice', 
        bitrateKbps: 8,
        iconUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=150&q=80',
        activeParticipants: ['usr_sarah'],
        isAudioEco: true
      },
      { 
        id: 'ch_screenshare_demo', 
        name: 'Eco Screen Share (5 FPS)', 
        type: 'screenshare', 
        iconUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=150&q=80',
        activeParticipants: ['usr_alex'],
        isAudioEco: true
      },
    ]
  },
  {
    id: 'srv_dev_squad',
    name: 'Code & Devs Mobile',
    initials: 'CD',
    iconColor: '#7F00FF',
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=200&q=80',
    unreadCount: 0,
    description: 'Mobile engineers sharing high-speed gigabyte archives and assets.',
    membersCount: 520,
    channels: [
      { id: 'ch_dev_chat', name: 'dev-talk', type: 'text', topic: 'React Native & Low-Level Codec hacks', iconUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=150&q=80' },
      { id: 'ch_pairing', name: 'Pair Programming (Voice)', type: 'voice', activeParticipants: [], isAudioEco: true, iconUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=150&q=80' },
      { id: 'ch_code_stream', name: '5 FPS Code Stream', type: 'screenshare', activeParticipants: [], isAudioEco: true },
    ]
  },
  {
    id: 'srv_gaming_arena',
    name: 'Tactical Gamers HQ',
    initials: 'TG',
    iconColor: '#FF007A',
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=200&q=80',
    unreadCount: 1,
    description: 'Voice chat and ultra-fast 10GB clip sharing for gamers.',
    membersCount: 890,
    channels: [
      { id: 'ch_lobby', name: 'matchmaking', type: 'text', topic: 'Drop gamer tags here', iconUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=150&q=80' },
      { id: 'ch_squad_voice', name: 'Squad Comm (Low Latency)', type: 'voice', activeParticipants: ['usr_kenji', 'usr_dave'], isAudioEco: true },
    ]
  },
  {
    id: 'srv_study_intl',
    name: 'Global Study Group',
    initials: 'GS',
    iconColor: '#38EF7D',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=200&q=80',
    unreadCount: 0,
    description: 'Students connecting across continents with fast 100MB lecture photo sharing.',
    membersCount: 310,
    channels: [
      { id: 'ch_study_notes', name: 'notes-archive', type: 'text', topic: 'Lightweight markdown notes' },
      { id: 'ch_study_voice', name: 'Silent Study (Opus)', type: 'voice', activeParticipants: [], isAudioEco: true },
    ]
  }
];

export const CURRENT_USER = {
  id: 'usr_me',
  username: 'CyberPilot',
  tag: '#4096',
  avatarBg: '#00F2FE',
  status: 'online', // 'online' | 'offline'
  customStatus: '⚡ Vortex Ultra-Eco (360p)',
  isMuted: false,
  isDeafened: false,
  isVideoOn: true,
  isScreenSharing: false,
};

// Community Member Directory with Online & Offline Statuses
export const MOCK_COMMUNITY_MEMBERS = [
  // ONLINE MEMBERS
  {
    id: 'usr_me',
    name: 'CyberPilot (You)',
    status: 'online',
    role: 'Admin',
    customStatus: '⚡ Vortex Ultra-Eco (360p)',
    avatarColor: '#00F2FE',
    currentChannel: null,
    trafficFiltered: true,
  },
  {
    id: 'usr_alex',
    name: 'Alex Rivera',
    status: 'online',
    role: 'Community Lead',
    customStatus: 'In General Lounge 🔊',
    avatarColor: '#4FACFE',
    currentChannel: 'General Lounge',
    trafficFiltered: true,
  },
  {
    id: 'usr_maya',
    name: 'Maya Patel',
    status: 'online',
    role: 'Moderator',
    customStatus: 'Streaming @ 360p Eco 📹',
    avatarColor: '#F39C12',
    currentChannel: 'Gaming Squad (360p)',
    trafficFiltered: true,
  },
  {
    id: 'usr_kenji',
    name: 'Kenji Sato',
    status: 'online',
    role: 'Member',
    customStatus: 'Listening • Eco Mode 🎧',
    avatarColor: '#6C5CE7',
    currentChannel: 'General Lounge',
    trafficFiltered: true,
  },
  {
    id: 'usr_elena',
    name: 'Elena Rostova',
    status: 'online',
    role: 'VIP',
    customStatus: 'Road Trip • Traffic Noise Filtered 🚗',
    avatarColor: '#E056FD',
    currentChannel: null,
    trafficFiltered: true,
  },

  // OFFLINE MEMBERS
  {
    id: 'usr_sarah',
    name: 'Sarah Chen',
    status: 'offline',
    role: 'Member',
    customStatus: 'Offline • Last seen 18m ago',
    avatarColor: '#FF6B6B',
    lastSeen: '18m ago',
  },
  {
    id: 'usr_dave',
    name: 'Dave Miller',
    status: 'offline',
    role: 'Member',
    customStatus: 'Offline • Last seen 2h ago',
    avatarColor: '#00B894',
    lastSeen: '2h ago',
  },
  {
    id: 'usr_liam',
    name: 'Liam Vance',
    status: 'offline',
    role: 'Member',
    customStatus: 'Offline • Yesterday at 11:20 PM',
    avatarColor: '#A29BFE',
    lastSeen: 'Yesterday',
  },
  {
    id: 'usr_tanya',
    name: 'Tanya Gomez',
    status: 'offline',
    role: 'Member',
    customStatus: 'Offline • 3 days ago',
    avatarColor: '#FD79A8',
    lastSeen: '3 days ago',
  },
];

export const MOCK_PARTICIPANTS = {
  usr_alex: {
    id: 'usr_alex',
    name: 'Alex Rivera',
    statusText: 'Streaming @ 360p Eco',
    avatarColor: '#4FACFE',
    isSpeaking: true,
    isMuted: false,
    isVideoOn: true,
    networkQuality: 'Good (3G+)',
    currentTier: '360p',
    role: 'Server Admin',
    pingMs: 42,
  },
  usr_sarah: {
    id: 'usr_sarah',
    name: 'Sarah Chen',
    statusText: 'Opus Audio Only',
    avatarColor: '#FF6B6B',
    isSpeaking: false,
    isMuted: false,
    isVideoOn: false,
    networkQuality: 'Weak (2G Edge)',
    currentTier: 'audio_only',
    role: 'Moderator',
    pingMs: 110,
  },
  usr_kenji: {
    id: 'usr_kenji',
    name: 'Kenji Sato',
    statusText: 'Listening • Eco Mode',
    avatarColor: '#6C5CE7',
    isSpeaking: false,
    isMuted: true,
    isVideoOn: false,
    networkQuality: 'Excellent (LTE)',
    currentTier: 'audio_only',
    role: 'Member',
    pingMs: 28,
  },
  usr_maya: {
    id: 'usr_maya',
    name: 'Maya Patel',
    statusText: 'Live Stream 480p',
    avatarColor: '#F39C12',
    isSpeaking: true,
    isMuted: false,
    isVideoOn: true,
    networkQuality: 'Good (LTE)',
    currentTier: '480p',
    role: 'Gamer',
    pingMs: 35,
  },
  usr_dave: {
    id: 'usr_dave',
    name: 'Dave Miller',
    statusText: 'Screen Share 5 FPS',
    avatarColor: '#00B894',
    isSpeaking: false,
    isMuted: false,
    isVideoOn: false,
    networkQuality: 'Stable Wi-Fi',
    currentTier: '360p',
    role: 'Member',
    pingMs: 19,
  }
};

export const INITIAL_CHAT_MESSAGES = [
  {
    id: 'msg_1',
    userId: 'usr_alex',
    userName: 'Alex Rivera',
    avatarColor: '#4FACFE',
    text: 'Welcome to VortexChat! We now support high-speed sharing of up to 100 MB RAW photos and 10 GB videos & files! ⚡',
    timestamp: '10:14 AM',
    resolutionTag: 'Turbo 10GB Engine',
  },
  {
    id: 'msg_2',
    userId: 'usr_sarah',
    userName: 'Sarah Chen',
    avatarColor: '#FF6B6B',
    text: 'Here is the 94.2 MB RAW camera shot from our meetup! Download speed reached 95 MB/s on 5G. 📸',
    timestamp: '10:16 AM',
    resolutionTag: '94.2 MB RAW Photo',
    mediaAttachment: {
      id: 'p_raw_1',
      title: 'DSC_0942_NIGHT_SKY_8K.DNG',
      mediaType: 'photo',
      url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      origSize: '94.2 MB',
      compressedSize: '94.2 MB',
      isTurbo: true,
      transferSpeed: '95 MB/s',
      dimension: '8256 × 5504 RAW'
    }
  },
  {
    id: 'msg_3',
    userId: 'usr_maya',
    userName: 'Maya Patel',
    avatarColor: '#F39C12',
    text: 'Uploading the full 4K 60FPS tournament match (4.8 GB). High-speed multi-threaded transfer completed in seconds! 🎮',
    timestamp: '10:19 AM',
    resolutionTag: '4.8 GB 4K Video',
    mediaAttachment: {
      id: 'v_4k_1',
      title: 'GRAND_FINALS_4K_60FPS_RAW.MP4',
      mediaType: 'video',
      duration: '24:30',
      origSize: '4.8 GB',
      compressedSize: '4.8 GB',
      isTurbo: true,
      transferSpeed: '124 MB/s',
      quality: '4K Ultra-HD (60 FPS)'
    }
  },
  {
    id: 'msg_4',
    userId: 'usr_kenji',
    userName: 'Kenji Sato',
    avatarColor: '#6C5CE7',
    text: 'Awesome! I also attached the 9.4 GB full project archive with high-speed download enabled. 📦',
    timestamp: '10:22 AM',
    resolutionTag: '9.4 GB Archive',
    mediaAttachment: {
      id: 'f_arch_1',
      title: 'vortex-assets-master-2026.7z',
      mediaType: 'file',
      type: '7-Zip Compressed Archive',
      size: '9.4 GB',
      origSize: '9.4 GB',
      icon: 'archive',
      color: '#00F2FE',
      isTurbo: true,
      transferSpeed: '110 MB/s'
    }
  }
];
