'use strict';
var type = require('type')
var deepEqual = require('../deep_equal')

module.exports = function(instance, schema, ctx){
  var e = schema['enum']

  if (!('array' == type(e))) return;

  var found = false;
  for (var i=0;i<e.length;++i){
    if (deepEqual(e[i],instance)){
      found = true; break;
    }
  }

  ctx.assert( found, 'not enumerated' )
       .expected(e)
       .actual(instance);
}
