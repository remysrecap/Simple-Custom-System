/**
 * COLOR SYSTEM VALIDATION
 * =======================
 * 
 * Input validation functions for the color system.
 * These functions validate user inputs and system data.
 */

import { ColorSystemOptions, HexValidationResult, ValidationResult, RadixTheme, Themes } from './types';
import { isValidHex } from './utils';

// =============================================================================
// HEX COLOR VALIDATION
// =============================================================================

/**
 * Validate a hex color string
 */
export function validateHexColor(hex: string): HexValidationResult {
  if (!hex || typeof hex !== 'string') {
    return { isValid: false, error: 'Hex color must be a string' };
  }
  
  if (!hex.startsWith('#')) {
    return { isValid: false, error: 'Hex color must start with #' };
  }
  
  if (!isValidHex(hex)) {
    return { isValid: false, error: 'Invalid hex color format' };
  }
  
  return { isValid: true };
}

// =============================================================================
// COLOR SYSTEM OPTIONS VALIDATION
// =============================================================================

/**
 * Validate color system options
 */
export function validateColorSystemOptions(options: any): ValidationResult {
  const errors: string[] = [];
  
  // Check if options is an object
  if (!options || typeof options !== 'object') {
    return { isValid: false, errors: ['Options must be an object'] };
  }
  
  // Validate hexColor
  if (!options.hexColor) {
    errors.push('hexColor is required');
  } else {
    const hexColorValidation = validateHexColor(options.hexColor);
    if (!hexColorValidation.isValid) {
      errors.push(`hexColor: ${hexColorValidation.error}`);
    }
  }
  
  // Validate neutral
  if (!options.neutral) {
    errors.push('neutral is required');
  } else {
    const neutralValidation = validateHexColor(options.neutral);
    if (!neutralValidation.isValid) {
      errors.push(`neutral: ${neutralValidation.error}`);
    }
  }
  
  // Validate success
  if (!options.success) {
    errors.push('success is required');
  } else {
    const successValidation = validateHexColor(options.success);
    if (!successValidation.isValid) {
      errors.push(`success: ${successValidation.error}`);
    }
  }
  
  // Validate error
  if (!options.error) {
    errors.push('error is required');
  } else {
    const errorValidation = validateHexColor(options.error);
    if (!errorValidation.isValid) {
      errors.push(`error: ${errorValidation.error}`);
    }
  }
  
  // Validate appearance
  if (!options.appearance) {
    errors.push('appearance is required');
  } else if (!['light', 'dark', 'both'].includes(options.appearance)) {
    errors.push('appearance must be "light", "dark", or "both"');
  }
  
  // Validate includePrimitives (optional)
  if (options.includePrimitives !== undefined && typeof options.includePrimitives !== 'boolean') {
    errors.push('includePrimitives must be a boolean');
  }
  
  // Validate versionNumber (optional)
  if (options.versionNumber !== undefined && typeof options.versionNumber !== 'string') {
    errors.push('versionNumber must be a string');
  }
  
  // Validate supportsMultipleModes (optional)
  if (options.supportsMultipleModes !== undefined && typeof options.supportsMultipleModes !== 'boolean') {
    errors.push('supportsMultipleModes must be a boolean');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// =============================================================================
// RADIX THEME VALIDATION
// =============================================================================

/**
 * Validate a Radix theme structure
 */
export function validateRadixTheme(theme: any): ValidationResult {
  const errors: string[] = [];
  
  if (!theme || typeof theme !== 'object') {
    return { isValid: false, errors: ['Theme must be an object'] };
  }
  
  // Validate accentScale
  if (!Array.isArray(theme.accentScale)) {
    errors.push('accentScale must be an array');
  } else if (theme.accentScale.length !== 12) {
    errors.push('accentScale must have exactly 12 colors');
  } else {
    theme.accentScale.forEach((color: string, index: number) => {
      const validation = validateHexColor(color);
      if (!validation.isValid) {
        errors.push(`accentScale[${index}]: ${validation.error}`);
      }
    });
  }
  
  // Validate accentScaleAlpha
  if (!Array.isArray(theme.accentScaleAlpha)) {
    errors.push('accentScaleAlpha must be an array');
  } else if (theme.accentScaleAlpha.length !== 12) {
    errors.push('accentScaleAlpha must have exactly 12 colors');
  } else {
    theme.accentScaleAlpha.forEach((color: string, index: number) => {
      const validation = validateHexColor(color);
      if (!validation.isValid) {
        errors.push(`accentScaleAlpha[${index}]: ${validation.error}`);
      }
    });
  }
  
  // Validate accentContrast
  if (!theme.accentContrast) {
    errors.push('accentContrast is required');
  } else {
    const contrastValidation = validateHexColor(theme.accentContrast);
    if (!contrastValidation.isValid) {
      errors.push(`accentContrast: ${contrastValidation.error}`);
    }
  }
  
  // Validate background
  if (!theme.background) {
    errors.push('background is required');
  } else {
    const backgroundValidation = validateHexColor(theme.background);
    if (!backgroundValidation.isValid) {
      errors.push(`background: ${backgroundValidation.error}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate complete themes collection
 */
export function validateThemes(themes: any): ValidationResult {
  const errors: string[] = [];
  
  if (!themes || typeof themes !== 'object') {
    return { isValid: false, errors: ['Themes must be an object'] };
  }
  
  // Validate brand theme
  if (!themes.brand) {
    errors.push('brand theme is required');
  } else {
    if (!themes.brand.light) {
      errors.push('brand.light theme is required');
    } else {
      const lightValidation = validateRadixTheme(themes.brand.light);
      if (!lightValidation.isValid) {
        errors.push(`brand.light: ${lightValidation.errors.join(', ')}`);
      }
    }
    
    if (!themes.brand.dark) {
      errors.push('brand.dark theme is required');
    } else {
      const darkValidation = validateRadixTheme(themes.brand.dark);
      if (!darkValidation.isValid) {
        errors.push(`brand.dark: ${darkValidation.errors.join(', ')}`);
      }
    }
  }
  
  // Validate neutral theme
  if (!themes.neutral) {
    errors.push('neutral theme is required');
  } else {
    if (!themes.neutral.light) {
      errors.push('neutral.light theme is required');
    } else {
      const lightValidation = validateRadixTheme(themes.neutral.light);
      if (!lightValidation.isValid) {
        errors.push(`neutral.light: ${lightValidation.errors.join(', ')}`);
      }
    }
    
    if (!themes.neutral.dark) {
      errors.push('neutral.dark theme is required');
    } else {
      const darkValidation = validateRadixTheme(themes.neutral.dark);
      if (!darkValidation.isValid) {
        errors.push(`neutral.dark: ${darkValidation.errors.join(', ')}`);
      }
    }
  }
  
  // Validate success theme
  if (!themes.success) {
    errors.push('success theme is required');
  } else {
    if (!themes.success.light) {
      errors.push('success.light theme is required');
    } else {
      const lightValidation = validateRadixTheme(themes.success.light);
      if (!lightValidation.isValid) {
        errors.push(`success.light: ${lightValidation.errors.join(', ')}`);
      }
    }
    
    if (!themes.success.dark) {
      errors.push('success.dark theme is required');
    } else {
      const darkValidation = validateRadixTheme(themes.success.dark);
      if (!darkValidation.isValid) {
        errors.push(`success.dark: ${darkValidation.errors.join(', ')}`);
      }
    }
  }
  
  // Validate error theme
  if (!themes.error) {
    errors.push('error theme is required');
  } else {
    if (!themes.error.light) {
      errors.push('error.light theme is required');
    } else {
      const lightValidation = validateRadixTheme(themes.error.light);
      if (!lightValidation.isValid) {
        errors.push(`error.light: ${lightValidation.errors.join(', ')}`);
      }
    }
    
    if (!themes.error.dark) {
      errors.push('error.dark theme is required');
    } else {
      const darkValidation = validateRadixTheme(themes.error.dark);
      if (!darkValidation.isValid) {
        errors.push(`error.dark: ${darkValidation.errors.join(', ')}`);
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// =============================================================================
// UTILITY VALIDATION FUNCTIONS
// =============================================================================

/**
 * Validate that a value is not null or undefined
 */
export function validateRequired(value: any, fieldName: string): ValidationResult {
  if (value === null || value === undefined) {
    return { isValid: false, errors: [`${fieldName} is required`] };
  }
  return { isValid: true, errors: [] };
}

/**
 * Validate that a value is a string
 */
export function validateString(value: any, fieldName: string): ValidationResult {
  if (typeof value !== 'string') {
    return { isValid: false, errors: [`${fieldName} must be a string`] };
  }
  return { isValid: true, errors: [] };
}

/**
 * Validate that a value is a boolean
 */
export function validateBoolean(value: any, fieldName: string): ValidationResult {
  if (typeof value !== 'boolean') {
    return { isValid: false, errors: [`${fieldName} must be a boolean`] };
  }
  return { isValid: true, errors: [] };
}

/**
 * Validate that a value is an array
 */
export function validateArray(value: any, fieldName: string): ValidationResult {
  if (!Array.isArray(value)) {
    return { isValid: false, errors: [`${fieldName} must be an array`] };
  }
  return { isValid: true, errors: [] };
}
