'use strict';

var assert = require('assert')
  , validate = require('jesquema')
  , has = hasOwnProperty

///////////////////////////////////

describe('basic test', function(){

  it('should validate object type', function(){
    var schema = { type: 'object' }
      , valid = {}
      , invalid = 0

    var v = validate('4').schema(schema)
    v(valid, function(err,ctx){
      console.log('object type valid assertions: %o', ctx.assertions());
      assert(err == null);
    })

    v(invalid, function(err,ctx){
      console.log('object type invalid assertions: %o', ctx.assertions());
      assert(err);
      assert.equal( err.message, 'type not valid' );
    })

  })

  it('should validate properties', function(){
    var schema = { properties: { foo: { type: 'object' } } }
      , valid = { foo: {} }
      , invalid = { foo: 0 }
      , empty = {}

    var v = validate('4').schema(schema)
    v(valid, function(err,ctx){
      console.log('properties valid assertions: %o', ctx.assertions());
      assert(err == null);
    })

    v(invalid, function(err,ctx){
      console.log('properties invalid assertions: %o', ctx.assertions());
      assert(err);
      assert.equal( err.message, 'foo :: type not valid' );
    })

    v(empty, function(err,ctx){
      console.log('properties empty assertions: %o', ctx.assertions());
      assert(err == null);
    })
  })

  it('should validate anyOf', function(){
    var schema = { anyOf: [ { required: ["a"] }, { required: ["b"] }, { required: ["c"] } ] }
      , valid = { c: 1, b: 2 }
      , invalid = { d: 3 }

    var v = validate('4').schema(schema)
    v(valid, function(err,ctx){
      console.log('anyOf valid assertions: %o', ctx.assertions());
      assert(err == null);
    })
    
    v(invalid, function(err,ctx){
      console.log('anyOf invalid assertions: %o', ctx.assertions());
      assert(err);
      assert(err.message, 'not any conditions valid');
    })
  })

  it('should validate oneOf', function(){
    var schema = { oneOf: [ { required: ["a","b"] }, { required: ["b","c"] }, { required: ["c","a"] } ] }
      , valid = { c: 1, b: 2 }
      , invalidTooFew = { d: 3, a: 4 }
      , invalidTooMany = { a: 1, b: 2, c: 3 }

    var v = validate('4').schema(schema)
    v(valid, function(err,ctx){
      console.log('oneOf valid assertions: %o', ctx.assertions());
      assert(err == null);
    })
    
    v(invalidTooFew, function(err,ctx){
      console.log('oneOf invalid (too few) assertions: %o', ctx.assertions());
      assert(err);
      assert(err.message, 'no conditions valid');
    })

    v(invalidTooMany, function(err,ctx){
      console.log('oneOf invalid (too many) assertions: %o', ctx.assertions());
      assert(err);
      assert(err.message, 'more than one condition valid');
    })
  })

  it('should validate not', function(){
    var schema = { not: { type: 'object' } }
      , valid = 0
      , invalid = {}

    var v = validate('4').schema(schema)
    v(valid, function(err,ctx){
      console.log('not valid assertions: %o', ctx.assertions());
      assert(err == null);
    })
    
    v(invalid, function(err,ctx){
      console.log('not invalid assertions: %o', ctx.assertions());
      assert(err);
      assert(err.message, 'not invalid');
    })
  })

  it('should validate not anyOf', function(){
    var schema = { not: { anyOf: [ { type: 'object' }, { type: 'number' } ] } }
      , valid = 'yes'
      , invalid = {}

    var v = validate('4').schema(schema)
    v(valid, function(err,ctx){
      console.log('not anyOf valid assertions: %o', ctx.assertions());
      assert(err == null);
    })
    
    v(invalid, function(err,ctx){
      console.log('not anyOf invalid assertions: %o', ctx.assertions());
      assert(err);
      assert(err.message, 'not invalid');
    })
  })

  it('should validate enum', function(){
    var schema = { enum: ["a", ["b", 2], { c: 3, d: 4 }] }
      , valid = { d: 4, c: 3 }
      , invalid = "b"

    var v = validate('4').schema(schema)
    v(valid, function(err,ctx){
      console.log('enum valid assertions: %o', ctx.assertions());
      assert(err == null);
    })
    
    v(invalid, function(err,ctx){
      console.log('enum invalid assertions: %o', ctx.assertions());
      assert(err);
      assert(err.message, 'not enumerated');
    })
  })

  it('should validate email format', function(){
    var schema = { properties: { email: { format: 'email' } } }
      , valid = { email: "a@b.com" }
      , invalid = { email: "foo@bar" }

    var v = validate().schema(schema)
    v(valid, function(err,ctx){
      console.log('format email valid assertions: %o', ctx.assertions());
      assert(err == null);
    })
    
    v(invalid, function(err,ctx){
      console.log('format email invalid assertions: %o', ctx.assertions());
      assert(err);
      assert(err.message, 'not enumerated');
    })
  })
  
  it('should disable format validation if specified', function(){
    var schema = { format: 'uri' }
      , instance = '--invalid--'

    var v = validate('4').schema(schema).disableFormats()
    v(instance, function(err,ctx){
      console.log('disable format validation assertions: %o', ctx.assertions());
      assert(err == null);
    })

  })
   
})


describe('context.validSchema tests', function(){

  it('for simple schemas', function(){
    var schema = { "type": "object" }
      , valid = {}
      , invalid = 3
    var v = validate('4').schema(schema)
    v(valid, function(err,ctx){
      var actual = ctx.validSchema();
      console.log('validSchema, simple schema, valid: %o', actual);
      assert(err == null);
      assert(actual.length == 1);
      assert(actual[0] === schema);
    });

    v(invalid, function(err,ctx){
      var actual = ctx.validSchema();
      console.log('validSchema, simple schema, invalid: %o', actual);
      assert(err != null);
      assert(actual.length == 0);
    });
 
  })
  
  it('for allOf schemas', function(){
    var schema = { "type": "object", "allOf": [ { "required": ["a","b"] }, { "required": ["c"] } ] }
      , valid = {"a": 1, "b": 2, "c": 3, "d": 4}
      , invalid = {"a": 1, "c": 2, "d": 3}
    var v = validate('4').schema(schema)
    v(valid, function(err,ctx){
      var actual = ctx.validSchema();
      console.log('validSchema, allOf schema, valid: %o', actual);
      assert(err == null);
      assert(actual.length == 3);
      assert(actual[0] === schema);
      assert(actual[1] === schema.allOf[0]);
      assert(actual[2] === schema.allOf[1]);
    });

    v(invalid, function(err,ctx){
      var actual = ctx.validSchema();
      console.log('validSchema, allOf schema, invalid: %o', actual);
      assert(err != null);
      assert(actual.length == 0);
    });
  })

  it('for anyOf schemas', function(){
    var schema = { "type": "object", "anyOf": [ { "required": ["a","b"] }, { "required": ["c"] } ] }
      , valid = {"a": 1, "b": 2, "d": 4}
      , invalid = {"a": 1, "d": 3}
    var v = validate('4').schema(schema)
    v(valid, function(err,ctx){
      var actual = ctx.validSchema();
      console.log('validSchema, anyOf schema, valid: %o', actual);
      assert(err == null);
      assert(actual.length == 2);
      assert(actual[0] === schema);
      assert(actual[1] === schema.anyOf[0]);
    });

    v(invalid, function(err,ctx){
      var actual = ctx.validSchema();
      console.log('validSchema, anyOf schema, invalid: %o', actual);
      assert(err != null);
      assert(actual.length == 0);
    });
  })

  it('for oneOf schemas', function(){
    var schema = { "type": "object", "oneOf": [ { "required": ["a","b"] }, { "required": ["c"] } ] }
      , valid = {"c": 1, "d": 2, "b": 4}
      , invalid = {"a": 1, "b": 2, "c": 3, "d": 4}
    var v = validate('4').schema(schema)
    v(valid, function(err,ctx){
      var actual = ctx.validSchema();
      console.log('validSchema, oneOf schema, valid: %o', actual);
      assert(err == null);
      assert(actual.length == 2);
      assert(actual[0] === schema);
      assert(actual[1] === schema.oneOf[1]);
    });

    v(invalid, function(err,ctx){
      var actual = ctx.validSchema();
      console.log('validSchema, oneOf schema, invalid: %o', actual);
      assert(err != null);
      assert(actual.length == 0);
    });
  })

  it('for not schemas', function(){
    var schema = { "type": "object", "not": { "properties": { "a": { "type": "number" } } } }
      , valid = {"a": null, "d": 2, "b": 4}
      , invalid = {"a": 1, "b": 2, "c": 3, "d": 4}
    var v = validate('4').schema(schema)
    v(valid, function(err,ctx){
      var actual = ctx.validSchema();
      console.log('validSchema, not schema, valid: %o', actual);
      assert(err == null);
      assert(actual.length == 1);
      assert(actual[0] === schema);
    });

    v(invalid, function(err,ctx){
      var actual = ctx.validSchema();
      console.log('validSchema, not schema, invalid: %o', actual);
      assert(err != null);
      assert(actual.length == 0);
    });
  })
 
  it('for nested schemas', function(){
    var schema = { 
      "type": "object", 
      "oneOf": [
        {
          "allOf": [
            {
              "anyOf": [
                { "required": ["a"] },
                { "required": ["b"] }
              ],
            },
            {
              "properties": {
                "a": {
                  "enum": [null,1]
                },
                "b": {
                  "enum": [null,2]
                }
              }
            }
          ]
        },
        {
          "required": ["c","d"],
          "properties": {
            "c": { "type": "string" },
            "d": { "type": ["null", "string"] }
          }
        }
      ]
    };
    var valid1 = {"a": null}
      , valid2 = {"c": "hello", "d": null }
      , invalid1 = {"b": 3, "a": null }
      , invalid2 = {"a": 1, "b": 2, "c": "eric", "d": null}
    var v = validate('4').schema(schema)

    v(valid1, function(err,ctx){
      var actual = ctx.validSchema();
      console.log('validSchema, nested schema, valid 1: %o', actual);
      assert(err == null);
      assert(actual.length == 5);
      assert(actual[0] === schema);
      assert(actual[1] === schema.oneOf[0]);
      assert(actual[2] === schema.oneOf[0].allOf[0]);
      assert(actual[3] === schema.oneOf[0].allOf[0].anyOf[0]);
      assert(actual[4] === schema.oneOf[0].allOf[1]);
    });

    v(valid2, function(err,ctx){
      var actual = ctx.validSchema();
      console.log('validSchema, nested schema, valid 2: %o', actual);
      assert(err == null);
      assert(actual.length == 2);
      assert(actual[0] === schema);
      assert(actual[1] === schema.oneOf[1]);
    });

    v(invalid1, function(err,ctx){
      var actual = ctx.validSchema();
      console.log('validSchema, nested schema, invalid 1: %o', actual);
      assert(err != null);
      assert(actual.length == 0);
    });

    v(invalid2, function(err,ctx){
      var actual = ctx.validSchema();
      console.log('validSchema, nested schema, invalid 2: %o', actual);
      assert(err != null);
      assert(actual.length == 0);
    });
  })
})


describe('validate.use', function(){

  it('should bind method to context instance, not prototype', function(){
    var noop = function(){  };
    var v1 = validate('4').schema({});
    var v2 = validate('4').use('test',noop).schema({});
    var actual1 = v1.results('hello');
    var actual2 = v2.results('hello');
    assert( !has.call(actual1,'test') );
    assert( has.call(actual2,'test') );
  })

  it('should bind methods to subcontexts', function(){
    var noop = function(){ };
    function evalctx(fn){ 
      return function(ctx){
        return fn(ctx) && ctx.contexts.every(evalctx(fn));
      }
    }

    var schema = { 'properties': { 'a': {} } };
    var v = validate('4').use('test',noop).use('test2',noop).schema(schema);
    var actual = v.results({a: 'hello'});
    console.log('validate.use, bind methods to subcontexts: %o', actual);
    assert( evalctx(function(ctx){ return has.call(ctx,'test'); })(actual) );
    assert( evalctx(function(ctx){ return has.call(ctx,'test2'); })(actual) );
  })

  it('built-in v4 links method should execute', function(){
    var schema = {
      'links': [
        {'rel': 'self'}
      ],
      'anyOf': [
        {
          'properties': {
            'status': { 'enum': ['new'] }
          },
          'links': [
            {'rel': 'create'}
          ]
        },
        {
          'properties': {
            'status': { 'enum': ['draft','in-process'] }
          },
          'links': [
            {'rel': 'cancel'},
            {'rel': 'finalize'}
          ],
        },
        {
          'properties': {
            'status': { 'enum': ['final'] }
          },
          'links': [
            {'rel': 'delete'}
          ]
        },
        { 
          'properties': {
            'status': { 'enum': ['draft','in-process','final'] }
          },
          'links': [
            {'rel': 'update'}
          ]
        }
      ]
    }

    var v = validate('4').schema(schema);
    var finder = function(rel){ return function(link){ return link.rel == rel; } };

    var actual = v.results( { 'status': 'new' } ).links();
    console.log('validate.use, links, status new: %o', actual);
    assert.equal(actual.length,2);
    assert(actual.filter(finder('self')).length == 1);
    assert(actual.filter(finder('create')).length == 1);

    var results = v.results( { 'status': 'draft' } )
    var actual = results.links();
    console.log('validate.use, links, status draft: %o', actual);
    assert.equal(actual.length,4);
    assert(actual.filter(finder('self')).length == 1);
    assert(actual.filter(finder('cancel')).length == 1);
    assert(actual.filter(finder('finalize')).length == 1);
    assert(actual.filter(finder('update')).length == 1);

  })
})
