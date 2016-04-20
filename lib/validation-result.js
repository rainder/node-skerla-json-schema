'use strict';

const _ = require('lodash');
const utils = require('./utils');
const Rule = require('./rule');
const type = require('./type');
const errorMessages = require('./error-messages');

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
      const value = path ? _.get(this[OBJECT$], path) : this[OBJECT$];

      try {
        rule.check(value, path);
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
        item.path = path ? `${path}.${item.path}` : item.path;
        this[ERRORS$].push(item);
      }
      return;
    }

    if (_.isPlainObject(err)) {
      this[ERRORS$][this[ERRORS$].length] = {
        errno: err.id,
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
    const result = type.identify(this[SCHEMA$]) === 'Object' ? {} : [];
    const schemaPaths = [];
    const objectPaths = [];

    for (let item of Object.keys(this[SCHEMA$])) {
      schemaPaths[schemaPaths.length] = item;
      objectPaths[objectPaths.length] = item;
    }

    for (let index = 0; index < schemaPaths.length; index++) {
      const schemaPath = schemaPaths[index];
      const objectPath = objectPaths[index];
      const schemaValue = _.get(this[SCHEMA$], schemaPath);
      const objectValue = _.get(this[OBJECT$], objectPath);

      if (schemaValue instanceof Rule) {
        if (schemaValue.specs.type === type.TYPE_ARRAY) {
          if (_.isArray(objectValue)) {
            for (let i = 0; i < objectValue.length; i++) {
              schemaPaths[schemaPaths.length] = `${schemaPath}.specs.schema`;
              objectPaths[objectPaths.length] = `${objectPath}.${i}`;
            }
          }

          _.set(result, objectPath, []);
          continue;
        }

        if (schemaValue.specs.type === type.TYPE_OBJECT) {
          if (schemaValue.specs.schema) {
            const keys = Object.keys(schemaValue.specs.schema);
            schemaPaths.push.apply(schemaPaths, keys.map(item => `${schemaPath}.specs.schema.${item}`));
            objectPaths.push.apply(objectPaths, keys.map(item => `${objectPath}.${item}`));
          }
          _.set(result, objectPath, {});
          continue;
        }

        if (!_.isUndefined(objectValue)) {
          _.set(result, objectPath, objectValue);
        }
        continue;
      }

      if (_.isArray(schemaValue)) {
        if (_.isArray(objectValue)) {
          for (let i = 0; i < objectValue.length; i++) {
            schemaPaths[schemaPaths.length] = `${schemaPath}.0`;
            objectPaths[objectPaths.length] = `${objectPath}.${i}`;
          }
        }

        _.set(result, objectPath, []);
        continue;
      }

      if (_.isPlainObject(schemaValue)) {
        const keys = Object.keys(schemaValue);
        schemaPaths.push.apply(schemaPaths, keys.map(item => `${schemaPath}.${item}`));
        objectPaths.push.apply(objectPaths, keys.map(item => `${objectPath}.${item}`));
        _.set(result, objectPath, {});
        continue;
      }

      if (!_.isUndefined(objectValue)) {
        _.set(result, objectPath, objectValue);
      }
    }

    return result;
  }
}