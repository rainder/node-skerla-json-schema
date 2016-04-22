'use strict';

const _ = require('lodash');
const type = require('./type');

module.exports = class Rule {
  constructor(constructor) {
    this.specs = {
      type: type.constructorToString(constructor),
      required: false,
      min: undefined,
      max: undefined,
      typeOf: undefined,
      oneOf: undefined,
      len: undefined,
      null: false,
      match: undefined,
      schema: undefined,
    };
  }

  /**
   *
   * @param value
   */
  _stringCheck(path, value) {
    if (!_.isUndefined(this.specs.min)) {
      if (this.specs.min > value.length) {
        throw { id: 6, path, expected: this.specs.min, actual: value.length };
      }
    }

    if (!_.isUndefined(this.specs.max)) {
      if (this.specs.max < value.length) {
        throw { id: 7, path, expected: this.specs.max, actual: value.length };
      }
    }

    if (!_.isUndefined(this.specs.len)) {
      if (this.specs.len !== value.length) {
        throw { id: 5, path, expected: this.specs.len, actual: value.length };
      }
    }

    if (!_.isUndefined(this.specs.oneOf)) {
      if (!~this.specs.oneOf.indexOf(value)) {
        throw { id: 8, path, expected: this.specs.oneOf, actual: value };
      }
    }

    if (!_.isUndefined(this.specs.match)) {
      if (!this.specs.match.test(value)) {
        throw { id: 8, path, expected: this.specs.match, actual: value };
      }
    }
  }

  /**
   *
   * @param value
   */
  _numberCheck(path, value) {
    if (!_.isUndefined(this.specs.min)) {
      if (this.specs.min > value) {
        throw { id: 9, path, expected: this.specs.min, actual: value };
      }
    }

    if (!_.isUndefined(this.specs.max)) {
      if (this.specs.max < value) {
        throw { id: 10, path, expected: this.specs.max, actual: value };
      }
    }

    if (!_.isUndefined(this.specs.oneOf)) {
      if (!~this.specs.oneOf.indexOf(value)) {
        throw { id: 8, path, expected: this.specs.oneOf, actual: value };
      }
    }
  }

  /**
   *
   * @param value
   * @private
   */
  _objectCheck(path, value) {
    if (!_.isUndefined(this.specs.schema)) {
      const Schema = require('./schema');
      const schema = new Schema(this.specs.schema);
      const result = schema.validate(value);
      if (!result.isValid()) {
        throw result.getErrors();
      }
    }
  }

  /**
   *
   * @param value
   * @private
   */
  _arrayCheck(path, value) {
    if (!_.isUndefined(this.specs.min)) {
      if (this.specs.min > value.length) {
        throw { id: 6, path, expected: this.specs.min, actual: value.length };
      }
    }

    if (!_.isUndefined(this.specs.max)) {
      if (this.specs.max < value.length) {
        throw { id: 7, path, expected: this.specs.max, actual: value.length };
      }
    }

    if (!_.isUndefined(this.specs.len)) {
      if (this.specs.len !== value.length) {
        throw { id: 5, path, expected: this.specs.len, actual: value.length };
      }
    }

    if (!_.isUndefined(this.specs.oneOf)) {
      for (let item of value) {
        if (!~this.specs.oneOf.indexOf(item)) {
          throw { id: 8, path, expected: this.specs.oneOf, actual: value };
        }
      }
    }

    if (!_.isUndefined(this.specs.typeOf)) {
      const expected = type.identify(new this.specs.typeOf());
      for (let item of value) {
        const actual = type.identify(item);
        if (actual !== expected) {
          throw { id: 3, path, expected, actual };
        }
      }
    }

    if (!_.isUndefined(this.specs.schema)) {
      const Schema = require('./schema');
      const schema = new Schema(this.specs.schema);

      if (_.isArray(this.specs.schema)) {
        const result = schema.validate(value);
        if (!result.isValid()) {
          throw result.getErrors();
        }
      }

      if (_.isPlainObject(this.specs.schema)) {
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
    this.specs.required = true;
    return this;
  }

  /**
   *
   * @param length
   * @returns {Rule}
   */
  min(length) {
    this.specs.min = length;
    return this;
  }

  /**
   *
   * @param length
   * @returns {Rule}
   */
  max(length) {
    this.specs.max = length;
    return this;
  }

  /**
   *
   * @param array {Array}
   * @returns {Rule}
   */
  oneOf(array) {
    this.specs.oneOf = array;
    return this;
  }

  /**
   *
   * @param type
   * @returns {Rule}
   */
  typeOf(type) {
    this.specs.typeOf = type;
    return this;
  }

  /**
   *
   * @param schema {Object}
   * @returns {Rule}
   */
  schema(schema) {
    this.specs.schema = schema;
    return this;
  }

  /**
   *
   * @param regexp {RegExp}
   * @returns {Rule}
   */
  match(regexp) {
    this.specs.match = regexp;
    return this;
  }

  /**
   *
   * @returns {Rule}
   */
  null() {
    this.specs.null = true;
    return this;
  }

  /**
   *
   * @param value
   * @returns {Rule}
   */
  len(value) {
    this.specs.len = value;
    return this;
  }

  /**
   *
   * @param value
   * @param path
   * @returns {boolean}
   */
  check(value, path) {
    if (!this.specs.required && value === undefined) {
      return true;
    }

    if (this.specs.null && value === null) {
      return true;
    }

    if (this.specs.required && value === undefined) {
      throw { id: 1, path };
    }

    if (this.specs.type !== type.identify(value)) {
      if (this.specs.null) {
        throw { id: 4, path, expected: this.specs.type, actual: type.identify(value) };
      } else {
        throw { id: 2, path, expected: this.specs.type, actual: type.identify(value) };
      }
    }

    if (this.specs.type === type.TYPE_STRING) {
      this._stringCheck(path, value);
    }

    if (this.specs.type === type.TYPE_NUMBER) {
      this._numberCheck(path, value);
    }

    if (this.specs.type === type.TYPE_OBJECT) {
      this._objectCheck(path, value);
    }

    if (this.specs.type === type.TYPE_ARRAY) {
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
      type: this.specs.type,
      required: this.specs.required,
      min: this.specs.min,
      max: this.specs.max,
      typeOf: this.specs.typeOf,
      oneOf: this.specs.oneOf,
      len: this.specs.len,
      null: this.specs.null,
      match: this.specs.match
    };
  }
};