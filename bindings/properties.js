'use strict';
var type = require('type')

module.exports = function(instance, schema, ctx){
  if (!('object' == type(instance))) return;

  var props = schema.properties

  // per sec. 8.3.2
  if (undefined == props) props = {};

  var subsch, subinst, subctx
  for (var prop in props){
    if (undefined == instance[prop]) continue;
    subsch = props[prop];
    subinst = instance[prop];
    subctx = ctx.subcontext([prop], ['properties',prop]);

    this.validate(subinst, subsch, subctx);
  }
}

