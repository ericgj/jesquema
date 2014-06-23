'use strict';
var type = require('type')

module.exports = function(instance, schema, ctx){
  if (!("number" == type(instance))) return;
  var multipleOf = schema.multipleOf
  if (!("number" == type(multipleOf))) return;
  ctx.assert((instance/multipleOf % 1) == 0, 
              "not a multiple of"
            )
}

