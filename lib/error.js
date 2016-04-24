'use strict';

const ERROR_REQUIRED = 1;
const ERROR_VALUE_TYPE = 2;
const ERROR_VALUE_TYPE_OR_NULL = 3;
const ERROR_VALUE_TYPE_ONE_OF = 4;
const ERROR_LENGTH_EQ = 6;
const ERROR_LENGTH_GT = 7;
const ERROR_LENGTH_LT = 8;
const ERROR_VALUE_ONE_OF = 9;
const ERROR_VALUE_GT = 10;
const ERROR_VALUE_LT = 11;

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

  ERROR_REQUIRED: JSONSchemaError.factory(ERROR_REQUIRED, (expected, actual) => `required`),
  ERROR_VALUE_TYPE: JSONSchemaError.factory(ERROR_VALUE_TYPE, (expected, actual) => `type of the value must be ${expected}, got ${actual}.`),
  ERROR_VALUE_TYPE_ONE_OF: JSONSchemaError.factory(ERROR_VALUE_TYPE_ONE_OF, (expected, actual) => `type of the value must be one of ${expected}, got ${actual}.`),
  ERROR_VALUE_TYPE_OR_NULL: JSONSchemaError.factory(ERROR_VALUE_TYPE_OR_NULL, (expected, actual) => `type of the value must be ${expected} or Null, got ${actual}.`),
  ERROR_LENGTH_EQ: JSONSchemaError.factory(ERROR_LENGTH_EQ, (expected, actual) => `the length must be == ${expected}, got ${actual}.`),
  ERROR_LENGTH_GT: JSONSchemaError.factory(ERROR_LENGTH_GT, (expected, actual) => `the length must be >= ${expected}, got ${actual}.`),
  ERROR_LENGTH_LT: JSONSchemaError.factory(ERROR_LENGTH_LT, (expected, actual) => `the length must be <= ${expected}, got ${actual}.`),
  ERROR_VALUE_ONE_OF: JSONSchemaError.factory(ERROR_VALUE_ONE_OF, (expected, actual) => `the value must be one of ${expected}, got ${actual}.`),
  ERROR_VALUE_GT: JSONSchemaError.factory(ERROR_VALUE_GT, (expected, actual) => `the value must be >= ${expected}, got ${actual}.`),
  ERROR_VALUE_LT: JSONSchemaError.factory(ERROR_VALUE_LT, (expected, actual) => `the value must be <= ${expected}g got ${actual}.`)
};

