'use strict';
var type = require('type')

module.exports = function(instance, schema, ctx){
  if (!("array" == type(instance))) return;
  var max = schema.maxItems
  if (!("number" == type(max))) return;

  ctx.assert(instance.length <= max, 
             "is greater than the maximum number of items"
            ).expected("<="+max)
             .actual(instance.length);
}

