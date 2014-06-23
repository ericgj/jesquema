'use strict';
var type = require('type')
  , deepEqual = require('../deep_equal')

module.exports = function(instance, schema, ctx){
  if (!('array' == type(instance))) return;
  var unique = schema.uniqueItems
    , match = false

  if (!('boolean' == type(unique))) return;
  if (!unique) return;

  for (var i=0;i<instance.length;++i){
    for (var j=i+1;j<instance.length;++j){
      match = deepEqual(instance[i],instance[j]);
      if (match) break;
    }
    if (match) break;
  }
  ctx.assert(!match,
             "does not contain unique items"
            );
}

