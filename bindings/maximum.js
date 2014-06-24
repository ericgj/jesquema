'use strict';
var type = require('type')

module.exports = function(instance, schema, ctx){
  if (!("number" == type(instance))) return;
  var max = schema.maximum
    , maxExcl = schema.exclusiveMaximum
  if (!("number" == type(max))) return;
  
  if (!!maxExcl){
    ctx.assert(instance < max, 
               "not less than exclusive maximum"
              ).property('maximum')
               .expected('<' + max)
               .actual(instance)
  } else {
    ctx.assert(instance <= max, 
               "greater than maximum"
              ).property('maximum')
               .expected('<=' + max)
               .actual(instance)
  }
}



