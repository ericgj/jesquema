'use strict';

module.exports = function(instance, schema, ctx){
  var max = schema.maxProperties
    , keys = Object.keys(instance)

  if (undefined == max) return;
  ctx.assert(keys.length >= max, 
             "too many properties"
            ).property('maxProperties')
             .expected('<'+max)
             .actual(keys.length)
}


