/**
 * ALoad - yt-dlp Wrapper Downloader
 * Handles: YouTube, Instagram, Facebook, Pinterest, TikTok, Twitter, Vimeo, Direct URLs
 * Author: phoenix14
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Active download processes: id -> { process, meta }
const activeDownloads = new Map();
// Paused/completed state persisted to disk
const stateDir = process.env.ALOAD_STATE_DIR || '/data/data/com.aload/files/downloads';

function ensureStateDir(id) {
  const dir = path.join(stateDir, id);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function saveMeta(id, meta) {
  const dir = ensureStateDir(id);
  fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify(meta, null, 2));
}

function loadMeta(id) {
  const file = path.join(stateDir, id, 'meta.json');
  if (!fs.existsSync(file)) return null;
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return null; }
}

function saveResumeData(id, data) {
  const dir = ensureStateDir(id);
  fs.writeFileSync(path.join(dir, 'resume.json'), JSON.stringify(data));
}

function loadResumeData(id) {
  const file = path.join(stateDir, id, 'resume.json');
  if (!fs.existsSync(file)) return null;
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return null; }
}

/**
 * Get yt-dlp binary path (bundled in APK assets, extracted on first run)
 */
function getYtDlpPath() {
  const appDir = process.env.ALOAD_BIN_DIR || '/data/data/com.aload/files';
  return path.join(appDir, 'yt-dlp');
}

/**
 * Build yt-dlp quality/format args
 */
function buildFormatArgs(format, quality) {
  if (format === 'audio') {
    return ['-f', 'bestaudio', '-x', '--audio-format', 'mp3'];
  }
  const qualityMap = {
    '1080p': 'bestvideo[height<=1080]+bestaudio/best[height<=1080]',
    '720p':  'bestvideo[height<=720]+bestaudio/best[height<=720]',
    '480p':  'bestvideo[height<=480]+bestaudio/best[height<=480]',
    '360p':  'bestvideo[height<=360]+bestaudio/best[height<=360]',
    'best':  'bestvideo+bestaudio/best',
  };
  return ['-f', qualityMap[quality] || qualityMap['best']];
}

/**
 * Start a download
 */
function start(id, url, platform, format = 'video', quality = 'best', title = '') {
  const dir = ensureStateDir(id);
  const outputTemplate = path.join(dir, '%(title)s.%(ext)s');
  const ytdlp = getYtDlpPath();

  const meta = {
    id, url, platform, format, quality, title,
    status: 'downloading',
    progress: 0,
    speed: '',
    eta: '',
    size: '',
    filePath: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    pausedAt: null,
  };
  saveMeta(id, meta);

  const args = [
    ...buildFormatArgs(format, quality),
    '--newline',
    '--no-playlist',
    '--continue',            // resume partial downloads
    '--output', outputTemplate,
    '--write-thumbnail',
    '--convert-thumbnails', 'jpg',
    url,
  ];

  // Pinterest: download all pins if board URL
  if (platform === 'pinterest' && url.includes('/board/')) {
    args.push('--playlist-items', '1-500');
  }

  const proc = spawn(ytdlp, args, { env: { ...process.env, PATH: `${path.dirname(ytdlp)}:${process.env.PATH}` } });

  proc.stdout.on('data', (data) => {
    const line = data.toString().trim();
    const parsed = parseProgress(line);
    if (parsed) {
      meta.progress = parsed.percent;
      meta.speed = parsed.speed;
      meta.eta = parsed.eta;
      meta.size = parsed.size;
      meta.updatedAt = Date.now();
      saveMeta(id, meta);
      global.broadcastProgress({ id, ...parsed, status: 'downloading' });
    }
    // Detect final file path
    const destMatch = line.match(/\[download\] Destination: (.+)/);
    if (destMatch) meta.filePath = destMatch[1];
    const mergeMatch = line.match(/\[Merger\] Merging formats into "(.+)"/);
    if (mergeMatch) meta.filePath = mergeMatch[1];
  });

  proc.on('close', (code) => {
    meta.status = code === 0 ? 'completed' : 'failed';
    meta.progress = code === 0 ? 100 : meta.progress;
    meta.updatedAt = Date.now();
    saveMeta(id, meta);
    activeDownloads.delete(id);
    global.broadcastProgress({ id, status: meta.status, progress: meta.progress, filePath: meta.filePath });
  });

  proc.on('error', (err) => {
    meta.status = 'failed';
    meta.error = err.message;
    saveMeta(id, meta);
    global.broadcastProgress({ id, status: 'failed', error: err.message });
  });

  activeDownloads.set(id, { proc, meta });
  return meta;
}

/**
 * Parse yt-dlp progress line
 * Example: [download]  52.3% of    1.40GiB at    5.23MiB/s ETA 02:14
 */
function parseProgress(line) {
  const match = line.match(/\[download\]\s+([\d.]+)%\s+of\s+([\d.]+\w+)\s+at\s+([\d.]+\w+\/s)\s+ETA\s+(\S+)/);
  if (match) {
    return {
      percent: parseFloat(match[1]),
      size: match[2],
      speed: match[3],
      eta: match[4],
    };
  }
  return null;
}

/**
 * Pause a download (kill process, save partial state)
 */
function pause(id) {
  const entry = activeDownloads.get(id);
  if (!entry) return false;
  const { proc, meta } = entry;
  proc.kill('SIGTERM');
  meta.status = 'paused';
  meta.pausedAt = Date.now();
  saveMeta(id, meta);
  // Save partial file paths for resume
  saveResumeData(id, { url: meta.url, partialDir: ensureStateDir(id) });
  activeDownloads.delete(id);
  global.broadcastProgress({ id, status: 'paused', progress: meta.progress });
  return true;
}

/**
 * Resume a paused download (yt-dlp --continue handles partial files)
 */
function resume(id) {
  const meta = loadMeta(id);
  if (!meta || meta.status !== 'paused') return null;
  // Check 7-day expiry
  if (meta.pausedAt && Date.now() - meta.pausedAt > 7 * 24 * 60 * 60 * 1000) {
    meta.status = 'expired';
    saveMeta(id, meta);
    global.broadcastProgress({ id, status: 'expired' });
    return null;
  }
  return start(id, meta.url, meta.platform, meta.format, meta.quality, meta.title);
}

/**
 * Cancel and cleanup
 */
function cancel(id) {
  const entry = activeDownloads.get(id);
  if (entry) {
    entry.proc.kill('SIGKILL');
    activeDownloads.delete(id);
  }
  const dir = path.join(stateDir, id);
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
  global.broadcastProgress({ id, status: 'cancelled' });
}

/**
 * Get status of a download
 */
function getStatus(id) {
  const entry = activeDownloads.get(id);
  if (entry) return { ...entry.meta, live: true };
  return loadMeta(id);
}

/**
 * Get all known downloads
 */
function getAll() {
  const results = [];
  if (!fs.existsSync(stateDir)) return results;
  const dirs = fs.readdirSync(stateDir);
  for (const id of dirs) {
    const meta = loadMeta(id);
    if (meta) results.push(meta);
  }
  return results;
}

module.exports = { start, pause, resume, cancel, getStatus, getAll };
