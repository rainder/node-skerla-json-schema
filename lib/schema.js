'use strict';

const utils = require('./utils');
const ValidationResult = require('./validation-result');

module.exports = class Schema {
  /**
   *
   * @param schema
   */
  constructor(schema) {
    this._schema = schema;
  }

  /**
   *
   * @param object
   * @returns {ValidationResult}
   */
  validate(object) {
    return new ValidationResult(this._schema, object);
  }
};
