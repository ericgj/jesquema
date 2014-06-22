'use strict';
var type = require('type')

module.exports = function(instance, schema, ctx){
  if (!('object' == type(schema.properties))) return;
  if (!('object' == type(instance))) return;

  for (var prop in schema.properties){
    if (undefined == instance[prop]) continue;
    var subsch = schema.properties[prop]
      , subinst = instance[prop]
      , subctx = ctx.subcontext(prop, 'properties/' + prop)

    this.validate(subinst, subsch, subctx)
  }
}

