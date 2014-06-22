'use strict';
var type = require('type')

module.exports = function(instance, schema, ctx){
  var anyOf = schema.anyOf

  if (!('array' == type(anyOf))) return;

  var subctx = ctx.subcontext([],['anyOf']).any()
    , self = this

  subctx.assert(
    anyOf.some( function(subsch,i){
      return self.validate( instance, subsch, subctx.subcontext([],[i]) );
    }),
    'not any conditions valid'
  )
}

