'use strict';
var type = require('type')

module.exports = function(instance, schema, ctx){
  var anyOf = schema.anyOf

  if (!('array' == type(anyOf))) return;

  var subctx = ctx.subcontext([],['anyOf']).validAny()
    , self = this
    , count = 0

  for (var i=0;i<anyOf.length;++i){
    var subsch = anyOf[i];
    var valid = this.validate( instance, subsch, subctx.subcontext([],[i]) );
    if (valid) count++;
  }

  subctx.assert( 
    count > 0,
    'not any conditions valid'
  ).property('anyOf');
}

