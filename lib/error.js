'use strict';

class JSONSchemaError {
  /**
   *
   * @param id
   * @param fn
   * @param path
   * @param expected
   * @param actual
   */
  constructor(id, fn, path, expected, actual) {
    this.id = id;
    this.fn = fn;
    this.path = path;
    this.expected = expected;
    this.actual = actual;
  }

  /**
   *
   * @returns {{errno: *, path: *, message: *}}
   */
  toObject() {
    return {
      errno: this.id,
      path: this.path,
      message: this.fn(this.expected, this.actual)
    };
  }

  /**
   *
   * @param id
   * @param fn
   * @returns {Function}
   */
  static factory(id, fn) {
    return (path, expected, actual) => new JSONSchemaError(id, fn, path, expected, actual);
  }
}

module.exports = {
  JSONSchemaError,

  ERROR_REQUIRED: JSONSchemaError.factory(1, (expected, actual) => `required`),
  ERROR_VALUE_TYPE: JSONSchemaError.factory(2, (expected, actual) => `type of the value must be ${expected}, got ${actual}.`),
  ERROR_VALUE_TYPE_ONE_OF: JSONSchemaError.factory(3, (expected, actual) => `type of the value must be one of ${expected}, got ${actual}.`),
  ERROR_VALUE_TYPE_OR_NULL: JSONSchemaError.factory(4, (expected, actual) => `type of the value must be ${expected} or Null, got ${actual}.`),
  ERROR_LENGTH_EQ: JSONSchemaError.factory(5, (expected, actual) => `the length must be == ${expected}, got ${actual}.`),
  ERROR_LENGTH_GT: JSONSchemaError.factory(6, (expected, actual) => `the length must be >= ${expected}, got ${actual}.`),
  ERROR_LENGTH_LT: JSONSchemaError.factory(7, (expected, actual) => `the length must be <= ${expected}, got ${actual}.`),
  ERROR_VALUE_ONE_OF: JSONSchemaError.factory(8, (expected, actual) => `the value must be one of ${expected}, got ${actual}.`),
  ERROR_VALUE_GT: JSONSchemaError.factory(9, (expected, actual) => `the value must be >= ${expected}, got ${actual}.`),
  ERROR_VALUE_LT: JSONSchemaError.factory(10, (expected, actual) => `the value must be <= ${expected}g got ${actual}.`)
};