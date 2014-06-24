'use strict';
var type = require('type')

module.exports = function(instance, schema, ctx){
  if (!("string" == type(instance))) return;
  var pattern = schema.pattern;
  if (!("string" == type(pattern))) return;
  var pat = new RegExp(pattern);
  ctx.assert(pat.test(instance), 
             "did not match pattern"
            ).property('pattern')
             .expected(pattern)
             .actual(instance);
}
