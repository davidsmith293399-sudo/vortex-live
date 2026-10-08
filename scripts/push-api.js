const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const owner = 'davidsmith293399-sudo';
const repo = 'vortex-live';
const token = process.argv[2];

if (!token) {
  console.error('Usage: node scripts/push-api.js <github_token>');
  process.exit(1);
}

const headers = {
  'Authorization': `Bearer ${token}`,
  'User-Agent': 'VortexPusher/1.0',
  'Content-Type': 'application/json',
  'Accept': 'application/vnd.github.v3+json',
};

async function api(endpoint, options = {}) {
  const url = `https://api.github.com/repos/${owner}/${repo}${endpoint}`;
  const res = await fetch(url, { ...options, headers: { ...headers, ...(options.headers || {}) } });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`API Error [${res.status}] ${endpoint}: ${JSON.stringify(data)}`);
  }
  return data;
}

// Ignore large/unnecessary folders
const ignoreList = [
  'node_modules',
  '.expo',
  'dist',
  '.git',
  'web/node_modules',
  'web/dist',
  'server/node_modules'
];

async function getFiles(dir, base = '') {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  let files = [];
  for (const entry of entries) {
    const relPath = base ? `${base}/${entry.name}` : entry.name;
    const normPath = relPath.replace(/\\/g, '/');
    if (ignoreList.some(ig => normPath === ig || normPath.startsWith(ig + '/'))) {
      continue;
    }
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(await getFiles(fullPath, normPath));
    } else {
      files.push({ fullPath, relPath: normPath });
    }
  }
  return files;
}

async function run() {
  console.log(`[GitHub API] Scanning source files in ${rootDir}...`);
  const files = await getFiles(rootDir);
  console.log(`[GitHub API] Found ${files.length} files to upload...`);

  // 1. Get latest commit on main branch
  let parentCommitSha = null;
  try {
    const refData = await api('/git/refs/heads/main');
    parentCommitSha = refData.object.sha;
    console.log(`[GitHub API] Current main commit: ${parentCommitSha}`);
  } catch (err) {
    console.log('[GitHub API] No main branch found yet or initial commit');
  }

  // 2. Upload blobs for all files
  console.log('[GitHub API] Uploading file blobs in parallel chunks...');
  const treeItems = [];
  const chunkSize = 8;
  
  for (let i = 0; i < files.length; i += chunkSize) {
    const chunk = files.slice(i, i + chunkSize);
    const chunkPromises = chunk.map(async (file) => {
      const content = await fs.promises.readFile(file.fullPath);
      const isBinary = file.relPath.endsWith('.png') || file.relPath.endsWith('.jpg') || file.relPath.endsWith('.ico');
      
      const blobRes = await api('/git/blobs', {
        method: 'POST',
        body: JSON.stringify({
          content: content.toString(isBinary ? 'base64' : 'utf8'),
          encoding: isBinary ? 'base64' : 'utf-8',
        }),
      });

      return {
        path: file.relPath,
        mode: '100644',
        type: 'blob',
        sha: blobRes.sha,
      };
    });

    const results = await Promise.all(chunkPromises);
    treeItems.push(...results);
    process.stdout.write(`Uploaded ${treeItems.length}/${files.length} files...\r`);
  }
  console.log(`\n[GitHub API] Successfully created ${treeItems.length} blobs.`);

  // 3. Create Tree
  console.log('[GitHub API] Creating Git Tree...');
  const treeData = await api('/git/trees', {
    method: 'POST',
    body: JSON.stringify({
      tree: treeItems,
    }),
  });
  console.log(`[GitHub API] Created Tree SHA: ${treeData.sha}`);

  // 4. Create Commit
  console.log('[GitHub API] Creating Commit...');
  const commitData = await api('/git/commits', {
    method: 'POST',
    body: JSON.stringify({
      message: 'Deploy Vortex Live: WebRTC video calls, 60 FPS streaming, and mobile app',
      tree: treeData.sha,
      parents: parentCommitSha ? [parentCommitSha] : [],
    }),
  });
  console.log(`[GitHub API] Created Commit SHA: ${commitData.sha}`);

  // 5. Update or Create ref
  console.log('[GitHub API] Updating main branch reference...');
  if (parentCommitSha) {
    await api('/git/refs/heads/main', {
      method: 'PATCH',
      body: JSON.stringify({
        sha: commitData.sha,
        force: true,
      }),
    });
  } else {
    await api('/git/refs', {
      method: 'POST',
      body: JSON.stringify({
        ref: 'refs/heads/main',
        sha: commitData.sha,
      }),
    });
  }

  console.log('\n===========================================================');
  console.log('🎉 100% COMPLETE! ALL CODE IS NOW LIVE IN YOUR GITHUB REPO!');
  console.log(`👉 https://github.com/${owner}/${repo}`);
  console.log('===========================================================');
}

run().catch((err) => {
  console.error('\n[GitHub API Error]:', err.message);
  process.exit(1);
});
