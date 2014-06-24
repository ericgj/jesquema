'use strict';
var type = require('type')

module.exports = function(instance, schema, ctx){
  if (!("number" == type(instance))) return;
  var min = schema.minimum
    , minExcl = schema.exclusiveMinimum
  if (!("number" == type(min))) return;
  
  if (!!minExcl){
    ctx.assert(instance > min, 
               "not greater than exclusive minimum"
              ).property('minimum')
               .expected('>' + min)
               .actual(instance)
  } else {
    ctx.assert(instance >= min, 
               "less than minimum"
              ).property('minimum')
               .expected('>' + min)
               .actual(instance)
  }
}


