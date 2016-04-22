# JSON Schema validation v0.2.0

## Installation

```bash
$ npm install skerla-json-schema
```

## Schema

### Constructor
###### `new V.Schema(schema: Object|Array|Rule): Schema`

### Methods
###### `validate(object: Object|Array): ValidationResult`
###### `getSpecs(): Object`

### Usage example

General usecase

```js
const V = require('skerla-json-validation');
const validation = new V.Schema({
  id: V(Number).min(0).required(),
  status: V(String).oneOf(['active', 'inactive']).required(),
  items: V(Array).required().schema({
    name: V(String).required(),
    amount: V(Number).min(0).required(),
    has_photo: V(Boolean).required()
  })
});

const validationResult = validation.validate({
  id: 76335,
  status: 'active',
  items: [{
    name: 'Chair',
    amount: 2,
    has_photo: true
  }]
});

validationResult.isValid(); //true
```

Advanced

```js
const V = require('skerla-json-validation');
const validation = new V.Schema(V(Array).len(2).schema([
  V(String).required(),
  V(Number).required()
]));

validation.validate({}).isValid(); //false
validation.validate([]).isValid(); //false
validation.validate(['banana']).isValid(); //false
validation.validate(['banana', 5]).isValid(); //true
```

## ValidationResult
### Methods
###### `isValid(): Boolean`
Returns if the object has passed validation process

###### `getErrors(): Array{errno: Number, path: string, message: String}` 
Returns validation errors

```js
const V = require('skerla-json-schema');
const validation = new V.Schema({
  id: V(Number),
  name: V(String).min(3),
  surname: V(String).required(),
});

const validationResult = validation.validate({
  id: '123',
  name: 'Al'
});

const isValid = validationResult.isValid(); //false
const errors = validationResult.getErrors(); 
/*
[ 
  { errno: 2, path: 'id', message: 'type of the value must be Number, got String.' },
  { errno: 6, path: 'name', message: 'the length must be >= 3, got 2.' },
  { errno: 1, path: 'surname', message: 'required' } 
]
*/
```

###### `cleanup(): Object`
Removes all properties in a nested object which are not defined in the schema.

```js
const V = require('skerla-json-validation');
const validation = new V.Schema({
  name: V(String),
  surname: V(String),
  address: {
    city: V(String)
  }
});

const validationResult = validation.validate({
  id: 123,
  name: 'Andrius',
  surname: 'Skerla',
  address: {
    country: 'UK',  
    city: 'London',
    street_name: 'Baker Street'
  }
});

const cleanedUp = validationResult.cleanup();
/* returns
{
  name: 'Andrius',
  surname: 'Skerla,
  address: {
    city: 'London'
  }
};
*/
```

## Rule
### Methods
###### `required(): Rule`
Defines if the property can not be undefined

###### `min(value: Number): Rule`
Defines min length of a String or an Array, or min Number value.

###### `max(value: Number): Rule`
Defines max length of a String or an Array, or max Number value.

###### `len(value: Number): Rule`
Defines a length of a String or an Array

###### `match(value: RegExp): Rule`
Defines a pattern of a string

```js
const validation = new V.Schema({
  number: V(String).match(/\d+-\d+/)
});
```

###### `oneOf(values: Array): Rule`
Defines a set of possible values for String, Number and Array.

```js
const validation = new V.Schema({
  type: V(String).oneOf(['request', 'response']),
  directions: V(Array).oneOf(['in', 'out'])
});

validation.validate({
  type: 'request',
  directions: ['in', 'in', 'in', 'out'] 
}).isValid(); //true
```

###### `typeOf(constructor: Function): Rule`
Defines a type of a item in an array

```js
new V.Schema({
  items: V(Array).typeOf(String)
})
```

###### `schema(schema: Object): Rule`
Defines a schema of an array or a nested object

###### `null(): Rule`
Allows a property to have `null` value.

```js
new V.Schema({
  address: V(String).null().required() //property must be defined and be either null either String
})
```

###### `check(path: String, value: mixed): ValidationResult; throws RuleError`
### Usage Example
```js
const Rule = require('skerla-json-schema/lib/rule');
const rule = new Rule(String).oneOf(['hi', 'hello']).required();

rule.check('hi'); //true
rule.check('bonjour'); //throws
```