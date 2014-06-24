'use strict';
var type = require('type');

module.exports = function(instance, schema, ctx){
  if (!('object' == type(instance))) return;
  var max = schema.maxProperties
    , keys = Object.keys(instance)

  if (undefined === max) return;
  ctx.assert(keys.length <= max, 
             "too many properties"
            ).property('maxProperties')
             .expected('<='+max)
             .actual(keys.length)
}


