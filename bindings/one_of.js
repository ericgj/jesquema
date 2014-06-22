'use strict';
var type = require('type')

module.exports = function(instance, schema, ctx){
  var oneOf = schema.oneOf

  if (!('array' == type(oneOf))) return;

  var subctx = ctx.subcontext([],['oneOf']).one()
    , self = this
    , count = 0

  for (var i=0;i<oneOf.length;++i){
    var subsch = oneOf[i];
    var valid = this.validate( instance, subsch, subctx.subcontext([],[i]) );
    if (valid) count++;
    // if (count > 1) break;
  }

  subctx.assert( 
    count == 1,
    (count == 0 ? 'no conditions valid' : 'more than one condition valid')
  ).actual(count).expected(1)
}

