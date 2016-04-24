'use strict';

module.exports = {
  1: (expected, actual) => `required`,

  2: (expected, actual) => `type of the value must be ${expected}, got ${actual}.`,
  3: (expected, actual) => `type of the value must be one of ${expected}, got ${actual}.`,
  4: (expected, actual) => `type of the value must be ${expected} or Null, got ${actual}.`,

  5: (expected, actual) => `the length must be == ${expected}, got ${actual}.`,
  6: (expected, actual) => `the length must be >= ${expected}, got ${actual}.`,
  7: (expected, actual) => `the length must be <= ${expected}, got ${actual}.`,

  8: (expected, actual) => `the value must be one of ${expected}, got ${actual}.`,
  9: (expected, actual) => `the value must be >= ${expected}, got ${actual}.`,
  10: (expected, actual) => `the value must be <= ${expected}g got ${actual}.`
};