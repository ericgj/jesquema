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
    , disableFormats = false
    , throwerr = false
    , delegate = {}

  if (arguments.length == 0) version = 'http://json-schema.org/schema#' ;

  validate.schema = function(_){
    if (arguments.length == 0) return schema;
    schema = _; return this;
  }

  validate.version = function(_){
    if (arguments.length == 0) return version;
    version = _; return this;
  }

  validate.abort = function(_){
    abort = (undefined === _ || !!_)
    return this;
  }

  validate.format = function(name,fn){
    if (arguments.length == 1) return formats[name];
    formats[name] = fn; return this;
  }

  validate.disableFormats = function(_){
    disableFormats = (undefined === _ || !!_)
    return this;
  }

  validate.throw = function(_){
    throwerr = (undefined === _ || !!_); 
    return this;
  }

  validate.use = function(name,fn){
    delegate[name] = fn;
    return this;
  }

  // sugar
  function validate(instance, fn){
    var ctx = validate.results(instance);
    var valid = ctx.valid();
    var err;
    if (!valid) err = ctx.error();
    if (throwerr && err) throw err;
    if (fn) fn(err, ctx);
    return ctx.valid();
  }

  validate.results = function(instance){
    if (has.call(schema,'$schema')) this.version(schema['$schema']);
    var v = bind(validator());
    var ctx = Context(instance,schema).delegate(delegate);
    v.validate(instance, schema, ctx);
    return ctx;
  }


  // private

  function validator(){
    
    var self = {};
    self.formats = {};

    self.getFormat = function(name){
      if (disableFormats) return;
      var fmt = this.formats[name];
      if (undefined === fmt) return;
      if ('function' == type(fmt)) return fmt;
      return function(instance){
        if (undefined === instance) return false;
        return !!fmt.test(instance);
      }
    }
        
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
            FORMATS[version] || FORMATS[ SCHEMAURLS[version] ] || {} ,
            formats
          );
    return target;
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

