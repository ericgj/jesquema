'use strict';

var has = hasOwnProperty;
var type = require('type');
var v4 = require('./v4');
var Context = require('./context');

var SCHEMAURLS = {
  '4': 'http://json-schema.org/draft-04/schema#'
}

var BINDINGS = {}
  , FORMATS = {}

v4( SCHEMAURLS['4'], BINDINGS, FORMATS );

BINDINGS['http://json-schema.org/schema#'] = BINDINGS[ SCHEMAURLS['4'] ];
FORMATS[ 'http://json-schema.org/schema#'] = FORMATS[  SCHEMAURLS['4'] ];

module.exports = function(version){

  var schema = {}
    , abort = false
    , formats = {}
    , throwerr = false

  validate.schema = function(_){
    if (arguments.length == 0) return schema;
    schema = _; return this;
  }

  validate.version = function(_){
    if (arguments.length == 0) return version;
    version = _; return this;
  }

  validate.abort = function(_){
    abort = (undefined == _ || !!_)
    return this;
  }

  validate.throw = function(_){
    throwerr = (undefined == _ || !!_); 
    return this;
  }

  validate.format = function(name,fn){
    if (arguments.length == 1) return formats[name];
    formats[name] = formatfn(fn); return this;
  }

  function validate(instance, fn){
    if (has.call(schema,'$schema')) this.version(schema['$schema']);
    var v = bind(validator());
    var ctx = Context(instance,schema);
    v.validate(instance, schema, ctx);
    var err = ctx.error();
    if (throwerr && err) throw err;
    if (fn) fn(err, ctx);
    return ctx.valid();
  }

  // private

  function validator(){
    
    var self = {};
    self.formats = {};

    self.validate = function(instance, schema, ctx){
      for (var k in schema){
        if (!has.call(schema,k)) continue;
        if (!this[k]) continue;   // no such bound function, ignore
        this[k](instance, schema, ctx);
        if (!ctx.valid() && abort) {
          return false;
        }
      }

      return ctx.valid();
    }

    return self;
  }

  function bind(target){
    extend( target, 
            BINDINGS[version] || BINDINGS[ SCHEMAURLS[version] ] || {}
          );
    extend( target.formats, 
            FORMATS[version] || FORMATS[ SCHEMAURLS[version] ] || {},
            formats
          );
    return target;
  }

  function formatfn(r){
    if (typeof r == 'function') return r;
    return function(instance){ 
      if (val == undefined) return false;
      return !!r.test(instance.toString()); 
    };
  }

  return validate;

}


function extend(obj) {
  if (!(type(obj) == 'object')) return obj;
  var source, prop;
  for (var i = 1, length = arguments.length; i < length; i++) {
    source = arguments[i];
    for (prop in source) {
      obj[prop] = source[prop];
    }
  }
  return obj;
};


//////// stupid example of validation function

function properties(instance, schema, ctx){
  for (var k in schema.properties){
    var spath = 'properties/' + k
      , ipath = k
      , subschema = this.subschema(spath)
      , subinst = this.subinstance(ipath)
    ctx.assert( 
      this.validate(subinst, subschema, ctx.subcontext(ipath,spath)),
      'has invalid property "' + k + '"'
    ).property(k).code(123)
  }
}


////////

