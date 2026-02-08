/**
 * Saathi design system — Light theme for clarity, hope, and growth.
 * Calming teal primary + soft green secondary = healing journey.
 * Inspired by Calm, Headspace, and I Am Sober.
 */

export const colors = {
  // Backgrounds — soft, warm, breathable
  background: '#FAFAFA',           // Warm off-white
  backgroundElevated: '#FFFFFF',   // Pure white for cards
  backgroundCard: '#FFFFFF',       // Card background
  backgroundCardHover: '#F5F5F5',  // Subtle hover state
  backgroundSecondary: '#F0F4F8',  // Cool light gray-blue

  // Primary Accent — Calming Teal (clarity, renewal, trust)
  accent: '#2D9CDB',               // Primary teal
  accentSoft: 'rgba(45, 156, 219, 0.12)',
  accentGlow: 'rgba(45, 156, 219, 0.08)',
  accentPressed: '#2380B8',        // Darker on press
  accentLight: '#E3F2FD',          // Very light teal background

  // Secondary Accent — Soft Green (growth, healing, hope)
  secondary: '#52B788',            // Fresh green
  secondarySoft: 'rgba(82, 183, 136, 0.12)',
  secondaryPressed: '#40916C',

  // Tertiary — Warm Coral (motivation, energy, warmth)
  tertiary: '#F28482',             // Soft coral
  tertiarySoft: 'rgba(242, 132, 130, 0.12)',

  // Text — Clear hierarchy with warm undertones
  textPrimary: '#1A202C',          // Deep slate
  textSecondary: '#4A5568',        // Medium gray
  textMuted: '#718096',            // Light gray
  textOnAccent: '#FFFFFF',         // White on colored backgrounds
  textOnCard: '#2D3748',           // Slightly softer for cards

  // Borders & dividers
  border: 'rgba(0, 0, 0, 0.08)',   // Subtle border
  borderFocus: '#2D9CDB',          // Teal focus
  borderLight: 'rgba(0, 0, 0, 0.04)', // Very subtle divider
  divider: '#E2E8F0',              // Soft gray divider

  // Semantic — Clear but not harsh
  success: '#48BB78',              // Vibrant green
  successSoft: 'rgba(72, 187, 120, 0.12)',
  warning: '#F59E0B',              // Amber
  warningSoft: 'rgba(245, 158, 11, 0.12)',
  error: '#F56565',                // Soft red
  errorSoft: 'rgba(245, 101, 101, 0.12)',
  info: '#4299E1',                 // Blue
  infoSoft: 'rgba(66, 153, 225, 0.12)',

  // Overlays & shadows
  overlay: 'rgba(0, 0, 0, 0.3)',
  shadowLight: 'rgba(0, 0, 0, 0.05)',
  shadowMedium: 'rgba(0, 0, 0, 0.1)',
  shadowHeavy: 'rgba(0, 0, 0, 0.15)',

  // Progress & Milestones
  progressBackground: '#E2E8F0',
  progressFill: '#2D9CDB',
  milestone: '#FFD166',            // Golden yellow for achievements
  milestoneSoft: 'rgba(255, 209, 102, 0.12)',
} as const;

export type Colors = typeof colors;
