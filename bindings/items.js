'use strict';
var type = require('type')

module.exports = function(instance, schema, ctx){
  if (!('array' == type(instance))) return;
  var items = schema.items
    , additional = schema.additionalItems

  // per sec. 8.2.2 of spec
  if (undefined == items) items = {};
  if (undefined == additional) additional = {};

  if (!('object' == itemstype) && !('array' == itemstype)) return;

  var itemstype = type(items)
    , additionaltype = type(additional)

  if ('array' == itemstype){
    var subsch, subctx
    for (var i=0;i<instance.length;++i){
      subsch = items[i]
      if ('object' == type(subsch)) {
        subctx = ctx.subcontext([i],['items',i])
        ctx.assert( this.validate(instance[i], subsch, subctx ),
                    "item " + (i+1) + " is invalid"
                  ).property('items');

      } else if ('boolean' == additionaltype) {
        ctx.assert(additional,
                   "contains additional items"
                  ).property('items')
                   .expected(additional)
                   .actual(true);

      } else if ('object' == additionaltype) {
        subctx = ctx.subcontext([i],['additionalItems'])
        ctx.assert( this.validate( instance[i], additional, subctx ),
                     "additional item " + (i+1) + " is invalid"
                  ).property('items');
      }
    }
  } else if ('object' == itemstype) {
     var subctx
     for (var i=0;i<instance.length;++i){
       subctx = ctx.subcontext([i],['items'])
       ctx.assert( this.validate( instance[i], items, subctx ),
                   "item " + (i+1) + " is invalid"
                 ).property('items');
     }
  }
}

