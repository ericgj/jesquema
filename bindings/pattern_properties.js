'use strict';
var type = require('type')

module.exports = function(instance, schema, ctx){
  if (!('object' == type(schema.patternProperties))) return;
  if (!('object' == type(instance))) return;

  for (var rx in schema.patternProperties){
    var subsch = schema.patternProperties[rx]
    
    for (var prop in instance){
      var subinst = instance[prop];
      var matcher = new RegExp(rx);
      if (matcher.test(prop)){
        var subctx = ctx.subcontext(prop, 'patternProperties/' + rx);
        this.validate(subinst, subsch, subctx)
      }
    }
  }
}


