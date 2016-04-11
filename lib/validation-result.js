'use strict';

const _ = require('lodash');
const utils = require('./utils');
const Rule = require('./rule');
const errorMessages = require('./../error-messages');

const ERRORS$ = Symbol();
const SCHEMA$ = Symbol();
const OBJECT$ = Symbol();

/**
 *
 * @type {ValidationResult}
 */
module.exports = class ValidationResult {
  /**
   *
   * @param schema
   * @param object
   */
  constructor(schema, object) {
    this[SCHEMA$] = schema;
    this[OBJECT$] = object;
    this[ERRORS$] = [];

    this._traverse();
  }

  /**
   *
   * @returns {*}
   * @private
   */
  _traverse() {
    return utils.traverseObject(this[SCHEMA$], (path, rule) => {
      const value = _.get(this[OBJECT$], path);

      try {
        rule.check(path, value);
      } catch (e) {
        this._handleValidationError(path, e);
      }
    }, { stopCondition });

    /**
     *
     * @param path
     * @param value
     * @returns {boolean}
     * @private
     */
    function stopCondition(path, value) {
      return value instanceof Rule;
    }
  }

  /**
   *
   * @param path {string}
   * @param err {object|array|Error}
   * @private
   */
  _handleValidationError(path, err) {
    if (_.isArray(err)) {
      for (let item of err) {
        item.path = `${path}.${item.path}`;
        this[ERRORS$].push(item);
      }
      return;
    }

    if (_.isPlainObject(err)) {
      this[ERRORS$][this[ERRORS$].length] = {
        path: err.path,
        message: errorMessages[err.id](err.expected, err.actual),
      };

      return;
    }

    throw err;
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
        continue;
      }

      if (schemaValue instanceof Object) {
        const keys = Object.keys(schemaValue);
        paths.push.apply(paths, keys.map(item => `${path}.${item}`));
        continue;
      }

      _.set(result, objectPath, objectValue);
    }

    return result;
  }
}