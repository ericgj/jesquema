'use strict';
var type = require('type')

module.exports = function(instance, schema, ctx){
  if (!("string" == type(instance))) return;
  var max = schema.maxLength
  if (!("number" == type(max))) return;

  ctx.assert(instance.length <= max, 
             "is greater than the minimum length"
            ).expected("<="+max)
             .actual(instance.length);
}


