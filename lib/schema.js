'use strict';

const _ = require('lodash');
const ValidationResult = require('./validation-result');
const Rule = require('./rule');
const type = require('./type');

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
    const root = specifyItem(this[SCHEMA$]);

    for (let key of root.keys) {
      const value = _.get(this[SCHEMA$], key);
      const parsed = specifyItem(value);
      const objectKey = key
        .replace(/\.specs\.schema/g, '')
        .replace(/^specs\.schema\./g, '')
        .replace(/\./g, '.child.');

      _.set(root.result, `child.${objectKey}`, parsed.result);

      if (parsed.keys) {
        Array.prototype.push.apply(root.keys, parsed.keys.map(item => `${key}.${item}`));
      }
    }

    return root.result;
  }
};


/**
 *
 * @param item
 * @returns {{}}
 */
function specifyItem(item) {
  let keys;
  let result;

  if (_.isArray(item)) {
    result = {
      type: type.TYPE_ARRAY,
      required: false,
      null: false
    };
    keys = Object.keys(item);
  }

  if (_.isPlainObject(item)) {
    result = {
      type: type.TYPE_OBJECT,
      required: false,
      null: false
    };
    keys = Object.keys(item);
  }

  if (item instanceof Rule) {
    result = item.getSpecs();

    if (item.specs.schema) {
      keys = Object.keys(item.specs.schema).map(item => `specs.schema.${item}`);
    }
  }

  return { keys, result };
}