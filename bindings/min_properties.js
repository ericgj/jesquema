'use strict';

module.exports = function(instance, schema, ctx){
  var min = schema.minProperties
    , keys = Object.keys(instance)

  if (undefined == min) return;
  ctx.assert(keys.length >= min, 
             "too few properties"
            ).actual(keys.length)
}


