'use strict';
var type = require('type')
var ulength = require('../ulength')

module.exports = function(instance, schema, ctx){
  if (!("string" == type(instance))) return;
  var max = schema.maxLength
  if (!("number" == type(max))) return;

  var len = instance.length;
  if (instance.normalize){   // if ES6-compatible string 
    instance = instance.normalize();
    len = ulength(instance);
  }

  ctx.assert(len <= max, 
             "is greater than the minimum length"
            ).property('maxLength')
             .expected("<="+max)
             .actual(len);
}


