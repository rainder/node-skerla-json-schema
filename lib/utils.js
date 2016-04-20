'use strict';

const _ = require('lodash');

module.exports = {
  traverseObject
};

/**
 *
 * @param object
 * @param callback
 * @param options
 */
function traverseObject(object, callback, options) {
  options = options || {};
  const keys = Object.keys(object);
  const stopCondition = options.stopCondition || (() => false);

  if (stopCondition(undefined, object)) {
    return callback(undefined, object);
  }

  for (let key of keys) {
    const value = _.get(object, key);
    const stop = stopCondition(key, value);

    if (_.isObject(value) && !stop) {
      keys.push.apply(keys, Object.keys(value).map(item => `${key}.${item}`));
    } else {
      const result = callback(key, value);
      if (result) {
        keys.push.apply(keys, result.map(item => `${key}.${item}`));
      }
    }
  }
}