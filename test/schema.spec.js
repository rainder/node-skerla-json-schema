'use strict';

const chai = require('chai');
const V = require('../');

chai.should();

describe('Schema', function () {
  it('should validate not required', function () {
    const schema = new V.Schema({
      a: V(String)
    });

    schema.validate({ a: 'one' }).isValid().should.equals(true);
    schema.validate({}).isValid().should.equals(true);
  });

  it('should validate required', function () {
    const schema = new V.Schema({
      a: V(String).required()
    });

    schema.validate({ a: 'one' }).isValid().should.equals(true);
    schema.validate({}).isValid().should.equals(false);
  });

  it('should validate null', function () {
    const schema = new V.Schema({
      a: V(Object).null().required()
    });

    schema.validate({ a: null }).isValid().should.equals(true);
    schema.validate({ a: {} }).isValid().should.equals(true);
    schema.validate({ a: 'string' }).isValid().should.equals(false);
    schema.validate({}).isValid().should.equals(false);

    schema.validate({ a: 'string' }).getErrors()[0].message.should.match(/or Null/);
  });

  describe('array schema', function () {
    it('should validate pure array of strings', function () {
      const schema = new V.Schema(V(Array).typeOf(String));

      schema.validate().isValid().should.equals(true);
      schema.validate({}).isValid().should.equals(false);
      schema.validate([]).isValid().should.equals(true);
      schema.validate(['asd', 'asd']).isValid().should.equals(true);
      schema.validate(['asd', 'asd']).isValid().should.equals(true);
      schema.validate([3]).isValid().should.equals(false);
    });
    it('should validate pure array of strings 2', function () {
      const schema = new V.Schema([
        V(String).typeOf(String)
      ]);

      schema.validate([]).isValid().should.equals(true);
      schema.validate(['asd', 'asd']).isValid().should.equals(true);
      schema.validate(['asd', 'asd']).isValid().should.equals(true);
      schema.validate([3]).isValid().should.equals(false);
    });
    it('should validate an array len 2 string,number', function () {
      _with(new V.Schema(V(Array).len(2).schema([
        V(String).required(),
        V(Number).required()
      ])), function (schema) {
        schema.validate([]).isValid().should.equals(false);
        schema.validate(['asd', 1]).isValid().should.equals(true);
        schema.validate(['asd', 'asd']).isValid().should.equals(false);
        schema.validate([3, 3]).isValid().should.equals(false);
      });
    });
    it('should properly format an error', function () {
      _with(new V.Schema(V(Object).schema({
        a: V(String)
      })), function (schema) {
        schema.validate({ a: 4 }).isValid().should.equals(false);
        schema.validate({ a: '1' }).isValid().should.equals(true);
        schema.validate({ a: 4 }).getErrors()[0].path.should.equals('a');
      });
    });
  })
  describe('String', function () {
    it('should validate type', function () {
      const schema = new V.Schema({
        a: V(String)
      });

      schema.validate({ a: 'one' }).isValid().should.equals(true);
      schema.validate({ a: 'two' }).isValid().should.equals(true);
      schema.validate({ a: 1 }).isValid().should.equals(false);
      schema.validate({ a: {} }).isValid().should.equals(false);
    });

    it('should validate min', function () {
      const schema = new V.Schema({
        a: V(String).min(2)
      });

      schema.validate({ a: 'one' }).isValid().should.equals(true);
      schema.validate({ a: 'tw' }).isValid().should.equals(true);
      schema.validate({ a: '1' }).isValid().should.equals(false);
      schema.validate({ a: '' }).isValid().should.equals(false);
    });

    it('should validate max', function () {
      const schema = new V.Schema({
        a: V(String).max(2)
      });

      schema.validate({ a: 'one' }).isValid().should.equals(false);
      schema.validate({ a: 'tw' }).isValid().should.equals(true);
      schema.validate({ a: '1' }).isValid().should.equals(true);
      schema.validate({ a: '' }).isValid().should.equals(true);
    });

    it('should validate oneOf', function () {
      const schema = new V.Schema({
        a: V(String).oneOf(['one', 'two'])
      });

      schema.validate({ a: 'one' }).isValid().should.equals(true);
      schema.validate({ a: 'two' }).isValid().should.equals(true);
      schema.validate({ a: 'three' }).isValid().should.equals(false);
    });

    it('should validate oneOf with Set', function () {
      const schema = new V.Schema({
        a: V(String).oneOf(new Set(['one', 'two']))
      });

      schema.validate({ a: 'one' }).isValid().should.equals(true);
      schema.validate({ a: 'two' }).isValid().should.equals(true);
      schema.validate({ a: 'three' }).isValid().should.equals(false);
    });

    it('should validate match', function () {
      const schema = new V.Schema({
        a: V(String).match(/^\d+$/)
      });

      schema.validate({ a: '123' }).isValid().should.equals(true);
      schema.validate({ a: '1a3' }).isValid().should.equals(false);
      schema.validate({ a: 'asd' }).isValid().should.equals(false);
    });

    it('should validate len', function () {
      const schema = new V.Schema({
        a: V(String).len(5)
      });

      schema.validate({ a: '12345' }).isValid().should.equals(true);
      schema.validate({ a: '1234' }).isValid().should.equals(false);
      schema.validate({ a: '123456' }).isValid().should.equals(false);
    });
  });
  describe('Number', function () {
    it('should validate number', function () {
      const schema = new V.Schema({
        a: V(Number)
      });

      schema.validate({}).isValid().should.equals(true);
      schema.validate({ a: 5 }).isValid().should.equals(true);
      schema.validate({ a: '' }).isValid().should.equals(false);
    });
    it('should validate min', function () {
      const schema = new V.Schema({
        a: V(Number).min(2)
      });

      schema.validate({ a: 5 }).isValid().should.equals(true);
      schema.validate({ a: 2 }).isValid().should.equals(true);
      schema.validate({ a: 1 }).isValid().should.equals(false);
    });
    it('should validate max', function () {
      const schema = new V.Schema({
        a: V(Number).max(2)
      });

      schema.validate({ a: 1 }).isValid().should.equals(true);
      schema.validate({ a: 2 }).isValid().should.equals(true);
      schema.validate({ a: 5 }).isValid().should.equals(false);
    });
    it('should validate oneOf', function () {
      const schema = new V.Schema({
        a: V(Number).oneOf([1, 2])
      });

      schema.validate({ a: 1 }).isValid().should.equals(true);
      schema.validate({ a: 2 }).isValid().should.equals(true);
      schema.validate({ a: 5 }).isValid().should.equals(false);
    });
  });
  describe('Object', function () {
    it('should validate object', function () {
      const schema = new V.Schema({
        a: V(Object)
      });

      schema.validate({}).isValid().should.equals(true);
      schema.validate({ a: {} }).isValid().should.equals(true);
      schema.validate({ a: '' }).isValid().should.equals(false);
    });
    it('should validate schema', function () {
      const schema = new V.Schema({
        a: V(Object).schema({
          b: V(Number)
        })
      });

      schema.validate({}).isValid().should.equals(true);
      schema.validate({ a: {} }).isValid().should.equals(true);
      schema.validate({ a: { b: 5 } }).isValid().should.equals(true);
      schema.validate({ a: { b: '' } }).isValid().should.equals(false);

      schema.validate({ a: { b: '' } }).getErrors()[0].path.should.equals('a.b');
    });
    it('should validate schema 2', function () {
      const schema = new V.Schema({
        a: V(Object).schema({
          b: V(Object).schema({
            c: V(Number).required()
          })
        })
      });

      schema.validate({}).isValid().should.equals(true);
      schema.validate({ a: {} }).isValid().should.equals(true);
      schema.validate({ a: { b: 5 } }).isValid().should.equals(false);
      schema.validate({ a: { b: '' } }).isValid().should.equals(false);
      schema.validate({ a: { b: {} } }).isValid().should.equals(false);
      schema.validate({ a: { b: { c: '' } } }).getErrors()[0].path.should.equals('a.b.c');
    });
  });
  describe('Array', function () {
    it('should validate an array', function () {
      const schema = new V.Schema({
        a: V(Array)
      });

      schema.validate({}).isValid().should.equals(true);
      schema.validate({ a: [] }).isValid().should.equals(true);
      schema.validate({ a: {} }).isValid().should.equals(false);
    });
    it('should validate min', function () {
      const schema = new V.Schema({
        a: V(Array).min(1)
      });

      schema.validate({ a: [1] }).isValid().should.equals(true);
      schema.validate({ a: [1, 2] }).isValid().should.equals(true);
      schema.validate({ a: [] }).isValid().should.equals(false);
    });
    it('should validate max', function () {
      const schema = new V.Schema({
        a: V(Array).max(2)
      });

      schema.validate({ a: [] }).isValid().should.equals(true);
      schema.validate({ a: [1] }).isValid().should.equals(true);
      schema.validate({ a: [1, 2] }).isValid().should.equals(true);
      schema.validate({ a: [1, 2, 3] }).isValid().should.equals(false);
    });
    it('should validate oneOf', function () {
      const schema = new V.Schema({
        a: V(Array).oneOf([1, 2])
      });

      schema.validate({ a: [] }).isValid().should.equals(true);
      schema.validate({ a: [1] }).isValid().should.equals(true);
      schema.validate({ a: [1, 2] }).isValid().should.equals(true);
      schema.validate({ a: [1, 2, 3] }).isValid().should.equals(false);
      schema.validate({ a: [3] }).isValid().should.equals(false);
    });
    it('should validate typeOf', function () {
      const schema = new V.Schema({
        a: V(Array).typeOf(String)
      });

      schema.validate({ a: [] }).isValid().should.equals(true);
      schema.validate({ a: ['a'] }).isValid().should.equals(true);
      schema.validate({ a: ['a', 'b'] }).isValid().should.equals(true);
      schema.validate({ a: ['a', 'b', 4] }).isValid().should.equals(false);
    });
    it('should validate schema', function () {
      const schema = new V.Schema({
        a: V(Array).schema({
          b: V(String).required()
        })
      });

      schema.validate({}).isValid().should.equals(true);
      schema.validate({ a: [] }).isValid().should.equals(true);
      schema.validate({ a: [{ b: 'asd' }] }).isValid().should.equals(true);
      schema.validate({ a: ['a'] }).isValid().should.equals(false);
      schema.validate({ a: [{}] }).isValid().should.equals(false);
      schema.validate({ a: [{ b: '123' }, { b: '234' }] }).isValid().should.equals(true);
      schema.validate({ a: [{ b: '123' }, { b: '234' }, {}] }).isValid().should.equals(false);
    });
    it('should validate len', function () {
      const schema = new V.Schema({
        a: V(Array).len(3)
      });

      schema.validate({ a: [1, 2] }).isValid().should.equals(false);
      schema.validate({ a: [1, 2, 3] }).isValid().should.equals(true);
      schema.validate({ a: [1, 2, 3, 4] }).isValid().should.equals(false);
    });
    it('should validate an array contents', function () {
      _with(new V.Schema({
        a: [V(Number)]
      }), function (schema) {
        schema.validate({ a: [1] }).isValid().should.equals(true);
        schema.validate({ a: [] }).isValid().should.equals(true);
        schema.validate({ a: [[1, 4, 'a']] }).isValid().should.equals(false);
      });

      _with(new V.Schema({
        a: [V(Number).required()]
      }), function (schema) {
        schema.validate({ a: [] }).isValid().should.equals(false);
      });

      _with(new V.Schema({
        a: [V(String).required(), V(Number), V(Number)]
      }), function (schema) {
        schema.validate({ a: [] }).isValid().should.equals(false);
        schema.validate({ a: [''] }).isValid().should.equals(true);
        schema.validate({ a: ['', ''] }).isValid().should.equals(false);
        schema.validate({ a: ['', 1] }).isValid().should.equals(true);
        schema.validate({ a: ['', 1, ''] }).isValid().should.equals(false);
        schema.validate({ a: ['', 1, 2] }).isValid().should.equals(true);
        schema.validate({ a: ['', 1, 2, 3] }).isValid().should.equals(true);
      });
    });
  });
  describe('cleanup', function () {
    it('should remove unwanted keys', function () {
      const schema = new V.Schema({
        a: V(String)
      }, { strict: true });

      schema.validate({
        a: 'asd',
        b: '23'
      }).cleanup().should.deep.equals({
        a: 'asd'
      });
    });

    it('should remove unwanted child keys', function () {
      const schema = new V.Schema({
        o: {
          a: V(String)
        }
      }, { strict: true });

      schema.validate({
        o: {
          a: 'asd',
          b: '23'
        }
      }).cleanup().should.deep.equals({
        o: {
          a: 'asd'
        }
      });
    });

    it('should remove unwanted childx2 keys', function () {
      const schema = new V.Schema({
        o: {
          o: {
            a: V(String)
          }
        }
      }, { strict: true });

      schema.validate({
        o: {
          o: {
            a: 'asd',
            b: '23'
          }
        }
      }).cleanup().should.deep.equals({
        o: {
          o: {
            a: 'asd'
          }
        }
      });
    });

    it('should remove unwanted childx2 keys in sub-schema definitions', function () {
      const schema = new V.Schema({
        o: V(Object).schema({
          a: V(String)
        })
      }, { strict: true });

      schema.validate({
        o: {
          a: 'asd',
          b: '23'
        }
      }).cleanup().should.deep.equals({
        o: { a: 'asd' }
      });
    });

    it('should remove unwanted childx2 keys in sub-schemax2 definitions', function () {
      const schema = new V.Schema({
        o: V(Object).schema({
          o: {
            o: V(Object).schema({
              o: {
                a: V(String)
              }
            })
          }
        })
      }, { strict: true });

      schema.validate({
        o: {
          o: {
            o: {
              o: {
                a: 'asd',
                b: '23'
              }
            }
          }
        }
      }).cleanup().should.deep.equals({
        o: {
          o: {
            o: {
              o: {
                a: 'asd'
              }
            }
          }
        }
      });
    });

    it('should remove unwanted child elements in an array', function () {
      const schema = new V.Schema({
        items: V(Array).schema({
          name: V(String)
        })
      });

      const validationResult = schema.validate({
        items: [{ name: 'asd', surname: 'asd' }]
      });

      const result = validationResult.cleanup();

      result.should.deep.equals({
        items: [{
          name: 'asd'
        }]
      });
    });

    it('should remove unwanted child elements in an array 2', function () {
      const schema = new V.Schema({
        items: [{
          name: V(String)
        }]
      });

      const validationResult = schema.validate({
        items: [{ name: 'asd', surname: 'asd' }]
      });

      const result = validationResult.cleanup();

      result.should.deep.equals({
        items: [{
          name: 'asd'
        }]
      });
    });

    it('should remove unwanted child elements in an array 3', function () {
      const schema = new V.Schema({
        items: [{ name: V(String) }]
      });

      const validationResult = schema.validate({
        items: []
      });

      const result = validationResult.cleanup();

      result.should.deep.equals({
        items: []
      });
    });

    it('should remove unwanted child elements in an array 4', function () {
      const schema = new V.Schema({
        items: [{ name: V(String) }]
      });

      const validationResult = schema.validate({});

      const result = validationResult.cleanup();

      result.should.deep.equals({
        items: []
      });
    });

    it('should remove unwanted child elements in an array 5', function () {
      const schema = new V.Schema({
        items: V(Array).schema({ name: V(String) })
      });

      const validationResult = schema.validate({
        items: null
      });

      const result = validationResult.cleanup();

      result.should.deep.equals({
        items: []
      });
    });

    it('should remove unwanted child elements in an object 1', function () {
      const schema = new V.Schema({
        o: V(Object),
        o2: {
          a: V(String)
        }
      });

      const result = schema.validate({ d: 4 }).cleanup();

      result.should.deep.equals({});
    });

    it('should cleanup array if passed as a first argument', function () {
      _with(new V.Schema([
        V(Number)
      ]), schema => {
        schema.validate([4]).cleanup().should.deep.equals([4]);
        schema.validate([4, 4]).cleanup().should.deep.equals([4]);
      });

      _with(new V.Schema([
        V(Number),
        V(String)
      ]), schema => {
        schema.validate([4, 'asd', 'cxc']).cleanup().should.deep.equals([4, 'asd']);
      });
    });
  });
  describe('getSpecs', function () {
    it('should return specs for a schema 1', function () {
      const validation = new V.Schema({
        a: V(String).required()
      });

      jsonify(validation.getSpecs()).should.deep.equals({
        type: 'Object',
        required: false,
        null: false,
        child: {
          a: {
            required: true,
            null: false,
            type: 'String'
          }
        }
      });
    });
    it('should return specs for a schema 2', function () {
      const validation = new V.Schema({
        o: V(Object).schema({
          o2: V(Object)
        })
      });

      jsonify(validation.getSpecs()).should.deep.equals({
        type: 'Object',
        null: false,
        required: false,
        child: {
          o: {
            required: false,
            null: false,
            type: 'Object',
            child: {
              o2: {
                required: false,
                null: false,
                type: 'Object'
              }
            }
          }
        }
      });
    });
    it('should return specs for a schema 3', function () {
      const validation = new V.Schema({
        o: {
          o2: V(Object).schema({
            o3: V(Object)
          })
        }
      });

      jsonify(validation.getSpecs()).should.deep.equals({
        type: 'Object',
        null: false,
        required: false,
        child: {
          o: {
            required: false,
            null: false,
            type: 'Object',
            child: {
              o2: {
                required: false,
                null: false,
                type: 'Object',
                child: {
                  o3: {
                    required: false,
                    null: false,
                    type: 'Object'
                  }
                }
              }
            }
          }

        }
      });
    });
    it('should return specs for a schema 4', function () {
      const validation = new V.Schema({
        o: {
          a: V(Array).required().null().schema({
            name: V(String).min(2)
          })
        }
      });

      jsonify(validation.getSpecs()).should.deep.equals({
        type: 'Object',
        null: false,
        required: false,
        child: {
          o: {
            required: false,
            null: false,
            type: 'Object',
            child: {
              a: {
                type: 'Array',
                required: true,
                null: true,
                child: {
                  name: {
                    type: 'String',
                    required: false,
                    null: false,
                    min: 2
                  }
                }
              }
            }
          }
        }
      });
    });
    it('should return specs for a schema 5', function () {
      const validation = new V.Schema([
        V(Number),
        V(String)
      ]);

      jsonify(validation.getSpecs()).should.deep.equals({
        type: 'Array',
        required: false,
        null: false,
        child: [
          {
            'null': false,
            'required': false,
            'type': 'Number'
          },
          {
            'null': false,
            'required': false,
            'type': 'String'
          }
        ]
      });
    });
    it('should return specs for a schema 6', function () {
      const validation = new V.Schema(V(Array).required().schema({
        a: V(String)
      }));

      jsonify(validation.getSpecs()).should.deep.equals({
        null: false,
        required: true,
        type: 'Array',
        child: {
          a: {
            type: 'String',
            required: false,
            null: false
          }
        }
      });
    });

  })
});

function _with(obj, fn) {
  fn(obj);
}

function jsonify(object) {
  return JSON.parse(JSON.stringify(object));
}
