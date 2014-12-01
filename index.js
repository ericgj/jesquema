'use strict';

var has = hasOwnProperty;
var type = require('type');
var asyncEach = require('async-each');
var v4 = require('./v4');
var Context = require('./context');
var Cache = require('./cache');

var SCHEMAURLS = {
  '4': 'http://json-schema.org/draft-04/schema#'
}

var BINDINGS = {}
  , FORMATS = {}
  , DELEGATES = {}

v4( SCHEMAURLS['4'], BINDINGS, FORMATS, DELEGATES );

BINDINGS['http://json-schema.org/schema#'] = BINDINGS[ SCHEMAURLS['4'] ];
FORMATS[ 'http://json-schema.org/schema#'] = FORMATS[  SCHEMAURLS['4'] ];
DELEGATES[ 'http://json-schema.org/schema#'] = DELEGATES[  SCHEMAURLS['4'] ];

module.exports = function(version){

  var schema = {}
    , abort = false
    , formats = {}
    , disableFormats = false
    , throwerr = false
    , delegate = {}
    , cache = Cache()
    , prefetches = []
    , agent = jsonXHR

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
    if (arguments.length == 1) return delegate[name];
    delegate[name] = fn; return this;
  }

  validate.cache = function(_){
    if (arguments.length == 0) return cache;
    cache = _; return this;
  }

  validate.agent = function(_){
    if (arguments.length == 0) return agent;
    agent = _; return this;
  }

  validate.prefetch = function(){
    prefetches.push.apply(prefetches, [].slice.call(arguments,0));
    return this;
  }

  validate.valid = function(instance){
    return validate(instance).valid();
  }

  validate.results = validate;  // backwards compatibility
  
  validate.async = function(instance, fn){
    if (prefetches.length == 0) return fn(undefined, validate(instance));
    return asyncEach(prefetches, _fetch, function(err){
      if (err) return fn(err);
      return fn(undefined, validate(instance));
    });

    function _fetch(url, cb){
      agent(url, function(err,data){
        if (err) return cb(err);
        cache.add(data,url);
        cb();
      });
    }
  }

  function validate(instance){
    if (has.call(schema,'$schema')) this.version(schema['$schema']);
    var v = bind(validator(cache));
    var d = extend( {}, 
                    DELEGATES[version] || DELEGATES[ SCHEMAURLS[version] ] || {},
                    delegate
                  );
    var ctx = Context(instance,schema).delegate(d);
    v.validate(instance, schema, ctx, true);
    var valid = ctx.valid();
    if (throwerr && !valid) throw ctx.error();
    return ctx;
  }


  // private

  function validator(cache){
    
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
        
    self.validate = function(instance, schema, ctx, top){
      if (top || has.call(schema,'id')){
        cache.add(schema);
      }

      if (has.call(schema,'$ref')){
        var ref = cache.get( schema['$ref'], ctx.scope() );
        return self.validate(instance, ref.target(), ctx.graftContext(ref.object, ref.path));
      }

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


  if (arguments.length == 0) {
    validate.version('http://json-schema.org/schema#') ;
  }

  return validate;

}


// utils

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


function jsonXHR(url,cb){
  var req = xhr(url, cb, function(req){
    return JSON.parse(req.responseText);
  });
  req.send();
}

// simplified from d3.xhr

function xhr(url, cb, fn){
  var req = new XMLHttpRequest();
  "onload" in req 
    ? req.onload = req.onerror = _respond
    : req.onreadystatechange = function(){ req.readState > 3 && _respond(); }

  function _respond(){
    var status = req.status, result;
    if (!status && _hasResponse(req) || status >= 200 && status < 300 || status === 304){
      try {
        result = fn(req);
      } catch (e){
        cb(e,req);
      }
      cb(null,result);
    } else {
      var msg = (req.responseText || 'Error fetching ' + url) + ' (' + status + ')';
      cb(new Error(msg), req);
    }
  }

  function _hasResponse(req){
    var type = req.responseType;
    return !!(
      type && type !== 'text'
        ? req.response
        : req.responseText
    );
  }

  req.open('GET',url);
  return req;
}


