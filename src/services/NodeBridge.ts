/**
 * ALoad - Node.js Bridge Service
 * Communicates with the embedded Node.js Express server at localhost:11337
 */

import axios from 'axios';
import { Download, DownloadOptions, Platform, ProgressUpdate } from '../types';

const BASE_URL = 'http://127.0.0.1:11337';
const api = axios.create({ baseURL: BASE_URL, timeout: 10000 });

// ─── Health ───────────────────────────────────────────────
export async function checkHealth(): Promise<boolean> {
  try {
    const res = await api.get('/health');
    return res.data?.status === 'ok';
  } catch {
    return false;
  }
}

// ─── Detect Platform from URL ─────────────────────────────
export async function detectPlatform(url: string): Promise<Platform> {
  try {
    const res = await api.post('/detect', { url });
    return res.data.platform as Platform;
  } catch {
    return 'direct';
  }
}

// ─── Start Single Download ────────────────────────────────
export async function startDownload(
  url: string,
  options: DownloadOptions,
  type?: Platform,
): Promise<{ id: string; platform: Platform }> {
  const res = await api.post('/download', {
    url,
    type,
    format: options.format,
    quality: options.quality,
    title: options.title,
  });
  return res.data;
}

// ─── Bulk Download ────────────────────────────────────────
export async function startBulkDownload(
  urls: string[],
  format: 'video' | 'audio' | 'file',
  quality: string,
): Promise<Array<{ id: string; url: string; status: string }>> {
  const res = await api.post('/bulk', { urls, format, quality });
  return res.data.results;
}

// ─── Pinterest Board ──────────────────────────────────────
export async function downloadPinterestBoard(
  boardUrl: string,
  format: 'video' | 'audio' | 'file' = 'video',
  quality: string = 'best',
): Promise<Array<{ id: string; status: string }>> {
  const res = await api.post('/pinterest/board', { boardUrl, format, quality });
  return res.data.results;
}

// ─── Pause ────────────────────────────────────────────────
export async function pauseDownload(id: string): Promise<void> {
  await api.post(`/pause/${id}`);
}

// ─── Resume ───────────────────────────────────────────────
export async function resumeDownload(id: string): Promise<void> {
  await api.post(`/resume/${id}`);
}

// ─── Cancel ───────────────────────────────────────────────
export async function cancelDownload(id: string): Promise<void> {
  await api.delete(`/cancel/${id}`);
}

// ─── Get Status ───────────────────────────────────────────
export async function getDownloadStatus(id: string): Promise<Download | null> {
  try {
    const res = await api.get(`/status/${id}`);
    return res.data;
  } catch {
    return null;
  }
}

// ─── Get All Downloads ────────────────────────────────────
export async function getAllDownloads(): Promise<Download[]> {
  try {
    const res = await api.get('/downloads');
    return res.data || [];
  } catch {
    return [];
  }
}

// ─── SSE Progress Stream ──────────────────────────────────
export function subscribeToProgress(
  onProgress: (update: ProgressUpdate) => void,
): () => void {
  const url = `${BASE_URL}/stream`;
  // React Native doesn't have native EventSource — we poll instead
  let active = true;
  let lastChecked = Date.now();

  const poll = async () => {
    while (active) {
      try {
        const downloads = await getAllDownloads();
        downloads.forEach(d => {
          if (d.updatedAt > lastChecked) {
            onProgress({
              id: d.id,
              status: d.status,
              percent: d.progress,
              speed: d.speed,
              eta: d.eta,
              size: d.size,
              filePath: d.filePath,
            });
          }
        });
        lastChecked = Date.now();
      } catch {}
      await sleep(1000);
    }
  };

  poll();
  return () => { active = false; };
}

function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}
