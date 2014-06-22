'use strict';
var type = require('type')

module.exports = function(instance, schema, ctx){
  if (!('object' == type(instance))) return;

  var schprops = schema.properties
    , schpatprops = schema.patternProperties
    , schaddprops = schema.additionalProperties

  if (!('object' == type(schprops)) &&
      !('object' == type(schpatprops))) return;

  var addprops = Object.keys(instance).filter( function(prop){
    return !schprops.any( function(schprop){ 
             return schprop == prop; 
           }) &&
           !schpatprops.any( function(rx){
             var matcher = new RegExp(rx);
             return matcher.text(prop);
           });
  });

  var addtype = type(schaddprops);

  for (var i=0;i<addprops.length;++i){
    if ('boolean' == addtype){
      ctx.assert( schaddprops,
                  'unknown'
                ).property(addprops[i])
    }

    if ('object' == addtype){
      this.validate( instance[addprops[i]], 
                     schaddprops, 
                     ctx.subcontext([addprops[i]],[additionalProperties]) 
                   );
    }
  }

}

