const { spawn } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

console.log('========================================================');
console.log('🌟 Launching Vortex Full-Stack WebRTC Calling & Gaming Platform');
console.log('========================================================');

// 1. Start Socket.io Signaling Server
const serverProcess = spawn('node', ['server/index.js'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: true,
});

// 2. Start Vite Web Client
const clientProcess = spawn('npm', ['--prefix', 'web', 'run', 'dev'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: true,
});

function cleanup() {
  console.log('\nShutting down all processes...');
  try { serverProcess.kill(); } catch (e) {}
  try { clientProcess.kill(); } catch (e) {}
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
