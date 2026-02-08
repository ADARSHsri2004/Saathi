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
    fontWeight: '300',
    letterSpacing: 0.5,
    lineHeight: fontSizes.xxl * lineHeights.tight,
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: '400',
    letterSpacing: 0.3,
    lineHeight: fontSizes.xl * lineHeights.tight,
  },
  titleSmall: {
    fontSize: fontSizes.lg,
    fontWeight: '500',
    letterSpacing: 0.2,
    lineHeight: fontSizes.lg * lineHeights.normal,
  },
  body: {
    fontSize: fontSizes.md,
    fontWeight: '400',
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
    letterSpacing: 0.5,
  },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
};
