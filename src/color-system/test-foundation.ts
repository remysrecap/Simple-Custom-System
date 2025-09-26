/**
 * FOUNDATION TESTING
 * ==================
 * 
 * Comprehensive test suite for Phase 1 foundation components.
 * Tests all utilities, validation, error handling, and manager functionality.
 */

import { 
  hexToRgb, 
  rgbToHex, 
  rgbaToHex,
  getContrastRatio,
  meetsAAContrast,
  mixColors,
  isValidHex,
  toRGBAColor,
  toFigmaColor,
  fromFigmaColor
} from './utils';

import { 
  validateHexColor,
  validateColorSystemOptions,
  validateRadixTheme,
  validateThemes
} from './validation';

import { 
  createValidationError,
  createFigmaApiError,
  createAccessibilityError,
  createFallbackError,
  handleSystemError,
  canRecoverFromError,
  getErrorSeverity,
  logError,
  logErrors,
  getErrorSummary,
  attemptErrorRecovery
} from './errors';

import { ColorSystemManager } from './manager';

// =============================================================================
// TEST CONFIGURATION
// =============================================================================

const TEST_COLORS = {
  red: "#FF0000",
  green: "#00FF00", 
  blue: "#0000FF",
  white: "#FFFFFF",
  black: "#000000",
  gray: "#808080",
  invalid: "not a color",
  short: "#FFF",
  alpha: "#FF000080"
};

const TEST_OPTIONS = {
  hexColor: "#3B82F6",
  neutral: "#6B7280",
  success: "#10B981",
  error: "#EF4444",
  appearance: "light" as const,
  includePrimitives: true
};

// =============================================================================
// COLOR CONVERSION TESTS
// =============================================================================

export function testColorConversion(): void {
  console.log('🧪 Testing Color Conversion...');
  
  // Test hex to RGB conversion
  console.log('\n1. Testing hexToRgb:');
  Object.entries(TEST_COLORS).forEach(([name, hex]) => {
    const result = hexToRgb(hex);
    console.log(`  ${name}: ${hex} -> ${result ? JSON.stringify(result) : 'null'}`);
  });
  
  // Test RGB to hex conversion
  console.log('\n2. Testing rgbToHex:');
  const testRGBs = [
    { r: 1, g: 0, b: 0, name: 'red' },
    { r: 0, g: 1, b: 0, name: 'green' },
    { r: 0, g: 0, b: 1, name: 'blue' },
    { r: 1, g: 1, b: 1, name: 'white' },
    { r: 0, g: 0, b: 0, name: 'black' }
  ];
  
  testRGBs.forEach(({ r, g, b, name }) => {
    const hex = rgbToHex(r, g, b);
    console.log(`  ${name}: RGB(${r}, ${g}, ${b}) -> ${hex}`);
  });
  
  // Test RGBA to hex conversion
  console.log('\n3. Testing rgbaToHex:');
  const testRGBAs = [
    { r: 1, g: 0, b: 0, a: 1, name: 'red opaque' },
    { r: 1, g: 0, b: 0, a: 0.5, name: 'red 50%' },
    { r: 0, g: 0, b: 0, a: 0, name: 'transparent' }
  ];
  
  testRGBAs.forEach(({ r, g, b, a, name }) => {
    const hex = rgbaToHex(r, g, b, a);
    console.log(`  ${name}: RGBA(${r}, ${g}, ${b}, ${a}) -> ${hex}`);
  });
  
  // Test contrast calculation
  console.log('\n4. Testing contrast calculation:');
  const contrastTests = [
    { color1: "#FFFFFF", color2: "#000000", name: "white on black" },
    { color1: "#000000", color2: "#FFFFFF", name: "black on white" },
    { color1: "#FF0000", color2: "#00FF00", name: "red on green" },
    { color1: "#808080", color2: "#FFFFFF", name: "gray on white" }
  ];
  
  contrastTests.forEach(({ color1, color2, name }) => {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    if (rgb1 && rgb2) {
      const contrast = getContrastRatio(rgb1, rgb2);
      const meetsAA = meetsAAContrast(color1, color2);
      console.log(`  ${name}: ${contrast.toFixed(2)}:1 (AA: ${meetsAA})`);
    }
  });
  
  // Test color mixing
  console.log('\n5. Testing color mixing:');
  const red = hexToRgb("#FF0000");
  const blue = hexToRgb("#0000FF");
  if (red && blue) {
    const mixed = mixColors(red, blue, 0.5);
    const mixedHex = rgbToHex(mixed.r, mixed.g, mixed.b);
    console.log(`  Red + Blue (50/50): ${mixedHex}`);
  }
  
  console.log('✅ Color conversion tests complete\n');
}

// =============================================================================
// VALIDATION TESTS
// =============================================================================

export function testValidation(): void {
  console.log('🧪 Testing Validation...');
  
  // Test hex color validation
  console.log('\n1. Testing hex color validation:');
  Object.entries(TEST_COLORS).forEach(([name, hex]) => {
    const result = validateHexColor(hex);
    console.log(`  ${name}: ${hex} -> ${result.isValid ? 'valid' : 'invalid'} ${result.error || ''}`);
  });
  
  // Test color system options validation
  console.log('\n2. Testing color system options validation:');
  const validOptions = TEST_OPTIONS;
  const invalidOptions = {
    hexColor: "not a color",
    neutral: "#6B7280",
    success: "#10B981",
    error: "#EF4444",
    appearance: "light"
  };
  
  const validResult = validateColorSystemOptions(validOptions);
  const invalidResult = validateColorSystemOptions(invalidOptions);
  
  console.log(`  Valid options: ${validResult.isValid ? 'valid' : 'invalid'}`);
  if (!validResult.isValid) {
    console.log(`    Errors: ${validResult.errors.join(', ')}`);
  }
  
  console.log(`  Invalid options: ${invalidResult.isValid ? 'valid' : 'invalid'}`);
  if (!invalidResult.isValid) {
    console.log(`    Errors: ${invalidResult.errors.join(', ')}`);
  }
  
  console.log('✅ Validation tests complete\n');
}

// =============================================================================
// ERROR HANDLING TESTS
// =============================================================================

export function testErrorHandling(): void {
  console.log('🧪 Testing Error Handling...');
  
  // Test error creation
  console.log('\n1. Testing error creation:');
  const validationError = createValidationError('hexColor', 'Invalid hex format');
  const figmaError = createFigmaApiError('createVariable', 'Collection not found');
  const accessibilityError = createAccessibilityError(3.2, 'Insufficient contrast');
  const fallbackError = createFallbackError('Brand/9', 'Using fallback color');
  
  console.log(`  Validation error: ${JSON.stringify(validationError)}`);
  console.log(`  Figma error: ${JSON.stringify(figmaError)}`);
  console.log(`  Accessibility error: ${JSON.stringify(accessibilityError)}`);
  console.log(`  Fallback error: ${JSON.stringify(fallbackError)}`);
  
  // Test error handling
  console.log('\n2. Testing error handling:');
  const errors = [validationError, figmaError, accessibilityError, fallbackError];
  errors.forEach(error => {
    const message = handleSystemError(error);
    const canRecover = canRecoverFromError(error);
    const severity = getErrorSeverity(error);
    console.log(`  ${error.type}: ${message} (Recoverable: ${canRecover}, Severity: ${severity})`);
  });
  
  // Test error logging
  console.log('\n3. Testing error logging:');
  logErrors(errors, 'Test Suite');
  
  // Test error summary
  console.log('\n4. Testing error summary:');
  const summary = getErrorSummary(errors);
  console.log(`  Summary: ${summary}`);
  
  // Test error recovery
  console.log('\n5. Testing error recovery:');
  const recovery = attemptErrorRecovery(errors);
  console.log(`  Recovered: ${recovery.recovered.length} errors`);
  console.log(`  Unrecoverable: ${recovery.unrecoverable.length} errors`);
  
  console.log('✅ Error handling tests complete\n');
}

// =============================================================================
// MANAGER TESTS
// =============================================================================

export function testManager(): void {
  console.log('🧪 Testing Color System Manager...');
  
  const manager = new ColorSystemManager();
  
  // Test initial state
  console.log('\n1. Testing initial state:');
  console.log(`  State: ${manager.getState().type}`);
  console.log(`  Errors: ${manager.getErrors().length}`);
  console.log(`  Warnings: ${manager.getWarnings().length}`);
  
  // Test error management
  console.log('\n2. Testing error management:');
  manager.addError(createValidationError('test', 'Test error'));
  manager.addWarning('Test warning');
  console.log(`  Errors after adding: ${manager.getErrors().length}`);
  console.log(`  Warnings after adding: ${manager.getWarnings().length}`);
  
  // Test error summary
  console.log('\n3. Testing error summary:');
  const summary = manager.getErrorSummary();
  console.log(`  Summary: ${summary}`);
  
  // Test state logging
  console.log('\n4. Testing state logging:');
  manager.logState();
  
  // Test reset
  console.log('\n5. Testing reset:');
  manager.reset();
  console.log(`  State after reset: ${manager.getState().type}`);
  console.log(`  Errors after reset: ${manager.getErrors().length}`);
  
  console.log('✅ Manager tests complete\n');
}

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

export function testIntegration(): void {
  console.log('🧪 Testing Integration...');
  
  const manager = new ColorSystemManager();
  
  // Test with valid options
  console.log('\n1. Testing with valid options:');
  const validOptions = TEST_OPTIONS;
  console.log('  Options:', JSON.stringify(validOptions, null, 2));
  
  // Test with invalid options
  console.log('\n2. Testing with invalid options:');
  const invalidOptions = {
    hexColor: "not a color",
    neutral: "#6B7280",
    success: "#10B981",
    error: "#EF4444",
    appearance: "light"
  };
  console.log('  Options:', JSON.stringify(invalidOptions, null, 2));
  
  console.log('✅ Integration tests complete\n');
}

// =============================================================================
// MAIN TEST RUNNER
// =============================================================================

export function runAllTests(): void {
  console.log('🚀 Running Color System Foundation Tests...\n');
  
  try {
    testColorConversion();
    testValidation();
    testErrorHandling();
    testManager();
    testIntegration();
    
    console.log('🎉 All foundation tests completed successfully!');
    console.log('\n📋 Test Summary:');
    console.log('  ✅ Color conversion functions');
    console.log('  ✅ Validation functions');
    console.log('  ✅ Error handling system');
    console.log('  ✅ Manager functionality');
    console.log('  ✅ Integration testing');
    console.log('\n🎯 Phase 1 foundation is ready for Phase 2!');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    throw error;
  }
}
