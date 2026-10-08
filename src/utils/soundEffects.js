// VortexChat - Studio-Grade Acoustic Sound Engine
// Engineered with harmonious musical intervals & warm biquad low-pass filtering
// Sounds pleasant, luxurious, and crystal-clear (like Apple / Discord / Slack)

let audioCtx = null;
let soundEnabled = true;
let soundPreset = 'marimba'; // 'marimba' (warm rhodes/marimba) | 'bell' (glass crystal)

const getContext = () => {
  if (typeof window !== 'undefined') {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      if (!audioCtx) {
        audioCtx = new AudioContextClass();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      return audioCtx;
    }
  }
  return null;
};

export const setSoundEnabled = (enabled) => {
  soundEnabled = enabled;
};

export const isSoundEnabled = () => soundEnabled;

export const setSoundPreset = (preset) => {
  soundPreset = preset;
};

export const getSoundPreset = () => soundPreset;

/**
 * Synthesizes a warm, organic acoustic note using a fundamental sine + 2nd harmonic
 * coupled with a smooth 2.4kHz low-pass filter to eliminate any harshness or digital artifacts.
 */
const synthesizeAcousticChime = (ctx, freq, startTime, duration, volume = 0.22) => {
  // Warm low-pass biquad filter for smooth analog feel
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(2600, startTime);
  filter.Q.setValueAtTime(1.0, startTime);

  // Fundamental tone (warm acoustic core)
  const oscFundamental = ctx.createOscillator();
  oscFundamental.type = 'sine';
  oscFundamental.frequency.setValueAtTime(freq, startTime);

  // Harmonic overtone (rich acoustic resonance)
  const oscHarmonic = ctx.createOscillator();
  oscHarmonic.type = 'sine';
  oscHarmonic.frequency.setValueAtTime(freq * 2, startTime);

  // Envelopes
  const gainFundamental = ctx.createGain();
  const gainHarmonic = ctx.createGain();

  // Silky 6ms attack (zero clicking) + smooth natural exponential decay
  gainFundamental.gain.setValueAtTime(0.0001, startTime);
  gainFundamental.gain.linearRampToValueAtTime(volume, startTime + 0.006);
  gainFundamental.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  gainHarmonic.gain.setValueAtTime(0.0001, startTime);
  gainHarmonic.gain.linearRampToValueAtTime(volume * 0.16, startTime + 0.006);
  gainHarmonic.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * 0.65);

  oscFundamental.connect(gainFundamental);
  oscHarmonic.connect(gainHarmonic);

  gainFundamental.connect(filter);
  gainHarmonic.connect(filter);

  filter.connect(ctx.destination);

  oscFundamental.start(startTime);
  oscFundamental.stop(startTime + duration + 0.02);

  oscHarmonic.start(startTime);
  oscHarmonic.stop(startTime + duration + 0.02);
};

/**
 * Professional, pleasant, and warm ascending chime when entering a call
 * Musical Interval: D5 (587.33 Hz) -> G5 (783.99 Hz) [Harmonious Perfect Fourth]
 */
export const playJoinSound = () => {
  if (!soundEnabled) return;
  try {
    const ctx = getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // First Note: Warm opening D5 (587.33 Hz)
    synthesizeAcousticChime(ctx, 587.33, now, 0.28, 0.20);

    // Second Note: Bright, welcoming resolution G5 (783.99 Hz) starting 110ms later
    synthesizeAcousticChime(ctx, 783.99, now + 0.11, 0.44, 0.24);
  } catch (err) {
    console.warn('Could not play join sound:', err);
  }
};

/**
 * Gentle, polished descending chime when exiting a call
 * Musical Interval: G5 (783.99 Hz) -> D5 (587.33 Hz) [Soft, calm release]
 */
export const playLeaveSound = () => {
  if (!soundEnabled) return;
  try {
    const ctx = getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // First Note: Gentle departure G5 (783.99 Hz)
    synthesizeAcousticChime(ctx, 783.99, now, 0.24, 0.18);

    // Second Note: Soft, grounded farewell D5 (587.33 Hz) starting 100ms later
    synthesizeAcousticChime(ctx, 587.33, now + 0.10, 0.38, 0.16);
  } catch (err) {
    console.warn('Could not play leave sound:', err);
  }
};

/**
 * Subtle, modern acoustic pop for microphone mute/unmute
 */
export const playToggleSound = (isMuted) => {
  if (!soundEnabled) return;
  try {
    const ctx = getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const freq = isMuted ? 380 : 540;
    synthesizeAcousticChime(ctx, freq, now, 0.07, 0.12);
  } catch (err) {
    console.warn('Could not play toggle sound:', err);
  }
};
