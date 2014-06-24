'use strict';
var type = require('type')

module.exports = function(instance, schema, ctx){
  var deps = schema.dependencies
  if (!('object' == type(deps))) return; 
  for (var dep in deps){
    if (undefined == instance[dep]) return;
    if ('array' == type(dep)){
      var missing = [], nonmissing = []
      for (var i=0;i<dep.length;++i){
        if (undefined == instance[dep[i]]){
          missing.push(dep[i])
        } else {
          nonmissing.push(dep[i])
        }
      }
      var n = missing.length
      ctx.assert(n == 0,
                 "has " + n + " missing dependenc" + (n == 1 ? "y" : "ies")
                ).property('dependencies')
                 .actual(nonmissing)
                 .expected(dep);
    } 
    if ('object' == type(dep)){
      this.validate( instance[key], dep, ctx.subcontext([],['dependencies',key]) );
    }
  }
}
