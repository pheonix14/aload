/**
 * ALoad - Bulk Downloader
 * Handles: Multi-URL bulk downloads, Pinterest board scraping
 * Author: phoenix14
 */

const downloader = require('./downloader');
const { v4: uuidv4 } = require('uuid');
const https = require('https');
const http = require('http');

/**
 * Start multiple URL downloads at once
 * @param {string[]} urls
 * @param {string} format
 * @param {string} quality
 * @returns {Array<{id, url, status}>}
 */
async function startBulk(urls, format = 'video', quality = 'best') {
  const results = [];
  const validUrls = urls.filter(u => u && u.trim().length > 0);

  for (const url of validUrls) {
    const id = uuidv4();
    const platform = detectPlatform(url.trim());
    try {
      downloader.start(id, url.trim(), platform, format, quality);
      results.push({ id, url: url.trim(), status: 'started', platform });
    } catch (err) {
      results.push({ id, url: url.trim(), status: 'failed', error: err.message });
    }
    // Small delay between starts to avoid overwhelming the system
    await sleep(500);
  }
  return results;
}

/**
 * Download an entire Pinterest board
 * Uses yt-dlp with pinterest board URL (yt-dlp supports pinterest natively)
 * @param {string} boardUrl - Pinterest board URL
 * @param {string} format
 * @param {string} quality
 */
async function downloadPinterestBoard(boardUrl, format = 'video', quality = 'best') {
  const id = uuidv4();
  // yt-dlp handles full pinterest boards with --yes-playlist
  const meta = downloader.start(id, boardUrl, 'pinterest', format, quality, 'Pinterest Board');
  return [{ id, url: boardUrl, status: 'started', platform: 'pinterest', type: 'board' }];
}

/**
 * Parse pasted text with multiple URLs (one per line, or comma-separated)
 * @param {string} text
 * @returns {string[]}
 */
function parseURLsFromText(text) {
  if (!text) return [];
  // Split by newline, comma, or space-separated URLs
  const parts = text.split(/[\n,\r]+/).map(u => u.trim()).filter(u => {
    try {
      new URL(u);
      return true;
    } catch {
      return false;
    }
  });
  return [...new Set(parts)]; // deduplicate
}

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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { startBulk, downloadPinterestBoard, parseURLsFromText };
