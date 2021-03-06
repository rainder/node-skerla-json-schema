'use strict';

const Rule = require('./lib/rule');
const Schema = require('./lib/schema');

/**
 *
 * @param mixed
 */
module.exports = function (type) {
  return new Rule(type);
};

module.exports.Schema = Schema;