/**
 * COLOR SYSTEM UTILITIES
 * ======================
 * 
 * Core utility functions for color conversion, contrast calculation, and color mixing.
 * These functions work independently of Radix and Figma API.
 */

import { HexColor, RGBAColor, FigmaColor } from './types';

// =============================================================================
// COLOR CONVERSION FUNCTIONS
// =============================================================================

/**
 * Convert hex color to RGBA format
 */
export function hexToRgb(hex: string): RGBAColor | null {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  // Validate hex format first
  if (!/^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$|^[0-9A-Fa-f]{8}$/.test(hex)) {
    return null;
  }
  
  // Handle 3-character hex (e.g., #FFF -> #FFFFFF)
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }
  
  try {
    // Handle alpha channel if present (8 characters)
    const alpha = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
    
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    
    return {
      r,
      g,
      b,
      a: alpha
    } as RGBAColor;
  } catch (error) {
    console.error('Error parsing hex:', hex, error);
    return null;
  }
}

/**
 * Convert RGB values to hex string
 */
export function rgbToHex(r: number, g: number, b: number): HexColor {
  const toHex = (n: number) => Math.round(n * 255).toString(16).padStart(2, '0');
  const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  
  // Ensure we never have 3-character hex values like #FFF
  if (hex.length === 4) {
    const colorPart = hex.substring(1);
    const expanded = colorPart.split('').map(char => char + char).join('');
    return `#${expanded}` as HexColor;
  }
  
  return hex as HexColor;
}

/**
 * Convert RGBA values to hex string with alpha
 */
export function rgbaToHex(r: number, g: number, b: number, a: number): HexColor {
  const toHex = (n: number) => Math.round(n * 255).toString(16).padStart(2, '0');
  const colorHex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  
  if (a === 1) {
    return colorHex as HexColor;
  }
  
  const alphaHex = Math.round(a * 255).toString(16).padStart(2, '0');
  return `${colorHex}${alphaHex}` as HexColor;
}

/**
 * Normalize hex color format
 */
export function normalizeHex(hex: string): HexColor {
  const cleanHex = hex.startsWith('#') ? hex.substring(1) : hex;
  
  if (cleanHex.length === 3) {
    const expanded = cleanHex.split('').map(char => char + char).join('');
    return `#${expanded.toUpperCase()}` as HexColor;
  }
  
  if (cleanHex.length === 6) {
    return `#${cleanHex.toUpperCase()}` as HexColor;
  }
  
  if (cleanHex.length === 8) {
    const colorPart = cleanHex.substring(0, 6);
    const alphaPart = cleanHex.substring(6, 8);
    const alphaValue = parseInt(alphaPart, 16);
    const alphaPercentage = Math.round((alphaValue / 255) * 100);
    return `#${colorPart.toUpperCase()} ${alphaPercentage}%` as HexColor;
  }
  
  return `#${cleanHex.toUpperCase()}` as HexColor;
}

// =============================================================================
// CONTRAST CALCULATION
// =============================================================================

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(rgb1: RGBAColor, rgb2: RGBAColor): number {
  const luminance = (r: number, g: number, b: number) => {
    const a = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  const lum1 = luminance(rgb1.r * 255, rgb1.g * 255, rgb1.b * 255) + 0.05;
  const lum2 = luminance(rgb2.r * 255, rgb2.g * 255, rgb2.b * 255) + 0.05;
  return lum1 > lum2 ? lum1 / lum2 : lum2 / lum1;
}

/**
 * Check if colors meet AA contrast requirements
 */
export function meetsAAContrast(color1: string, color2: string): boolean {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  if (!rgb1 || !rgb2) return false;
  const contrastRatio = getContrastRatio(rgb1, rgb2);
  return contrastRatio >= 4.5;
}

// =============================================================================
// COLOR MIXING
// =============================================================================

/**
 * Mix two colors with a given weight
 */
export function mixColors(color1: RGBAColor, color2: RGBAColor, weight: number): RGBAColor {
  const w = weight * 2 - 1;
  const a = color1.a - color2.a;

  const w1 = ((w * a === -1 ? w : (w + a) / (1 + w * a)) + 1) / 2;
  const w2 = 1 - w1;

  return {
    r: color1.r * w1 + color2.r * w2,
    g: color1.g * w1 + color2.g * w2,
    b: color1.b * w1 + color2.b * w2,
    a: color1.a * weight + color2.a * (1 - weight)
  } as RGBAColor;
}

// =============================================================================
// COLOR VALIDATION
// =============================================================================

/**
 * Check if a string is a valid hex color
 */
export function isValidHex(hex: string): boolean {
  const hexPattern = /^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{3}$|^#[0-9A-Fa-f]{8}$/;
  return hexPattern.test(hex);
}

/**
 * Check if RGB values are valid
 */
export function isValidRGB(r: number, g: number, b: number, a: number = 1): boolean {
  return r >= 0 && r <= 1 && g >= 0 && g <= 1 && b >= 0 && b <= 1 && a >= 0 && a <= 1;
}

// =============================================================================
// COLOR FORMAT CONVERSION
// =============================================================================

/**
 * Convert any color format to RGBAColor
 */
export function toRGBAColor(color: string | RGBAColor): RGBAColor | null {
  if (typeof color === 'string') {
    return hexToRgb(color);
  }
  return color;
}

/**
 * Convert RGBAColor to Figma color format
 */
export function toFigmaColor(rgba: RGBAColor): FigmaColor {
  return {
    r: rgba.r,
    g: rgba.g,
    b: rgba.b,
    a: rgba.a
  } as FigmaColor;
}

/**
 * Convert Figma color to RGBAColor
 */
export function fromFigmaColor(figmaColor: FigmaColor): RGBAColor {
  return {
    r: figmaColor.r,
    g: figmaColor.g,
    b: figmaColor.b,
    a: figmaColor.a
  } as RGBAColor;
}
