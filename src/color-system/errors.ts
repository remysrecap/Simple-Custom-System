/**
 * COLOR SYSTEM ERROR HANDLING
 * ===========================
 * 
 * Error creation, handling, and recovery functions for the color system.
 * Provides structured error handling with type safety.
 */

import { SystemError } from './types';

// =============================================================================
// ERROR CREATION FUNCTIONS
// =============================================================================

/**
 * Create a validation error
 */
export function createValidationError(field: string, message: string): SystemError {
  return {
    type: 'VALIDATION',
    message,
    field
  };
}

/**
 * Create a Figma API error
 */
export function createFigmaApiError(operation: string, message: string): SystemError {
  return {
    type: 'FIGMA_API',
    message,
    operation
  };
}

/**
 * Create an accessibility error
 */
export function createAccessibilityError(contrast: number, message: string): SystemError {
  return {
    type: 'ACCESSIBILITY',
    message,
    contrast
  };
}

/**
 * Create a fallback error
 */
export function createFallbackError(variable: string, message: string): SystemError {
  return {
    type: 'FALLBACK',
    message,
    variable
  };
}

// =============================================================================
// ERROR HANDLING FUNCTIONS
// =============================================================================

/**
 * Handle system errors and return user-friendly messages
 */
export function handleSystemError(error: SystemError): string {
  switch (error.type) {
    case 'VALIDATION':
      return `Validation error in ${error.field}: ${error.message}`;
    
    case 'FIGMA_API':
      return `Figma API error during ${error.operation}: ${error.message}`;
    
    case 'ACCESSIBILITY':
      return `Accessibility error (contrast ratio: ${error.contrast.toFixed(2)}): ${error.message}`;
    
    case 'FALLBACK':
      return `Fallback error for ${error.variable}: ${error.message}`;
    
    default:
      return `Unknown error: ${JSON.stringify(error)}`;
  }
}

/**
 * Check if an error can be recovered from
 */
export function canRecoverFromError(error: SystemError): boolean {
  switch (error.type) {
    case 'VALIDATION':
      return false; // Validation errors cannot be recovered from
    
    case 'FIGMA_API':
      return true; // Figma API errors might be recoverable
    
    case 'ACCESSIBILITY':
      return true; // Accessibility errors can be fixed with fallbacks
    
    case 'FALLBACK':
      return false; // Fallback errors are already the last resort
    
    default:
      return false;
  }
}

/**
 * Get error severity level
 */
export function getErrorSeverity(error: SystemError): 'low' | 'medium' | 'high' | 'critical' {
  switch (error.type) {
    case 'VALIDATION':
      return 'high'; // Validation errors prevent system from working
    
    case 'FIGMA_API':
      return 'critical'; // Figma API errors are critical
    
    case 'ACCESSIBILITY':
      return 'medium'; // Accessibility errors are important but not critical
    
    case 'FALLBACK':
      return 'low'; // Fallback errors are expected in some cases
    
    default:
      return 'medium';
  }
}

// =============================================================================
// ERROR RECOVERY FUNCTIONS
// =============================================================================

/**
 * Attempt to recover from a Figma API error
 */
export function attemptFigmaApiRecovery(error: SystemError): SystemError | null {
  if (error.type !== 'FIGMA_API') {
    return null;
  }
  
  // Common Figma API recovery strategies
  if (error.message.includes('Collection not found')) {
    return createFallbackError('collection', 'Using fallback collection creation');
  }
  
  if (error.message.includes('Variable not found')) {
    return createFallbackError('variable', 'Using fallback variable creation');
  }
  
  if (error.message.includes('Mode not found')) {
    return createFallbackError('mode', 'Using fallback mode creation');
  }
  
  return null; // No recovery possible
}

/**
 * Attempt to recover from an accessibility error
 */
export function attemptAccessibilityRecovery(error: SystemError): SystemError | null {
  if (error.type !== 'ACCESSIBILITY') {
    return null;
  }
  
  // Accessibility recovery strategies
  if (error.contrast < 4.5) {
    return createFallbackError('contrast', 'Using high-contrast fallback colors');
  }
  
  return null; // No recovery possible
}

// =============================================================================
// ERROR LOGGING FUNCTIONS
// =============================================================================

/**
 * Log an error with appropriate level
 */
export function logError(error: SystemError, context?: string): void {
  const severity = getErrorSeverity(error);
  const message = handleSystemError(error);
  const contextStr = context ? ` [${context}]` : '';
  
  switch (severity) {
    case 'critical':
      console.error(`🚨 CRITICAL ERROR${contextStr}: ${message}`);
      break;
    
    case 'high':
      console.error(`❌ HIGH ERROR${contextStr}: ${message}`);
      break;
    
    case 'medium':
      console.warn(`⚠️ MEDIUM ERROR${contextStr}: ${message}`);
      break;
    
    case 'low':
      console.info(`ℹ️ LOW ERROR${contextStr}: ${message}`);
      break;
  }
}

/**
 * Log multiple errors
 */
export function logErrors(errors: SystemError[], context?: string): void {
  if (errors.length === 0) {
    console.log('✅ No errors found');
    return;
  }
  
  console.log(`📋 Found ${errors.length} error(s):`);
  errors.forEach((error, index) => {
    logError(error, `${context || 'Unknown'} #${index + 1}`);
  });
}

// =============================================================================
// ERROR AGGREGATION FUNCTIONS
// =============================================================================

/**
 * Group errors by type
 */
export function groupErrorsByType(errors: SystemError[]): Record<string, SystemError[]> {
  return errors.reduce((groups, error) => {
    const type = error.type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(error);
    return groups;
  }, {} as Record<string, SystemError[]>);
}

/**
 * Get error summary
 */
export function getErrorSummary(errors: SystemError[]): string {
  if (errors.length === 0) {
    return 'No errors found';
  }
  
  const groups = groupErrorsByType(errors);
  const summary = Object.entries(groups)
    .map(([type, typeErrors]) => `${type}: ${typeErrors.length}`)
    .join(', ');
  
  return `${errors.length} error(s) found: ${summary}`;
}

/**
 * Filter errors by severity
 */
export function filterErrorsBySeverity(errors: SystemError[], severity: 'low' | 'medium' | 'high' | 'critical'): SystemError[] {
  return errors.filter(error => getErrorSeverity(error) === severity);
}

// =============================================================================
// ERROR RECOVERY STRATEGIES
// =============================================================================

/**
 * Attempt to recover from all errors
 */
export function attemptErrorRecovery(errors: SystemError[]): { recovered: SystemError[]; unrecoverable: SystemError[] } {
  const recovered: SystemError[] = [];
  const unrecoverable: SystemError[] = [];
  
  for (const error of errors) {
    if (canRecoverFromError(error)) {
      let recoveryError: SystemError | null = null;
      
      if (error.type === 'FIGMA_API') {
        recoveryError = attemptFigmaApiRecovery(error);
      } else if (error.type === 'ACCESSIBILITY') {
        recoveryError = attemptAccessibilityRecovery(error);
      }
      
      if (recoveryError) {
        recovered.push(recoveryError);
      } else {
        unrecoverable.push(error);
      }
    } else {
      unrecoverable.push(error);
    }
  }
  
  return { recovered, unrecoverable };
}

// =============================================================================
// ERROR VALIDATION FUNCTIONS
// =============================================================================

/**
 * Validate that an error object is properly structured
 */
export function validateError(error: any): error is SystemError {
  if (!error || typeof error !== 'object') {
    return false;
  }
  
  if (!error.type || typeof error.type !== 'string') {
    return false;
  }
  
  if (!error.message || typeof error.message !== 'string') {
    return false;
  }
  
  // Check type-specific fields
  switch (error.type) {
    case 'VALIDATION':
      return typeof error.field === 'string';
    
    case 'FIGMA_API':
      return typeof error.operation === 'string';
    
    case 'ACCESSIBILITY':
      return typeof error.contrast === 'number';
    
    case 'FALLBACK':
      return typeof error.variable === 'string';
    
    default:
      return false;
  }
}

/**
 * Validate an array of errors
 */
export function validateErrors(errors: any[]): SystemError[] {
  return errors.filter(validateError);
}
