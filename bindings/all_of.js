'use strict';
var type = require('type')

module.exports = function(instance, schema, ctx){
  var allOf = schema.allOf

  if (!('array' == type(allOf))) return;

  var subctx = ctx.subcontext([],['allOf']).validAll()
    , self = this
  
  subctx.assert(
    allOf.every( function(subsch,i){
      return self.validate( instance, subsch, subctx.subcontext([],[i]) );
    }),
    'not all conditions valid'
  )
}

