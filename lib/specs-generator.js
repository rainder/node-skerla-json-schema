'use strict';

const _ = require('lodash');
const Rule = require('./rule');
const type = require('./type');

module.exports = {
  generate
};

/**
 *
 * @returns {*}
 */
function generate(schema) {
  const root = specsItem(schema);

  for (let i = 0; i < root.keys.schema.length; i++) {
    const schemaKey = root.keys.schema[i];
    const objectKey = root.keys.object[i];

    const schemaValue = _.get(schema, schemaKey);
    const parsed = specsItem(schemaValue);

    _.set(root.result, objectKey, parsed.result);

    if (parsed.keys.schema) {
      Array.prototype.push.apply(root.keys.schema, parsed.keys.schema.map(item => `${schemaKey}.${item}`));
      Array.prototype.push.apply(root.keys.object, parsed.keys.object.map(item => `${objectKey}.${item}`));
    }
  }

  return root.result;
}

/**
 *
 * @param item
 * @returns {{}}
 */
function specsItem(item) {
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