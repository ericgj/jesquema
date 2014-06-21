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
      console.log('valid context: %o', ctx.assertions());
      assert(err == null);
    })

    v(invalid, function(err,ctx){
      console.log('invalid context: %o', ctx.assertions());
      assert(!!err);
      assert.equal( err.message, 'invalid :: does not match type' );
    })

  })

})
