var type = require('type')

module.exports = function(instance, schema, ctx){
  if (!('object' == type(schema.properties)) && 
      !('object' == type(schema.patternProperties))) return;

  if (!('object' == type(instance))) return;

  var count
    , self = this
    , additional = schema.additionalProperties

  for (var key in instance){
    count = 0;

    withPropertyContext(key,validatePropContext);
    withPatternPropertyContexts(key,validatePropContext);

    // if no property or patternProperty schema for key
    if (count == 0) {
      if ('boolean' == type(additional)) {
        ctx.assert(additional, 
                   'unknown'
                  ).property(key);
      }
      if ('object' == type(additional)){
        ctx.assert(
          validatePropContext( instance[key], 
                               additional,
                               ctx.subcontext(key,'additionalProperties'),
                               key
                             );
        );
      }
    }
  }

  function validatePropContext(subinst, subsch, subctx, prop){
    count++;
    ctx.assert(
      self.validate(subinst, subsch, subctx)
    ).property(prop);
  }

  function withPropertyContext(prop, fn){
    var schprops = schema.properties
      , subsch = schprops && schprops[prop]
      , subinst = instance[prop]
      , subctx = ctx.subcontext(prop, 'properties/' + prop)

    if (!('object' == type(subsch))) return;
    fn(subinst, subsch, subctx, prop);
  }

  function withPatternPropertyContexts(prop,fn){
    var schprops = schema.patternProperties
      , subinst = instance[prop]
    if (!('object' == type(schprops)) return;
    for (var rx in schprops){
      var matcher = new RegExp(rx);
      if (matcher.test(prop)){
        var subsch = schprops[rx]
          , subctx = ctx.subcontext(prop, 'patternProperties/' + rx)
        fn(subinst, subsch, subctx, prop);
      }
    }
  }

}


