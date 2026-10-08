# VortexChat Mobile (React Native / Expo)

A Discord-like community voice & video communication platform engineered for **extreme data saving, low-bandwidth networks, and explicit resolution tiers**, ready for Google Play Store publication.

---

## 🌟 Key Features

1. **Discord-Grade Architecture & Dark UI**:
   - Modern obsidian/slate dark theme (`#080B11`, `#0E131F`, `#151D2E`) with glowing cyan (`#00F2FE`) and emerald accents.
   - Leftmost Server Rail with custom guild icons, active indicators, and unread badges.
   - Channel Directory supporting Text Channels and Voice/Video Lounges.
   - User status dock with quick Mic Mute, Audio Deafen, and Settings triggers.

2. **Explicit Resolution & Bandwidth Tiers**:
   - **Crystal Clear Audio**: Opus interactive speech codec (~0.6 MB/min).
   - **360p Ultra Data Saver**: ~1.15 MB/min (AV1/H.264 baseline, 82% savings vs 1080p).
   - **480p Eco Saver**: ~2.67 MB/min (60% savings).
   - **720p Balanced HD**: ~6.18 MB/min (Standard benchmark).
   - **1080p High Definition**: ~13.74 MB/min.
   - **4K Ultra Stream**: ~48.36 MB/min.
   - Real-time estimated consumption rates clearly presented on the UI for each tier.

3. **Live Telemetry & Data Metering HUD**:
   - Real-time accumulated MB consumption tracker.
   - Live MB/min rate meter and bandwidth saved percentage counter.
   - In-call duration timer and audio-speaking pulse detection.

4. **Mobile Low-Bandwidth Screen Sharing**:
   - **Eco Slide Share (5 FPS)**: Downsampled for presentations & code review (~0.68 MB/min, 85% data saver).
   - **Standard Demo (15 FPS)**: Balanced for app navigation (~1.95 MB/min).
   - **Fluid Motion (30 FPS)**: For dynamic content.

---

## 📁 Project Structure

```
├── App.js                                # Primary application root & layout
├── app.json                              # Google Play Store configuration & permissions
├── PLAY_STORE_LISTING.md                 # Play Store listing text, permissions & compliance
├── src/
│   ├── constants/
│   │   ├── dataTiers.js                  # Resolution presets, bitrates, MB/min telemetry
│   │   └── mockData.js                   # Community servers, channels & participants
│   ├── context/
│   │   ├── BandwidthContext.js           # Live data tracking, savings & active tier state
│   │   └── CallContext.js                # Voice/video call state, peers & media toggles
│   ├── theme/
│   │   └── colors.js                     # Unified dark color tokens
│   └── components/
│       ├── common/
│       │   ├── Header.js                 # Top navigation with live MB/min pill
│       │   └── Badge.js                  # Status & resolution badges
│       ├── servers/
│       │   └── ServerRail.js             # Discord server icons vertical sidebar
│       ├── channels/
│       │   └── ChannelDrawer.js          # Text & voice lounges list
│       ├── chat/
│       │   └── ChatRoom.js               # Text messaging & quick call join banner
│       ├── voice/
│       │   ├── VoiceVideoRoom.js         # Group video room & screen share stage
│       │   ├── VideoTile.js              # Participant video/avatar tile with speaking ring
│       │   └── CallControlsBar.js        # Bottom in-call dock
│       ├── user/
│       │   └── UserStatusBar.js          # Bottom user profile bar with mute/deafen
│       └── modals/
│           ├── ResolutionPickerModal.js  # Flagship 360p-4K resolution selector
│           ├── DataSavingsModal.js       # Real-time data savings telemetry sheet
│           ├── ScreenShareModal.js       # Low-bandwidth 5/15/30 FPS screen sharing
│           ├── SettingsModal.js          # Network simulator & AI noise suppression
│           └── AddServerModal.js         # Community server creation
```

---

## 🚀 Running the Project

### Prerequisites
- Node.js 18+ installed

### Development Server
```bash
# Start Expo development server
npx expo start

# Run on Android device / emulator
npx expo start --android

# Run in Web browser
npx expo start --web
```

### Production Build for Google Play Store (AAB)
```bash
# Install EAS CLI
npm install -g eas-cli

# Log in to Expo Application Services
eas login

# Configure project
eas build:configure

# Build Android App Bundle (AAB) for Google Play Store
eas build --platform android --profile production
```
