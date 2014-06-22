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
      assert.equal( err.message, '/foo :: type not valid' );
    })

    v(empty, function(err,ctx){
      console.log('properties empty assertions: %o', ctx.assertions());
      assert(err == null);
    })
  })

})