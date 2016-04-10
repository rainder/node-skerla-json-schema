'use strict';

const _ = require('lodash');
const Rule = require('./rule');

const ERRORS$ = Symbol();
const SCHEMA$ = Symbol();
const OBJECT$ = Symbol();

module.exports = class ValidationResult {
  constructor(schema, object, errors) {
    this[SCHEMA$] = schema;
    this[ERRORS$] = errors;
    this[OBJECT$] = object;
  }

  /**
   *
   * @returns {boolean}
   */
  isValid() {
    return this[ERRORS$].length === 0;
  }

  /**
   *
   * @returns {Array}
   */
  getErrors() {
    return this[ERRORS$];
  }

  /**
   *
   * @returns {{}}
   */
  cleanup() {
    const result = {};
    const paths = Object.keys(this[SCHEMA$]);

    for (let path of paths) {
      const objectPath = path.replace(/\._schema/g, '');
      const schemaValue = _.get(this[SCHEMA$], path);
      const objectValue = _.get(this[OBJECT$], objectPath);

      if (schemaValue instanceof Rule) {
        if (schemaValue._schema) {
          const keys = Object.keys(schemaValue._schema);
          paths.push.apply(paths, keys.map(item => `${path}._schema.${item}`));
        } else {
          _.set(result, objectPath, objectValue);
        }
      } else if (schemaValue instanceof Object) {
        const keys = Object.keys(schemaValue);
        paths.push.apply(paths, keys.map(item => `${path}.${item}`));
      } else {
        _.set(result, objectPath, objectValue);
      }
    }

    return result;
  }
}