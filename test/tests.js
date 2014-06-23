'use strict';

var assert = require('assert')
  , validate = require('json-v')

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

})
