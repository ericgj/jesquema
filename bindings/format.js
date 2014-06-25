'use strict';
var type = require('type')

module.exports = function(instance, schema, ctx){
  var fmt = schema.format;
  if (!('string' == type(fmt))) return;

  var fn = this.getFormat(fmt);
  if (!fn) return;
  
  ctx.assert( fn(instance),
              'does not match format'
            ).property('format')
             .expected(fmt)
             .actual(instance);
}
