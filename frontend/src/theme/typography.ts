import { TextStyle, Platform } from 'react-native';

const fontFamily = Platform.select({ ios: 'AvenirNext-Regular', android: 'sans-serif' });
const fontFamilySemi = Platform.select({ ios: 'AvenirNext-DemiBold', android: 'sans-serif-medium' });

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
    fontFamily: fontFamilySemi,
    fontSize: fontSizes.xxl,
    fontWeight: '600',
    letterSpacing: 0.3,
    lineHeight: fontSizes.xxl * lineHeights.tight,
  },
  title: {
    fontFamily: fontFamilySemi,
    fontSize: fontSizes.xl,
    fontWeight: '600',
    letterSpacing: 0.2,
    lineHeight: fontSizes.xl * lineHeights.tight,
  },
  titleSmall: {
    fontFamily: fontFamilySemi,
    fontSize: fontSizes.lg,
    fontWeight: '600',
    letterSpacing: 0.15,
    lineHeight: fontSizes.lg * lineHeights.normal,
  },
  titleMedium: {
    fontFamily: fontFamilySemi,
    fontSize: fontSizes.lg,
    fontWeight: '600',
    letterSpacing: 0.15,
    lineHeight: fontSizes.lg * lineHeights.normal,
  },
  body: {
    fontFamily,
    fontSize: fontSizes.md,
    fontWeight: '400',
    lineHeight: fontSizes.md * lineHeights.relaxed,
  },
  bodyMedium: {
    fontFamily,
    fontSize: fontSizes.md,
    fontWeight: '500',
    lineHeight: fontSizes.md * lineHeights.relaxed,
  },
  bodySmall: {
    fontFamily,
    fontSize: fontSizes.sm,
    fontWeight: '400',
    lineHeight: fontSizes.sm * lineHeights.relaxed,
  },
  caption: {
    fontFamily,
    fontSize: fontSizes.xs,
    fontWeight: '400',
    lineHeight: fontSizes.xs * lineHeights.normal,
  },
  button: {
    fontFamily: fontFamilySemi,
    fontSize: fontSizes.md,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  label: {
    fontFamily: fontFamilySemi,
    fontSize: fontSizes.sm,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
};
