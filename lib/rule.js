'use strict';

const _ = require('lodash');
const type = require('./type');

module.exports = class Rule {
  constructor(constructor) {
    this._specs = {
      type: type.constructorToString(constructor),
      required: false,
      min: undefined,
      max: undefined,
      typeOf: undefined,
      oneOf: undefined,
      len: undefined,
      null: false,
      match: undefined,
      schema: undefined
    };
  }

  /**
   *
   * @param path
   * @param value
   * @private
   */
  _stringCheck(path, value) {
    if (!_.isUndefined(this._specs.min)) {
      if (this._specs.min > value.length) {
        throw { id: 6, path, expected: this._specs.min, actual: value.length };
      }
    }

    if (!_.isUndefined(this._specs.max)) {
      if (this._specs.max < value.length) {
        throw { id: 7, path, expected: this._specs.max, actual: value.length };
      }
    }

    if (!_.isUndefined(this._specs.len)) {
      if (this._specs.len !== value.length) {
        throw { id: 5, path, expected: this._specs.len, actual: value.length };
      }
    }

    if (!_.isUndefined(this._specs.oneOf)) {
      if (!~this._specs.oneOf.indexOf(value)) {
        throw { id: 8, path, expected: this._specs.oneOf, actual: value };
      }
    }

    if (!_.isUndefined(this._specs.match)) {
      if (!this._specs.match.test(value)) {
        throw { id: 8, path, expected: this._specs.match, actual: value };
      }
    }
  }

  /**
   *
   * @param path
   * @param value
   * @private
   */
  _numberCheck(path, value) {
    if (!_.isUndefined(this._specs.min)) {
      if (this._specs.min > value) {
        throw { id: 9, path, expected: this._specs.min, actual: value };
      }
    }

    if (!_.isUndefined(this._specs.max)) {
      if (this._specs.max < value) {
        throw { id: 10, path, expected: this._specs.max, actual: value };
      }
    }

    if (!_.isUndefined(this._specs.oneOf)) {
      if (!~this._specs.oneOf.indexOf(value)) {
        throw { id: 8, path, expected: this._specs.oneOf, actual: value };
      }
    }
  }

  /**
   *
   * @param path
   * @param value
   * @private
   */
  _objectCheck(path, value) {
    if (!_.isUndefined(this._specs.schema)) {
      const Schema = require('./schema');
      const schema = new Schema(this._specs.schema);
      const result = schema.validate(value);
      if (!result.isValid()) {
        throw result.getErrors();
      }
    }
  }

  /**
   *
   * @param path
   * @param value
   * @private
   */
  _arrayCheck(path, value) {
    if (!_.isUndefined(this._specs.min)) {
      if (this._specs.min > value.length) {
        throw { id: 6, path, expected: this._specs.min, actual: value.length };
      }
    }

    if (!_.isUndefined(this._specs.max)) {
      if (this._specs.max < value.length) {
        throw { id: 7, path, expected: this._specs.max, actual: value.length };
      }
    }

    if (!_.isUndefined(this._specs.len)) {
      if (this._specs.len !== value.length) {
        throw { id: 5, path, expected: this._specs.len, actual: value.length };
      }
    }

    if (!_.isUndefined(this._specs.oneOf)) {
      for (let item of value) {
        if (!~this._specs.oneOf.indexOf(item)) {
          throw { id: 8, path, expected: this._specs.oneOf, actual: value };
        }
      }
    }

    if (!_.isUndefined(this._specs.typeOf)) {
      const expected = type.identify(new this._specs.typeOf());
      for (let item of value) {
        const actual = type.identify(item);
        if (actual !== expected) {
          throw { id: 3, path, expected, actual };
        }
      }
    }

    if (!_.isUndefined(this._specs.schema)) {
      const Schema = require('./schema');
      const schema = new Schema(this._specs.schema);

      if (_.isArray(this._specs.schema)) {
        const result = schema.validate(value);
        if (!result.isValid()) {
          throw result.getErrors();
        }
      }

      if (_.isPlainObject(this._specs.schema)) {
        for (let item of value) {
          const result = schema.validate(item);
          if (!result.isValid()) {
            throw result.getErrors();
          }
        }
      }
    }
  }

  /**
   *
   * @returns {Rule}
   */
  required() {
    this._specs.required = true;
    return this;
  }

  /**
   *
   * @param length
   * @returns {Rule}
   */
  min(length) {
    this._specs.min = length;
    return this;
  }

  /**
   *
   * @param length
   * @returns {Rule}
   */
  max(length) {
    this._specs.max = length;
    return this;
  }

  /**
   *
   * @param array {Array}
   * @returns {Rule}
   */
  oneOf(array) {
    this._specs.oneOf = array;
    return this;
  }

  /**
   *
   * @param type
   * @returns {Rule}
   */
  typeOf(type) {
    this._specs.typeOf = type;
    return this;
  }

  /**
   *
   * @param schema {Object}
   * @returns {Rule}
   */
  schema(schema) {
    this._specs.schema = schema;
    return this;
  }

  /**
   *
   * @param regexp {RegExp}
   * @returns {Rule}
   */
  match(regexp) {
    this._specs.match = regexp;
    return this;
  }

  /**
   *
   * @returns {Rule}
   */
  null() {
    this._specs.null = true;
    return this;
  }

  /**
   *
   * @param value
   * @returns {Rule}
   */
  len(value) {
    this._specs.len = value;
    return this;
  }

  /**
   *
   * @param value
   * @param path
   * @returns {boolean}
   */
  check(value, path) {
    if (!this._specs.required && value === undefined) {
      return true;
    }

    if (this._specs.null && value === null) {
      return true;
    }

    if (this._specs.required && value === undefined) {
      throw { id: 1, path };
    }

    if (this._specs.type !== type.identify(value)) {
      if (this._specs.null) {
        throw { id: 4, path, expected: this._specs.type, actual: type.identify(value) };
      } else {
        throw { id: 2, path, expected: this._specs.type, actual: type.identify(value) };
      }
    }

    if (this._specs.type === type.TYPE_STRING) {
      this._stringCheck(path, value);
    }

    if (this._specs.type === type.TYPE_NUMBER) {
      this._numberCheck(path, value);
    }

    if (this._specs.type === type.TYPE_OBJECT) {
      this._objectCheck(path, value);
    }

    if (this._specs.type === type.TYPE_ARRAY) {
      this._arrayCheck(path, value);
    }

    return true;
  }

  /**
   *
   * @returns {{type: *, required: boolean, min: *, max: *, typeOf: *, oneOf: *, len: *, null: boolean, match: *}}
   */
  getSpecs() {
    return {
      type: this._specs.type,
      required: this._specs.required,
      min: this._specs.min,
      max: this._specs.max,
      typeOf: this._specs.typeOf,
      oneOf: this._specs.oneOf,
      len: this._specs.len,
      null: this._specs.null,
      match: this._specs.match
    };
  }
};