'use strict';
var type = require('type')

module.exports = function(instance, schema, ctx){
  var reqs = schema.required

  if (!('array' == type(reqs))) return;

  for (var i=0;i<reqs.length;++i){
    ctx.assert(!(undefined === instance[reqs[i]]), 
               "missing required property"
              ).property('required')
               .expected(reqs[i])
               .actual(instance[reqs[i]]);
  }
}
