/**
 * ALoad - Download Store (Zustand)
 * Global state for all downloads
 */

import { create } from 'zustand';
import {
  Download, DownloadOptions, DownloadStatus, Platform, ProgressUpdate,
} from '../types';
import * as NodeBridge from '../services/NodeBridge';

interface DownloadStore {
  downloads: Download[];
  isLoading: boolean;
  serverReady: boolean;

  // Actions
  setServerReady: (ready: boolean) => void;
  loadDownloads: () => Promise<void>;
  addDownload: (url: string, options: DownloadOptions, platform?: Platform) => Promise<string | null>;
  addBulkDownload: (urls: string[], format: 'video' | 'audio' | 'file', quality: string) => Promise<void>;
  addPinterestBoard: (boardUrl: string, format: 'video' | 'audio' | 'file', quality: string) => Promise<void>;
  pauseDownload: (id: string) => Promise<void>;
  resumeDownload: (id: string) => Promise<void>;
  cancelDownload: (id: string) => Promise<void>;
  updateProgress: (update: ProgressUpdate) => void;
  clearCompleted: () => void;

  // Selectors (computed)
  activeDownloads: () => Download[];
  pausedDownloads: () => Download[];
  completedDownloads: () => Download[];
  failedDownloads: () => Download[];
}

export const useDownloadStore = create<DownloadStore>((set, get) => ({
  downloads: [],
  isLoading: false,
  serverReady: false,

  setServerReady: (ready) => set({ serverReady: ready }),

  loadDownloads: async () => {
    set({ isLoading: true });
    try {
      const all = await NodeBridge.getAllDownloads();
      set({ downloads: all });
    } catch {}
    set({ isLoading: false });
  },

  addDownload: async (url, options, platform) => {
    try {
      const result = await NodeBridge.startDownload(url, options, platform);
      const newDownload: Download = {
        id: result.id,
        url,
        title: options.title || 'Downloading...',
        platform: result.platform,
        format: options.format,
        quality: options.quality,
        status: 'downloading',
        progress: 0,
        speed: '',
        eta: '',
        size: '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      set(state => ({ downloads: [newDownload, ...state.downloads] }));
      return result.id;
    } catch (err) {
      return null;
    }
  },

  addBulkDownload: async (urls, format, quality) => {
    const results = await NodeBridge.startBulkDownload(urls, format, quality);
    const newDownloads: Download[] = results.map(r => ({
      id: r.id,
      url: r.url,
      title: 'Bulk Download',
      platform: 'direct' as Platform,
      format: format as any,
      quality: quality as any,
      status: 'downloading' as DownloadStatus,
      progress: 0, speed: '', eta: '', size: '',
      createdAt: Date.now(), updatedAt: Date.now(),
    }));
    set(state => ({ downloads: [...newDownloads, ...state.downloads] }));
  },

  addPinterestBoard: async (boardUrl, format, quality) => {
    const results = await NodeBridge.downloadPinterestBoard(boardUrl, format, quality);
    const newDownloads: Download[] = results.map(r => ({
      id: r.id,
      url: boardUrl,
      title: 'Pinterest Board',
      platform: 'pinterest' as Platform,
      format: format as any,
      quality: quality as any,
      status: 'downloading' as DownloadStatus,
      progress: 0, speed: '', eta: '', size: '',
      createdAt: Date.now(), updatedAt: Date.now(),
    }));
    set(state => ({ downloads: [...newDownloads, ...state.downloads] }));
  },

  pauseDownload: async (id) => {
    await NodeBridge.pauseDownload(id);
    set(state => ({
      downloads: state.downloads.map(d =>
        d.id === id ? { ...d, status: 'paused', pausedAt: Date.now() } : d,
      ),
    }));
  },

  resumeDownload: async (id) => {
    await NodeBridge.resumeDownload(id);
    set(state => ({
      downloads: state.downloads.map(d =>
        d.id === id ? { ...d, status: 'downloading', pausedAt: undefined } : d,
      ),
    }));
  },

  cancelDownload: async (id) => {
    await NodeBridge.cancelDownload(id);
    set(state => ({
      downloads: state.downloads.filter(d => d.id !== id),
    }));
  },

  updateProgress: (update) => {
    set(state => ({
      downloads: state.downloads.map(d =>
        d.id === update.id
          ? {
              ...d,
              status: update.status,
              progress: update.percent ?? d.progress,
              speed: update.speed ?? d.speed,
              eta: update.eta ?? d.eta,
              size: update.size ?? d.size,
              filePath: update.filePath ?? d.filePath,
              updatedAt: Date.now(),
            }
          : d,
      ),
    }));
  },

  clearCompleted: () => {
    set(state => ({
      downloads: state.downloads.filter(d => d.status !== 'completed'),
    }));
  },

  // Selectors
  activeDownloads: () =>
    get().downloads.filter(d => d.status === 'downloading' || d.status === 'connecting' || d.status === 'queued'),
  pausedDownloads: () =>
    get().downloads.filter(d => d.status === 'paused'),
  completedDownloads: () =>
    get().downloads.filter(d => d.status === 'completed'),
  failedDownloads: () =>
    get().downloads.filter(d => d.status === 'failed' || d.status === 'expired'),
}));
