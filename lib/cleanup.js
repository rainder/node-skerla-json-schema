'use strict';

const _ = require('lodash');
const Rule = require('./rule');
const type = require('./type');

/**
 *
 * @param schema
 * @param object
 * @returns {*}
 */
module.exports = function (schema, object) {
  const result = type.identify(schema) === 'Object' ? {} : [];
  const schemaPaths = [];
  const objectPaths = [];

  for (let item of Object.keys(schema)) {
    schemaPaths[schemaPaths.length] = item;
    objectPaths[objectPaths.length] = item;
  }

  for (let index = 0; index < schemaPaths.length; index++) {
    const schemaPath = schemaPaths[index];
    const objectPath = objectPaths[index];
    const schemaValue = _.get(schema, schemaPath);
    const objectValue = _.get(object, objectPath);

    if (schemaValue instanceof Rule) {
      if (schemaValue._specs.type === type.TYPE_ARRAY) {
        if (_.isArray(objectValue)) {
          for (let i = 0; i < objectValue.length; i++) {
            schemaPaths[schemaPaths.length] = `${schemaPath}._specs.schema`;
            objectPaths[objectPaths.length] = `${objectPath}.${i}`;
          }
        }

        _.set(result, objectPath, []);
        continue;
      }

      if (schemaValue._specs.type === type.TYPE_OBJECT) {
        if (schemaValue._specs.schema) {
          const keys = Object.keys(schemaValue._specs.schema);
          schemaPaths.push.apply(schemaPaths, keys.map(item => `${schemaPath}._specs.schema.${item}`));
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