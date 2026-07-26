/**
 * ALoad - Embedded Node.js Download Server
 * Runs locally on-device via nodejs-mobile-react-native
 * Author: phoenix14
 */

const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const downloader = require('./downloader');
const torrent = require('./torrent');
const bulk = require('./bulk');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 11337;

app.use(cors());
app.use(express.json());

// SSE clients for real-time progress
const sseClients = new Set();

// Broadcast progress to all SSE clients
global.broadcastProgress = (data) => {
  const msg = `data: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach(client => {
    try { client.write(msg); } catch (_) {}
  });
};

// ─── Health Check ─────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0', author: 'phoenix14' });
});

// ─── Real-time Progress Stream (SSE) ─────────────────────
app.get('/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();
  sseClients.add(res);
  req.on('close', () => sseClients.delete(res));
});

// ─── Detect URL Platform ──────────────────────────────────
app.post('/detect', (req, res) => {
  const { url } = req.body;
  const platform = detectPlatform(url);
  res.json({ platform });
});

// ─── Start Download ───────────────────────────────────────
app.post('/download', async (req, res) => {
  const { url, type, format, quality, title } = req.body;
  const id = uuidv4();
  try {
    const platform = type || detectPlatform(url);
    if (platform === 'torrent' || url.startsWith('magnet:')) {
      torrent.start(id, url, format, quality);
    } else {
      downloader.start(id, url, platform, format, quality, title);
    }
    res.json({ id, status: 'started', platform });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Bulk Download ────────────────────────────────────────
app.post('/bulk', async (req, res) => {
  const { urls, format, quality } = req.body;
  try {
    const results = await bulk.startBulk(urls, format, quality);
    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Pinterest Board Bulk ─────────────────────────────────
app.post('/pinterest/board', async (req, res) => {
  const { boardUrl, format, quality } = req.body;
  try {
    const results = await bulk.downloadPinterestBoard(boardUrl, format, quality);
    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Pause Download ───────────────────────────────────────
app.post('/pause/:id', (req, res) => {
  const { id } = req.params;
  try {
    downloader.pause(id);
    torrent.pause(id);
    res.json({ id, status: 'paused' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Resume Download ──────────────────────────────────────
app.post('/resume/:id', (req, res) => {
  const { id } = req.params;
  try {
    const meta = downloader.resume(id);
    if (!meta) torrent.resume(id);
    res.json({ id, status: 'resumed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Cancel Download ──────────────────────────────────────
app.delete('/cancel/:id', (req, res) => {
  const { id } = req.params;
  try {
    downloader.cancel(id);
    torrent.cancel(id);
    res.json({ id, status: 'cancelled' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Get Download Status ──────────────────────────────────
app.get('/status/:id', (req, res) => {
  const { id } = req.params;
  const status = downloader.getStatus(id) || torrent.getStatus(id);
  res.json(status || { id, status: 'not_found' });
});

// ─── List All Downloads ───────────────────────────────────
app.get('/downloads', (req, res) => {
  const all = [...downloader.getAll(), ...torrent.getAll()];
  res.json(all);
});

// ─── URL Platform Detector ────────────────────────────────
function detectPlatform(url) {
  if (!url) return 'direct';
  if (url.startsWith('magnet:') || url.endsWith('.torrent')) return 'torrent';
  if (/youtube\.com|youtu\.be/.test(url)) return 'youtube';
  if (/instagram\.com/.test(url)) return 'instagram';
  if (/facebook\.com|fb\.watch/.test(url)) return 'facebook';
  if (/pinterest\.com|pin\.it/.test(url)) return 'pinterest';
  if (/twitter\.com|x\.com/.test(url)) return 'twitter';
  if (/tiktok\.com/.test(url)) return 'tiktok';
  if (/reddit\.com/.test(url)) return 'reddit';
  if (/vimeo\.com/.test(url)) return 'vimeo';
  return 'direct';
}

// ─── Start Server ─────────────────────────────────────────
app.listen(PORT, '127.0.0.1', () => {
  console.log(`[ALoad Server] Running on port ${PORT}`);
  // Notify React Native that server is ready
  if (typeof rn_bridge !== 'undefined') {
    rn_bridge.channel.send(JSON.stringify({ type: 'SERVER_READY', port: PORT }));
  }
});

module.exports = app;
