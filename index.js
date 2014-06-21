'use strict';

var has = hasOwnProperty;
var type = require('type');

// TODO move this to v4(BINDINGS)

var BINDINGS = {
  'http://json-schema.org/draft-04/schema#':  {
    'type': validateType
  }
}

BINDINGS['http://json-schema.org/schema#'] = 
  BINDINGS['http://json-schema.org/draft-04/schema#']

var SCHEMAURLS = {
  '4': 'http://json-schema.org/draft-04/schema#'
}

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
    self.formats = extend({}, formats);  // copy

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
    return extend( target, BINDINGS[version] || BINDINGS[ SCHEMAURLS[version] ] || {});
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


// TODO extend
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


function validateType(instance, schema, ctx){
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

// TODO add polyfill
var indexOf = Array.prototype.indexOf


////////


// temporary -- move to separate file

var truefn = function(){ return true; }

function Context(instance,schema,ipath,spath){
  if (!(this instanceof Context)) return new Context(instance,schema,ipath,spath);
  this.instance = instance;
  this.schema = schema;
  this.instancePath = (ipath == undefined ? '' : ipath);
  this.schemaPath = (spath == undefined ? '' : spath);
  this._assertions = [];
  this.contexts = [];
  this.all();
  return this;
}

Context.prototype.assertionsValid = function(){
  return this._assertions.every( function(a){ return !!a().value; } );
}

Context.prototype.all = function(){
  this.valid = function(){ 
    return this.assertionsValid() && 
           this.contexts.every( function(c){ return c.valid(); } );
  }
}

Context.prototype.any = function(){ 
  this.valid = function(){
    return this.assertionsValid() &&
           this.contexts.any( function(c){ return c.valid(); } );
  }
}

Context.prototype.none = function(){
  this.valid = function(){
    return this.assertionsValid() &&
           !this.contexts.any( function(c){ return c.valid(); } );
  }
}

Context.prototype.one = function(){
  this.valid = function(){
    return this.assertionsValid() && oneContextValid.call(this);

    function oneContextValid(){
      var count = 0;
      for (var i=0; i<this.contexts.length; ++i){
        if (this.contexts[i].valid()) count++;
        if (count > 1) break;
      }
      return (count == 1);
    }
  }
}

Context.prototype.subcontext = function(ipath,spath){
  var ctx =  Context(instance, 
                     schema, 
                     joinPath(this.instancePath,ipath),
                     joinPath(this.schemaPath,spath)
                    );
  this.contexts.push(ctx);
  return ctx;
}

Context.prototype.assert = function(value, predicate){
  var assertion = 
    Assertion(value)
      .predicate(predicate)
      .schemaPath( this.schemaPath )
      .instancePath( this.instancePath )
  this._assertions.push(assertion);
  return assertion;
}

Context.prototype.assertEqual = function(act, exp, predicate){
  return this.assert(act == exp, predicate).actual(act).expected(exp);
}

Context.prototype.error = function(){
  var errs = this.errors();
  if (errs.length == 0) return null;
  var msg = errs[0].values[0].message;
  var e = new Error(msg);
  e.errors = errs;
  return e;
}

Context.prototype.assertions = function(){
  return this.assertionsWhere();
}

Context.prototype.errors = function(){
  return this.assertionsWhere( 
    function(assert) { return !assert().value;  },
    function(context){ return !context.valid(); }
  );
}

Context.prototype.assertionsWhere = function(assertFilter, contextFilter, accum){
  assertFilter = assertFilter || truefn;
  contextFilter = assertFilter || truefn;
  accum = accum || [];
  var instance = this.instance
    , schema   = this.schema

  var rec = { 
    key: JSON.stringify([this.instancePath, this.schemaPath]),
    instancePath: this.instancePath,
    schemaPath: this.schemaPath
  };
  rec.values = this._assertions.filter(assertFilter).map( function(a){ 
    return a(instance,schema); 
  });
  if (rec.values.length > 0) accum.push(rec);
  this.contexts.filter(contextFilter).forEach( function(c){
    c.assertionsWhere(assertFilter, contextFilter, accum);
  });
  return accum;
}


function Assertion(value){

  var obj = {value: value};

  builder.predicate = function(_){
    obj.predicate = _; return this;
  }

  builder.schemaPath = function(_){
    obj.schemaPath = _; return this;
  }

  builder.instancePath = function(_){
    obj.instancePath = _; return this;
  }

  builder.property = function(_){
    obj.property = _; return this;
  }

  builder.expected = function(_){
    obj.expected = _; return this;
  }

  builder.actual = function(_){
    obj.actual = _; return this;
  }

  builder.code = function(_){
    obj.code = _; return this;
  }

  function builder(instance,schema){
    obj.instance = getPath(instance, obj.instancePath);
    obj.schema   = getPath(schema, obj.schemaPath);
    obj.message  = messageShort();
    obj.messageLong = messageLong();
    return obj;
  }

  // private

  function messageShort(){
    var ret = [];
    if (obj.instancePath !== undefined && obj.instancePath.length > 0){
      ret.push(obj.instancePath);
    }
    if (obj.property !== undefined && obj.property.length > 0){
      ret.push(obj.property);
    }
    ret.push( obj.value ? "valid" : "invalid" )
    if ( !obj.value && obj.predicate !== undefined){
      ret.push("::");
      ret.push(obj.predicate);
    }
    if (!obj.value && obj.code){
      ret.push("::");
      ret.push("[" + obj.code + "]");
    }
    return ret.join(' ');
  }

  function messageLong(){
    var ret = [];
    ret.push( messageShort() );
    if (!obj.value && obj.expected !== undefined){ 
      ret.push("::");
      ret.push( "expected " + JSON.stringify(obj.expected) + 
                ", was " + JSON.stringify(obj.actual || obj.instance)
              );
    }
    return ret.join(' ');    
  }

  return builder;
}



function joinPath(){
  return [].slice(arguments,0).map( function(a){
    return (a == undefined ? '' : a);
  }).join('/');
}


function getPath(instance,path){
  if (path === undefined) return instance;
  path = path.toString();
  if (0==path.length) return instance;
  var parts = path.split('/')
    , prop = parts.shift()
    , rest = parts.join('/')
  if ('#'==prop) return getPath(instance,rest);
  if (!has.call(instance,prop)) return;
  var branch = instance[prop]
  return getPath(branch,rest);
}

