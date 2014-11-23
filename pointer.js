'use strict';

module.exports = Pointer;

function Pointer(object,path){
  if (!(this instanceof Pointer)) return new Pointer(object,path);
  this.object = object;
  this.path = path;
}

Pointer.prototype.target = function(){
  var ret = getPath(this.object, this.path);
  if (ret === undefined) 
    throw new Pointer.ReferenceError('Reference not found: "' + this.path.join('/') + '" ' + 'within ' + JSON.stringify(this.object));
  return ret;
}

Pointer.ReferenceError = function(msg){
  this.name = 'ReferenceError';
  this.message = msg;
}
Pointer.ReferenceError.prototype = new Error();
Pointer.ReferenceError.prototype.constructor = Pointer.ReferenceError;


function getPath(instance,path){
  if (!(typeof instance == 'object')) return instance;  // not object or array
  if (0==path.length) return instance;
  var prop = decode(path[0])
    , rest = path.slice(1)
  if (0==prop.length) return getPath(instance,rest);
  if (undefined === instance[prop]) return;
  var branch = instance[prop];
  return getPath(branch,rest);
}

function decode(segment){
  if (!('string' == typeof segment)) return segment;
  return decodeURIComponent(
    segment.replace('~0','~')
           .replace('~1','/')
  );
}

