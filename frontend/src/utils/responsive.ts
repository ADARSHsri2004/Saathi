import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Breakpoints
const BREAKPOINTS = {
  xs: 320,
  sm: 375,
  md: 414,
  lg: 768,
  xl: 1024,
} as const;

// Base sizes (for iPhone 14 Pro - 390x844)
const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

/**
 * Get responsive scale factor based on screen width
 */
export const getScale = (): number => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  // Clamp scale between 0.8 and 1.2 for very small/large screens
  return Math.max(0.8, Math.min(1.2, scale));
};

/**
 * Scale a value based on screen width
 */
export const scale = (size: number): number => {
  return size * getScale();
};

/**
 * Scale font size (more conservative scaling)
 */
export const scaleFont = (size: number): number => {
  const scaleFactor = getScale();
  // Fonts scale less aggressively
  const fontScale = Math.max(0.85, Math.min(1.1, scaleFactor));
  return size * fontScale;
};

/**
 * Get responsive spacing
 */
export const getResponsiveSpacing = (baseSpacing: number): number => {
  if (SCREEN_WIDTH < BREAKPOINTS.sm) {
    return baseSpacing * 0.85; // Smaller spacing on small screens
  }
  if (SCREEN_WIDTH > BREAKPOINTS.md) {
    return baseSpacing * 1.1; // Larger spacing on bigger screens
  }
  return baseSpacing;
};

/**
 * Check if screen is small (iPhone SE, etc.)
 */
export const isSmallScreen = (): boolean => {
  return SCREEN_WIDTH < BREAKPOINTS.sm;
};

/**
 * Check if screen is medium (standard iPhone)
 */
export const isMediumScreen = (): boolean => {
  return SCREEN_WIDTH >= BREAKPOINTS.sm && SCREEN_WIDTH < BREAKPOINTS.md;
};

/**
 * Check if screen is large (iPhone Pro Max, iPad)
 */
export const isLargeScreen = (): boolean => {
  return SCREEN_WIDTH >= BREAKPOINTS.md;
};

/**
 * Get responsive width percentage
 */
export const getResponsiveWidth = (percentage: number): number => {
  return (SCREEN_WIDTH * percentage) / 100;
};

/**
 * Get responsive card width for carousels
 */
export const getCardWidth = (percentage: number = 75, minWidth?: number, maxWidth?: number): number => {
  let width = getResponsiveWidth(percentage);
  
  if (isSmallScreen()) {
    width = getResponsiveWidth(85); // Wider cards on small screens
  }
  
  if (minWidth && width < minWidth) {
    width = minWidth;
  }
  
  if (maxWidth && width > maxWidth) {
    width = maxWidth;
  }
  
  return width;
};

/**
 * Get responsive font size based on screen size
 */
export const getResponsiveFontSize = (baseSize: number): number => {
  if (isSmallScreen()) {
    return baseSize * 0.9;
  }
  if (isLargeScreen()) {
    return baseSize * 1.1;
  }
  return baseSize;
};

/**
 * Create responsive style object
 */
export const createResponsiveStyle = <T extends Record<string, any>>(
  baseStyles: T,
  responsiveOverrides: Partial<Record<keyof T, (isSmall: boolean) => any>>
): T => {
  const isSmall = isSmallScreen();
  const styles = { ...baseStyles };
  
  Object.keys(responsiveOverrides).forEach((key) => {
    const override = responsiveOverrides[key as keyof T];
    if (override) {
      (styles as any)[key] = override(isSmall);
    }
  });
  
  return styles;
};

export { SCREEN_WIDTH, SCREEN_HEIGHT, BREAKPOINTS };
