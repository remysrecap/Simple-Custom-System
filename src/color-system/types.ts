/**
 * COLOR SYSTEM TYPES
 * ==================
 * 
 * Core type definitions for the color system.
 * These types ensure type safety and prevent common errors.
 */

// =============================================================================
// BRANDED TYPES - Prevent color format confusion
// =============================================================================

export type HexColor = string & { readonly __brand: 'HexColor' };
export type RGBAColor = { r: number; g: number; b: number; a: number } & { readonly __brand: 'RGBAColor' };
export type FigmaColor = { r: number; g: number; b: number; a: number } & { readonly __brand: 'FigmaColor' };

// =============================================================================
// SYSTEM STATE TYPES
// =============================================================================

export type SystemState = 
  | { type: 'idle' }
  | { type: 'validating'; input: ColorSystemOptions }
  | { type: 'generating'; themes: Partial<Themes> }
  | { type: 'creating'; collections: Partial<Collections> }
  | { type: 'complete'; result: ColorSystemResult }
  | { type: 'error'; error: SystemError };

// =============================================================================
// ERROR TYPES
// =============================================================================

export type SystemError = 
  | { type: 'VALIDATION'; message: string; field: string }
  | { type: 'FIGMA_API'; message: string; operation: string }
  | { type: 'ACCESSIBILITY'; message: string; contrast: number }
  | { type: 'FALLBACK'; message: string; variable: string };

// =============================================================================
// INPUT/OUTPUT INTERFACES
// =============================================================================

export interface ColorSystemOptions {
  hexColor: HexColor;
  neutral: HexColor;
  success: HexColor;
  error: HexColor;
  appearance: "light" | "dark" | "both";
  includePrimitives?: boolean;
  versionNumber?: string;
  supportsMultipleModes?: boolean;
}

export interface RadixTheme {
  accentScale: HexColor[];        // 12 colors
  accentScaleAlpha: HexColor[];  // 12 alpha variants
  accentContrast: HexColor;      // 1 contrast color
  background: HexColor;          // 1 background color
}

export interface Themes {
  brand: { light: RadixTheme; dark: RadixTheme };
  neutral: { light: RadixTheme; dark: RadixTheme };
  success: { light: RadixTheme; dark: RadixTheme };
  error: { light: RadixTheme; dark: RadixTheme };
}

export interface Collections {
  color?: VariableCollection;
  primitive?: VariableCollection;
  semantic?: VariableCollection;
}

export interface ColorSystemResult {
  collections: Collections;
  themes: Themes;
  errors: SystemError[];
  warnings: string[];
}

// =============================================================================
// FIGMA API TYPE EXTENSIONS
// =============================================================================

export interface VariableCollection {
  id: string;
  name: string;
  modes: VariableMode[];
  variableIds: string[];
  addVariable(variable: Variable): void;
  addMode(name: string): string;
  remove(): void;
  renameMode(modeId: string, name: string): void;
}

export interface VariableMode {
  modeId: string;
  name: string;
}

export interface Variable {
  id: string;
  name: string;
  setValueForMode(modeId: string, value: RGBAColor | VariableAlias): void;
}

export interface VariableAlias {
  type: "VARIABLE_ALIAS";
  id: string;
}

// =============================================================================
// VALIDATION RESULT TYPES
// =============================================================================

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface HexValidationResult {
  isValid: boolean;
  error?: string;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type ColorFormat = 'hex' | 'rgb' | 'rgba';
export type AppearanceMode = 'light' | 'dark' | 'both';
export type VariableType = 'COLOR' | 'FLOAT' | 'STRING' | 'BOOLEAN';
export type CollectionMode = 'single' | 'primitive-semantic';
