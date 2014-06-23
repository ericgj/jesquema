'use strict';
var type = require('type')

module.exports = function(instance, schema, ctx){
  if (!('array' == type(instance))) return;
  var items = schema.items
    , additional = schema.additionalItems
    , itemstype = type(items)
    , additionaltype = type(additional)

  if (!('object' == itemstype) && !('array' == itemstype)) return;

  if ('array' == itemstype){
    var subsch, subctx
    for (var i=0;i<instance.length;++i){
      subsch = items[i]
      if ('object' == type(subsch)) {
        subctx = ctx.subcontext([i],['items',i])
        ctx.assert( this.validate(instance[i], subsch, subctx ),
                    "item " + (i+1) + " is invalid"
                  );

      } else if ('boolean' == additionaltype) {
        ctx.assert(additional,
                   "contains additional items"
                  ).expected(additional)
                   .actual(true);

      } else if ('object' == additionaltype) {
        subctx = ctx.subcontext([i],['additionalItems'])
        ctx.assert( this.validate( instance[i], additional, subctx ),
                     "additional item " + (i+1) + " is invalid"
                  );
      }
    }
  } else if ('object' == itemstype) {
     var subctx
     for (var i=0;i<instance.length;++i){
       subctx = ctx.subcontext([i],['items'])
       ctx.assert( this.validate( instance[i], items, subctx ),
                   "item " + (i+1) + " is invalid"
                 );
     }
  }
}

