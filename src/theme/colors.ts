// ALoad Design System — Color Tokens
// Dark electric blue theme by phoenix14

export const Colors = {
  // ─── Backgrounds ─────────────────────────────────
  bg:          '#0A0A0F',        // root background
  surface:     '#12121A',        // card / list item
  surfaceHigh: '#1A1A2E',        // elevated: modals, sheets
  surfaceBorder:'#2A2A3E',       // dividers

  // ─── Brand ───────────────────────────────────────
  primary:     '#4361EE',        // electric blue
  primaryGlow: '#4CC9F0',        // cyan highlight
  primaryDark: '#2D3DC4',        // pressed state
  gradient:    ['#4361EE', '#4CC9F0'] as [string, string],

  // ─── Platform Colors ─────────────────────────────
  youtube:     '#FF0000',
  instagram:   '#E1306C',
  facebook:    '#1877F2',
  pinterest:   '#E60023',
  tiktok:      '#010101',
  twitter:     '#1DA1F2',
  torrent:     '#6C63FF',
  direct:      '#10B981',
  vimeo:       '#1AB7EA',
  reddit:      '#FF4500',

  // ─── Semantic ─────────────────────────────────────
  success:     '#2ECC71',
  warning:     '#F39C12',
  error:       '#E74C3C',
  info:        '#3498DB',

  // ─── Typography ──────────────────────────────────
  textPrimary:   '#FFFFFF',
  textSecondary: '#A0A0B8',
  textMuted:     '#5A5A78',
  textOnPrimary: '#FFFFFF',

  // ─── Status ───────────────────────────────────────
  downloading: '#4CC9F0',
  paused:      '#F39C12',
  completed:   '#2ECC71',
  failed:      '#E74C3C',
  queued:      '#A0A0B8',
  expired:     '#E74C3C',
} as const;

export const PlatformColors: Record<string, string> = {
  youtube:   Colors.youtube,
  instagram: Colors.instagram,
  facebook:  Colors.facebook,
  pinterest: Colors.pinterest,
  tiktok:    Colors.tiktok,
  twitter:   Colors.twitter,
  torrent:   Colors.torrent,
  direct:    Colors.direct,
  vimeo:     Colors.vimeo,
  reddit:    Colors.reddit,
};

export const StatusColors: Record<string, string> = {
  downloading: Colors.downloading,
  paused:      Colors.paused,
  completed:   Colors.completed,
  failed:      Colors.failed,
  queued:      Colors.queued,
  connecting:  Colors.info,
  expired:     Colors.expired,
};
