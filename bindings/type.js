'use strict';
var type = require('type');

// TODO add polyfill
var indexOf = Array.prototype.indexOf

module.exports = function(instance, schema, ctx){
  if (instance === undefined) return;
  var types = schema.type
  if (!types) return;
  
  var actual = type(instance)
    , isinteger = actual == 'number' && (instance==(instance|0))

  types = ('array' == type(types) ? types : [types])
  var valid = (indexOf.call(types,actual)>=0) || 
                (isinteger && indexOf.call(types,'integer')>=0)
    , isnull = (actual == 'null')
  ctx.assert( valid, 
              isnull ? "is missing" : "does not match type"
            ).actual( actual )
             .expected( types );
}




