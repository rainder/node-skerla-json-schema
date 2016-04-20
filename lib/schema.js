'use strict';

const _ = require('lodash');
const utils = require('./utils');
const ValidationResult = require('./validation-result');
const Rule = require('./rule');

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
    const result = {};

    utils.traverseObject(this[SCHEMA$], (path, rule) => {
      path = path
        .replace(/\.specs\.schema/, '')
        .replace(/\./g, '.child.');

      if (rule instanceof Rule) {
        _.set(result, path, rule.getSpecs());

        if (!rule.specs.schema) {
          return;
        }

        return Object.keys(rule.specs.schema).map(item => `specs.schema.${item}`)
      }

      if (_.isPlainObject(rule)) {
        _.set(result, path, {
          type: 'Object',
          required: false,
          null: false,
          child: {}
        });

        return Object.keys(rule);
      }

      return Object.keys(rule);
    }, { stopCondition });

    return result;

    /**
     *
     * @param path
     * @param value
     * @returns {boolean}
     * @private
     */
    function stopCondition(path, value) {
      return value instanceof Rule || (_.isPlainObject(value) && !!path);
    }
  }
};
