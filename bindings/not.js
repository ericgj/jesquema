'use strict';
var type = require('type')

module.exports = function(instance, schema, ctx){
  var not = schema.not

  if (!('object' == type(not))) return;

  var subctx = ctx.subcontext([],['not']).validNone()

  // note this is a bit weird...creates a virtual context to negate validation
  subctx.assert(
    !this.validate( instance, not, subctx.subcontext([],[]) ),
    'not invalid'
  ).property('not');
}
