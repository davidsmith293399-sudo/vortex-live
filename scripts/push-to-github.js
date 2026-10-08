const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const repoUrl = process.argv[2] || 'https://github.com/davidsmith293399-sudo/vortex-live.git';
const token = process.argv[3];

if (!token) {
  console.error('Usage: node scripts/push-to-github.js <repoUrl> <github_token>');
  process.exit(1);
}

async function run() {
  console.log(`[Git] Initializing Git repository in ${rootDir}...`);
  try {
    await git.init({ fs, dir: rootDir, defaultBranch: 'main' });
  } catch (e) {
    // Already initialized
  }

  // Remove existing origin if any
  try {
    await git.deleteRemote({ fs, dir: rootDir, remote: 'origin' });
  } catch (e) {}

  await git.addRemote({
    fs,
    dir: rootDir,
    remote: 'origin',
    url: repoUrl
  });

  console.log('[Git] Staging files (ignoring node_modules, .expo, dist)...');
  
  // Recursively collect files to stage
  const ignoreList = ['node_modules', '.expo', 'dist', '.git', 'web/node_modules', 'web/dist', 'server/node_modules'];

  async function getFiles(dir, base = '') {
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });
    let files = [];
    for (const entry of entries) {
      const relPath = base ? `${base}/${entry.name}` : entry.name;
      if (ignoreList.some(ig => relPath === ig || relPath.startsWith(ig + '/'))) {
        continue;
      }
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files = files.concat(await getFiles(fullPath, relPath));
      } else {
        files.push(relPath);
      }
    }
    return files;
  }

  const allFiles = await getFiles(rootDir);
  console.log(`[Git] Found ${allFiles.length} source files to commit...`);

  for (const file of allFiles) {
    await git.add({ fs, dir: rootDir, filepath: file });
  }

  console.log('[Git] Creating commit...');
  let sha;
  try {
    sha = await git.commit({
      fs,
      dir: rootDir,
      author: {
        name: 'davidsmith293399-sudo',
        email: 'developer@vortexchat.com',
      },
      message: 'Deploy Vortex Live full-stack WebRTC calling and 60fps streaming'
    });
    console.log(`[Git] Committed SHA: ${sha}`);
  } catch (err) {
    console.log('[Git] Commit note:', err.message);
  }

  console.log(`[Git] Pushing code to ${repoUrl}...`);
  const authedUrl = repoUrl.replace('https://', `https://x-access-token:${token}@`);
  const pushResult = await git.push({
    fs,
    http,
    dir: rootDir,
    url: authedUrl,
    remote: 'origin',
    ref: 'main',
    force: true,
    onAuth: () => ({
      username: 'x-access-token',
      password: token
    })
  });

  console.log('===========================================================');
  console.log('🎉 SUCCESS! ALL CODE SUCCESSFULLY PUSHED TO YOUR GITHUB!');
  console.log(`👉 Check your repository: ${repoUrl}`);
  console.log('Now go to Render.com and click Connect!');
  console.log('===========================================================');
}

run().catch(err => {
  console.error('[Git Push Error]:', err);
  process.exit(1);
});
