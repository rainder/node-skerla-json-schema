'use strict';

const _ = require('lodash');
const utils = require('./utils');
const Rule = require('./rule');
const errorMessages = require('./../error-messages');
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
    const errors = [];

    utils.traverseObject(this._schema, traverse, { stopCondition });

    return new ValidationResult(this._schema, object, errors);

    /**
     *
     * @param path
     * @param rule
     */
    function traverse(path, rule) {
      const value = _.get(object, path);
      try {
        rule.check(path, value);
      } catch (e) {
        if (e instanceof Error) {
          throw e;
        }

        if (_.isArray(e)) {
          for (let item of e) {
            item.path = `${path}.${item.path}`;
            errors.push(item);
          }
        } else {
          errors[errors.length] = {
            path: e.path,
            message: errorMessages[e.id](e.expected, e.actual),
          };
        }
      }
    }

    /**
     *
     * @param path
     * @param value
     * @returns {boolean}
     */
    function stopCondition(path, value) {
      return value instanceof Rule;
    }
  }
};
