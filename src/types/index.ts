/**
 * ALoad - Download Types & Interfaces
 */

export type Platform =
  | 'youtube' | 'instagram' | 'facebook' | 'pinterest'
  | 'tiktok' | 'twitter' | 'reddit' | 'vimeo'
  | 'torrent' | 'direct';

export type DownloadFormat = 'video' | 'audio' | 'file';

export type Quality = '1080p' | '720p' | '480p' | '360p' | 'best' | 'audio-only';

export type DownloadStatus =
  | 'queued' | 'downloading' | 'paused' | 'completed'
  | 'failed' | 'cancelled' | 'connecting' | 'expired';

export interface Download {
  id: string;
  url: string;
  title: string;
  thumbnail?: string;
  platform: Platform;
  format: DownloadFormat;
  quality: Quality;
  status: DownloadStatus;
  progress: number;       // 0-100
  speed: string;
  eta: string;
  size: string;
  filePath?: string;
  createdAt: number;
  updatedAt: number;
  pausedAt?: number;
  error?: string;
}

export interface DownloadOptions {
  format: DownloadFormat;
  quality: Quality;
  title?: string;
}

export interface ProgressUpdate {
  id: string;
  status: DownloadStatus;
  percent?: number;
  speed?: string;
  eta?: string;
  size?: string;
  filePath?: string;
  error?: string;
}

export interface BulkDownloadEntry {
  url: string;
  format: DownloadFormat;
  quality: Quality;
}

export interface AppSettings {
  maxConcurrent: number;
  downloadPath: string;
  autoPauseOnMetered: boolean;
  theme: 'dark';
  seedAfterComplete: boolean;
  githubRepo: string;
  appVersion: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  maxConcurrent: 3,
  downloadPath: '/sdcard/ALoad',
  autoPauseOnMetered: true,
  theme: 'dark',
  seedAfterComplete: false,
  githubRepo: 'pheonix14/aload',
  appVersion: '1.0.0',
};
