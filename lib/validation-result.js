'use strict';

const _ = require('lodash');
const Rule = require('./rule');
const type = require('./type');
const errorMessages = require('./error-messages');
const cleanup = require('./cleanup');

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

    this._validate();
  }

  /**
   *
   * @returns {*}
   * @private
   */
  _validate() {
    const self = this;
    const keys = [];

    if (this[SCHEMA$] instanceof Rule) {
      return check(this[SCHEMA$], undefined, this[OBJECT$]);
    }

    Array.prototype.push.apply(keys, Object.keys(this[SCHEMA$]));

    for (let key of keys) {
      const value = _.get(this[SCHEMA$], key);

      if (_.isObject(value) && !(value instanceof Rule)) {
        Array.prototype.push.apply(keys, Object.keys(value).map(item => `${key}.${item}`));
      } else {
        check(value, key, _.get(this[OBJECT$], key));
      }
    }

    /**
     *
     * @param rule
     * @param path
     * @param value
     */
    function check(rule, path, value) {
      try {
        rule.check(value, path);
      } catch (e) {
        self._handleValidationError(path, e);
      }
    }
  }

  /**
   *
   * @param path {string|undefined}
   * @param err {object|array|Error|{id,path,expected,actual}}
   * @private
   */
  _handleValidationError(path, err) {
    if (_.isArray(err)) {
      for (let item of err) {
        item.path = path ? `${path}.${item.path}` : item.path;
        this[ERRORS$].push(item);
      }
      return;
    }

    if (_.isPlainObject(err)) {
      this[ERRORS$][this[ERRORS$].length] = {
        errno: err.id,
        path: err.path,
        message: errorMessages[err.id](err.expected, err.actual)
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
    return cleanup(this[SCHEMA$], this[OBJECT$]);
  }
};