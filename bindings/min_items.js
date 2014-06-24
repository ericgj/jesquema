'use strict';
var type = require('type')

module.exports = function(instance, schema, ctx){
  if (!("array" == type(instance))) return;
  var min = schema.minItems
  if (!("number" == type(min))) return;

  ctx.assert(instance.length >= min, 
             "is less than the minimum number of items"
            ).property('minItems')
             .expected(">="+min)
             .actual(instance.length);
}

