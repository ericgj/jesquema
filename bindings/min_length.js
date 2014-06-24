'use strict';
var type = require('type')
var ulength = require('../ulength')

module.exports = function(instance, schema, ctx){
  if (!("string" == type(instance))) return;
  var min = schema.minLength
  if (!("number" == type(min))) return;

  var len = instance.length;
  if (instance.normalize){   // if ES6-compatible string 
    instance = instance.normalize();
    len = ulength(instance);
  }

  ctx.assert(len >= min, 
             "is less than the minimum length"
            ).property('minLength')
             .expected(">="+min)
             .actual(len);
}

