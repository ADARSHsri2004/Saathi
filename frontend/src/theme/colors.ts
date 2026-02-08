/**
 * Saathi design system — calm, dark, emotionally safe.
 * Muted green accent = growth, not pressure.
 */

export const colors = {
  // Backgrounds
  background: '#141414',
  backgroundElevated: '#1a1a1a',
  backgroundCard: '#1f1f1f',
  backgroundCardHover: '#252525',

  // Accent — muted green (calm, growth)
  accent: '#5a9a7a',
  accentSoft: 'rgba(90, 154, 122, 0.25)',
  accentGlow: 'rgba(90, 154, 122, 0.15)',
  accentPressed: '#4a8a6a',

  // Text — soft off-white, never pure white
  textPrimary: '#e8e6e3',
  textSecondary: '#b0aeab',
  textMuted: '#7a7875',
  textOnAccent: '#e8e6e3',

  // Borders & dividers
  border: 'rgba(255, 255, 255, 0.06)',
  borderFocus: 'rgba(90, 154, 122, 0.5)',

  // Semantic (gentle, not harsh)
  success: '#5a9a7a',
  warning: '#b8a05a',
  error: '#a07070', // muted red, not alarming
  info: '#6a8a9a',

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.4)',
} as const;

export type Colors = typeof colors;
