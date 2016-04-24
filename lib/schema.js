'use strict';

const _ = require('lodash');
const ValidationResult = require('./validation-result');
const Rule = require('./rule');
const type = require('./type');

const SCHEMA$ = Symbol();

const arrayPush = (array, items) => Array.prototype.push.apply(array, items);

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
    const root = getSpecsForItem(this[SCHEMA$]);

    for (let i = 0; i < root.keys.schema.length; i++) {
      const schemaKey = root.keys.schema[i];
      const objectKey = root.keys.object[i];

      const schemaValue = _.get(this[SCHEMA$], schemaKey);
      const parsed = getSpecsForItem(schemaValue);

      _.set(root.result, objectKey, parsed.result);

      if (parsed.keys.schema) {
        arrayPush(root.keys.schema, parsed.keys.schema.map(item => `${schemaKey}.${item}`));
        arrayPush(root.keys.object, parsed.keys.object.map(item => `${objectKey}.${item}`));
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
function getSpecsForItem(item) {
  let keys = { object: null, schema: null };
  let result;

  if (_.isArray(item)) {
    keys.object = Object.keys(item);
    keys.schema = Object.keys(item);

    result = {
      type: type.TYPE_ARRAY,
      required: false,
      null: false
    };
  }

  if (_.isPlainObject(item)) {
    keys.object = Object.keys(item);
    keys.schema = Object.keys(item);

    result = {
      type: type.TYPE_OBJECT,
      required: false,
      null: false
    };
  }

  if (item instanceof Rule) {
    if (item.specs.schema) {
      keys.object = Object.keys(item.specs.schema);
      keys.schema = keys.object.map(item => `specs.schema.${item}`);
    }

    result = item.getSpecs();
  }

  if (keys.object) {
    keys.object = keys.object.map(item => `child.${item}`);
  }

  return { keys, result };
}