'use strict';

const ValidationResult = require('./validation-result');
const specsGenerator = require('./specs-generator');

const SCHEMA$ = Symbol();

module.exports = class Schema {
  /**
   *
   * @param schema
   */
  constructor(schema) {
    this[SCHEMA$] = schema;
  }

  /**
   *
   * @param object
   * @returns {ValidationResult}
   */
  validate(object) {
    return new ValidationResult(this[SCHEMA$], object);
  }

  /**
   *
   * @returns {{}}
   */
  getSpecs() {
    return specsGenerator.generate(this[SCHEMA$]);
  }
};