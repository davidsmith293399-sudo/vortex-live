const { spawn } = require('child_process');

console.log('===========================================================');
console.log('🌐 Generating Instant Public HTTPS Link via Secure Tunnel...');
console.log('===========================================================');

const ssh = spawn('ssh', [
  '-o', 'StrictHostKeyChecking=no',
  '-R', '80:localhost:5001',
  'nokey@localhost.run'
], {
  stdio: ['ignore', 'pipe', 'pipe']
});

ssh.stdout.on('data', (data) => {
  const text = data.toString();
  const match = text.match(/https:\/\/[a-zA-Z0-9.-]+\.lhr\.life/);
  if (match) {
    console.log('\n===========================================================');
    console.log('🎉 YOUR LIVE PUBLIC HTTPS LINK IS READY!');
    console.log(`👉 ${match[0]}`);
    console.log('Send this link to your friend! Both of you can join from mobile or PC.');
    console.log('===========================================================\n');
  }
});

ssh.stderr.on('data', (data) => {
  const err = data.toString();
  if (!err.includes('Pseudo-terminal') && !err.includes('Warning')) {
    process.stderr.write(err);
  }
});

process.on('SIGINT', () => {
  ssh.kill();
  process.exit(0);
});
