import { TextStyle } from 'react-native';

export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
} as const;

export const lineHeights = {
  tight: 1.25,
  normal: 1.4,
  relaxed: 1.6,
} as const;

export const typography: Record<string, TextStyle> = {
  hero: {
    fontSize: fontSizes.xxl,
    fontWeight: '600',        // Stronger for light theme
    letterSpacing: 0.3,
    lineHeight: fontSizes.xxl * lineHeights.tight,
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: '600',        // Increased for better contrast
    letterSpacing: 0.2,
    lineHeight: fontSizes.xl * lineHeights.tight,
  },
  titleSmall: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    letterSpacing: 0.15,
    lineHeight: fontSizes.lg * lineHeights.normal,
  },
  body: {
    fontSize: fontSizes.md,
    fontWeight: '400',
    lineHeight: fontSizes.md * lineHeights.relaxed,
  },
  bodyMedium: {
    fontSize: fontSizes.md,
    fontWeight: '500',        // Medium weight option
    lineHeight: fontSizes.md * lineHeights.relaxed,
  },
  bodySmall: {
    fontSize: fontSizes.sm,
    fontWeight: '400',
    lineHeight: fontSizes.sm * lineHeights.relaxed,
  },
  caption: {
    fontSize: fontSizes.xs,
    fontWeight: '400',
    lineHeight: fontSizes.xs * lineHeights.normal,
  },
  button: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: '600',        // Stronger for labels
    letterSpacing: 0.3,
  },
};
