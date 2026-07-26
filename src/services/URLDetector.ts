/**
 * ALoad - URL Detector Service
 * Detects platform from URL and extracts display info
 */

import { Platform } from '../types';

export interface URLInfo {
  platform: Platform;
  displayName: string;
  icon: string;
  color: string;
  isBoardUrl: boolean;   // Pinterest board
  isPlaylist: boolean;   // YouTube playlist
  isValid: boolean;
}

export function detectURLInfo(url: string): URLInfo {
  if (!url || !url.trim()) {
    return { platform: 'direct', displayName: 'Direct Link', icon: '🔗', color: '#10B981', isBoardUrl: false, isPlaylist: false, isValid: false };
  }

  const u = url.trim();

  // Validate URL
  let isValid = false;
  try {
    new URL(u.startsWith('magnet:') ? 'http://x.com' : u);
    isValid = true;
  } catch { isValid = false; }

  if (u.startsWith('magnet:')) {
    return { platform: 'torrent', displayName: 'Magnet Link', icon: '🧲', color: '#6C63FF', isBoardUrl: false, isPlaylist: false, isValid: true };
  }
  if (u.endsWith('.torrent')) {
    return { platform: 'torrent', displayName: 'Torrent File', icon: '🧲', color: '#6C63FF', isBoardUrl: false, isPlaylist: false, isValid };
  }
  if (/youtube\.com|youtu\.be/.test(u)) {
    const isPlaylist = u.includes('list=');
    return { platform: 'youtube', displayName: 'YouTube', icon: '▶️', color: '#FF0000', isBoardUrl: false, isPlaylist, isValid };
  }
  if (/instagram\.com/.test(u)) {
    return { platform: 'instagram', displayName: 'Instagram', icon: '📸', color: '#E1306C', isBoardUrl: false, isPlaylist: false, isValid };
  }
  if (/facebook\.com|fb\.watch/.test(u)) {
    return { platform: 'facebook', displayName: 'Facebook', icon: '👤', color: '#1877F2', isBoardUrl: false, isPlaylist: false, isValid };
  }
  if (/pinterest\.com|pin\.it/.test(u)) {
    const isBoardUrl = /pinterest\.com\/[^/]+\/[^/]+\/?$/.test(u) && !u.includes('/pin/');
    return { platform: 'pinterest', displayName: isBoardUrl ? 'Pinterest Board' : 'Pinterest Pin', icon: '📌', color: '#E60023', isBoardUrl, isPlaylist: isBoardUrl, isValid };
  }
  if (/tiktok\.com/.test(u)) {
    return { platform: 'tiktok', displayName: 'TikTok', icon: '🎵', color: '#010101', isBoardUrl: false, isPlaylist: false, isValid };
  }
  if (/twitter\.com|x\.com/.test(u)) {
    return { platform: 'twitter', displayName: 'X / Twitter', icon: '🐦', color: '#1DA1F2', isBoardUrl: false, isPlaylist: false, isValid };
  }
  if (/vimeo\.com/.test(u)) {
    return { platform: 'vimeo', displayName: 'Vimeo', icon: '🎬', color: '#1AB7EA', isBoardUrl: false, isPlaylist: false, isValid };
  }
  if (/reddit\.com/.test(u)) {
    return { platform: 'reddit', displayName: 'Reddit', icon: '🤖', color: '#FF4500', isBoardUrl: false, isPlaylist: false, isValid };
  }

  return { platform: 'direct', displayName: 'Direct Link', icon: '🔗', color: '#10B981', isBoardUrl: false, isPlaylist: false, isValid };
}

/**
 * Parse multiple URLs from pasted text
 */
export function parseMultipleURLs(text: string): string[] {
  if (!text) return [];
  return text
    .split(/[\n,\r\t]+/)
    .map(u => u.trim())
    .filter(u => {
      if (!u) return false;
      if (u.startsWith('magnet:')) return true;
      try { new URL(u); return true; } catch { return false; }
    });
}
