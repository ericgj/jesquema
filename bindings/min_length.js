'use strict';
var type = require('type')

module.exports = function(instance, schema, ctx){
  if (!("string" == type(instance))) return;
  var min = schema.minLength
  if (!("number" == type(min))) return;

  ctx.assert(instance.length >= min, 
             "is less than the minimum length"
            ).property('minLength')
             .expected(">="+min)
             .actual(instance.length);
}

