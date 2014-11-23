'use strict';
var URL = require('./url');
var Pointer = require('./pointer');
var type = require('type');

module.exports = Cache;

function Cache(){

  var cache = {}
    , schemas = {}
    , base

  cache.base = function(url){
    base = url; return this;
  }

  cache.get = function(ref, id){
    // try inline deref first
    var url = resolve(ref, id);
    var schema = schemas[ url ];
    if (!(schema === undefined)) return new Pointer(schema,[]);

    // if not found through inline deref, try json pointer against base URL
    var urlparts = resolveParts(ref, id)
    schema = schemas[ urlparts.base ];
    if (!(schema === undefined)) return new Pointer(schema, urlparts.path);
    
    // otherwise, if base URL not found, cache miss -- throw error
    throw new Cache.ReferenceError('Reference not found: "' + url + '"'); 
  }

  cache.add = function(schema,id){
    id = schema['id'] || id || ''; 
    id = resolve('', resolve(id,base));
    schemas[ id ] = extend({},schema,{id: id});
    return this;
  }

  cache.debug = function(){
    console.debug( schemas );
  }

  function resolve(id,base){
    return URL(id,base).toString();
  }

  function resolveParts(id,base){
    var parts = resolve(id,base).split('#');
    return { base: parts[0], 
             fragment: (parts[1] || ''),
             path: parts[1] ? parts[1].split('/') : []
           };
  }

  return cache;
}


Cache.ReferenceError = function(msg){ 
  this.name = 'ReferenceError';
  this.message = msg;
}
Cache.ReferenceError.prototype = new ReferenceError();
Cache.ReferenceError.prototype.constructor = Cache.ReferenceError;



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
