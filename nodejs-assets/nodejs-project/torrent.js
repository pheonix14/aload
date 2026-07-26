/**
 * ALoad - WebTorrent Engine
 * Handles .torrent files and magnet links
 * Author: phoenix14
 */

const WebTorrent = require('webtorrent');
const fs = require('fs');
const path = require('path');

const stateDir = process.env.ALOAD_STATE_DIR || '/data/data/com.aload/files/downloads';
const downloadDir = process.env.ALOAD_DOWNLOAD_DIR || '/sdcard/ALoad/Torrents';

// Active torrent clients: id -> { client, torrent, meta }
const activeTorrents = new Map();

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function saveMeta(id, meta) {
  const dir = ensureDir(path.join(stateDir, id));
  fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify(meta, null, 2));
}

function loadMeta(id) {
  const file = path.join(stateDir, id, 'meta.json');
  if (!fs.existsSync(file)) return null;
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return null; }
}

function saveTorrentState(id, magnetURI, files) {
  const dir = ensureDir(path.join(stateDir, id));
  fs.writeFileSync(path.join(dir, 'resume.json'), JSON.stringify({ magnetURI, files }));
}

function loadTorrentState(id) {
  const file = path.join(stateDir, id, 'resume.json');
  if (!fs.existsSync(file)) return null;
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return null; }
}

/**
 * Start torrent download
 */
function start(id, magnetOrPath, format, quality) {
  ensureDir(downloadDir);
  const client = new WebTorrent();

  const meta = {
    id, url: magnetOrPath, platform: 'torrent', format, quality,
    status: 'connecting',
    progress: 0, speed: '', eta: '', size: '',
    filePath: downloadDir,
    createdAt: Date.now(), updatedAt: Date.now(), pausedAt: null,
  };
  saveMeta(id, meta);

  client.add(magnetOrPath, { path: downloadDir }, (torrent) => {
    meta.title = torrent.name;
    meta.size = formatBytes(torrent.length);
    meta.status = 'downloading';
    saveMeta(id, meta);
    saveTorrentState(id, torrent.magnetURI, torrent.files.map(f => f.path));

    // Progress updates every second
    const interval = setInterval(() => {
      if (!activeTorrents.has(id)) { clearInterval(interval); return; }
      meta.progress = Math.round(torrent.progress * 100 * 10) / 10;
      meta.speed = formatBytes(torrent.downloadSpeed) + '/s';
      meta.eta = formatETA(torrent.timeRemaining);
      meta.updatedAt = Date.now();
      saveMeta(id, meta);
      global.broadcastProgress({
        id, status: 'downloading',
        progress: meta.progress, speed: meta.speed,
        eta: meta.eta, size: meta.size,
      });
    }, 1000);

    torrent.on('done', () => {
      clearInterval(interval);
      meta.status = 'completed';
      meta.progress = 100;
      meta.updatedAt = Date.now();
      saveMeta(id, meta);
      activeTorrents.delete(id);
      client.destroy();
      global.broadcastProgress({ id, status: 'completed', progress: 100 });
    });

    torrent.on('error', (err) => {
      clearInterval(interval);
      meta.status = 'failed';
      meta.error = err.message;
      saveMeta(id, meta);
      activeTorrents.delete(id);
      global.broadcastProgress({ id, status: 'failed', error: err.message });
    });
  });

  client.on('error', (err) => {
    meta.status = 'failed';
    meta.error = err.message;
    saveMeta(id, meta);
    global.broadcastProgress({ id, status: 'failed', error: err.message });
  });

  activeTorrents.set(id, { client, meta });
}

/**
 * Pause torrent (destroy client, save magnet for resume)
 */
function pause(id) {
  const entry = activeTorrents.get(id);
  if (!entry) return false;
  const { client, meta } = entry;
  meta.status = 'paused';
  meta.pausedAt = Date.now();
  saveMeta(id, meta);
  client.destroy(() => activeTorrents.delete(id));
  global.broadcastProgress({ id, status: 'paused', progress: meta.progress });
  return true;
}

/**
 * Resume torrent (re-add magnet, webtorrent will verify and continue)
 */
function resume(id) {
  const meta = loadMeta(id);
  const state = loadTorrentState(id);
  if (!meta || !state || meta.status !== 'paused') return null;
  if (meta.pausedAt && Date.now() - meta.pausedAt > 7 * 24 * 60 * 60 * 1000) {
    meta.status = 'expired';
    saveMeta(id, meta);
    global.broadcastProgress({ id, status: 'expired' });
    return null;
  }
  start(id, state.magnetURI, meta.format, meta.quality);
  return meta;
}

/**
 * Cancel and cleanup
 */
function cancel(id) {
  const entry = activeTorrents.get(id);
  if (entry) {
    entry.client.destroy();
    activeTorrents.delete(id);
  }
  const dir = path.join(stateDir, id);
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
  global.broadcastProgress({ id, status: 'cancelled' });
}

function getStatus(id) {
  const entry = activeTorrents.get(id);
  if (entry) return { ...entry.meta, live: true };
  return loadMeta(id);
}

function getAll() {
  const results = [];
  if (!fs.existsSync(stateDir)) return results;
  for (const id of fs.readdirSync(stateDir)) {
    const meta = loadMeta(id);
    if (meta && meta.platform === 'torrent') results.push(meta);
  }
  return results;
}

// ─── Helpers ─────────────────────────────────────────────
function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function formatETA(ms) {
  if (!ms || ms === Infinity) return '∞';
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

module.exports = { start, pause, resume, cancel, getStatus, getAll };
