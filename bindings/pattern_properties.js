'use strict';
var type = require('type')

module.exports = function(instance, schema, ctx){
  if (!('object' == type(instance))) return;

  var props = schema.patternProperties

  // per sec. 8.3.2
  if (undefined === props) props = {};

  var subsch, subinst, matcher, subctx
  for (var rx in props){
    subsch = props[rx]
    
    for (var prop in instance){
      subinst = instance[prop];
      matcher = new RegExp(rx);
      if (matcher.test(prop)){
        subctx = ctx.subcontext([prop], ['patternProperties',rx]);
        this.validate(subinst, subsch, subctx)
      }
    }
  }
}


