'use strict';

var has = hasOwnProperty;
var truefn = function(){ return true; }

module.exports = Context;

function Context(instance,schema,ipath,spath){
  if (!(this instanceof Context)) return new Context(instance,schema,ipath,spath);
  this.instance = instance;
  this.schema = schema;
  this.instancePath = (ipath === undefined ? [] : ipath);
  this.schemaPath = (spath === undefined ? [] : spath);
  this._assertions = [];
  this._delegate = undefined;
  this.contexts = [];
  this.validAll();
  return this;
}

// note: methods on instance and subcontexts (not prototype)
Context.prototype.delegate = function(_){
  this._delegate = _; 
  for (var k in this._delegate){
    if (has.call(this._delegate,k)) this[k] = this._delegate[k].bind(this)
  }
  return this;
}

Context.prototype.assertionsValid = function(){
  return this._assertions.every( function(a){ return !!a.value; } );
}

Context.prototype.validAll = function(){
  this.valid = function(){ 
    return this.assertionsValid() && 
           this.contexts.every( function(c){ return c.valid(); } );
  }
  return this;
}

Context.prototype.validAny = function(){ 
  this.valid = function(){
    return this.assertionsValid() &&
           this.contexts.some( function(c){ return c.valid(); } );
  }
  return this;
}

Context.prototype.validNone = function(){
  this.valid = function(){
    return this.assertionsValid() &&
           !this.contexts.every( function(c){ return c.valid(); } );
  }
  return this;
}

Context.prototype.validOne = function(){
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
  return this;
}

// TODO: better way to determine 'combo' nodes
Context.prototype.validSchema = function(accum){
  accum = accum || [];
  if (!this.valid()) return accum;
  var schema = this.schema
    , schemaPath = this.schemaPath
    , instancePath = this.instancePath
    , combos = ['allOf','anyOf','oneOf','not','dependencies']
    , iscombo = schemaPath.length > 0 &&
                combos.indexOf(schemaPath[schemaPath.length-1]) >= 0
  if (instancePath.length == 0 && !iscombo )
    accum.push( getPath(schema, schemaPath) );
  this.contexts.forEach( function(c){
    c.validSchema(accum);
  })
  return accum;
}

Context.prototype.subcontext = function(ipath,spath){
  var ipathsub = this.instancePath.slice(0)
    , spathsub = this.schemaPath.slice(0)
  ipathsub.push.apply(ipathsub, ipath);
  spathsub.push.apply(spathsub, spath);
  var ctx =  Context(this.instance, 
                     this.schema, 
                     ipathsub,
                     spathsub
                    );
  if (!(this._delegate === undefined)) ctx.delegate(this._delegate);
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
  var msg = errs[0].message;
  var trace = this.trace();
  var e = new Error(msg);
  e.errors = errs;
  e.trace = trace;
  return e;
}

Context.prototype.trace = function(){
  return this.assertions().map( function(a){ return a.messageLong; } );
}

Context.prototype.assertions = function(){
  return this.assertionsWhere();
}

Context.prototype.errors = function(){
  return this.assertionsWhere( 
    function(a){ return !a.value; },
    function(c){ return !c.valid();   }
  );
}

Context.prototype.assertionsWhere = function(assertFilter, contextFilter, accum){
  assertFilter = assertFilter || truefn;
  contextFilter = contextFilter || truefn;
  accum = accum || [];
  var instance = this.instance
    , schema   = this.schema

  var values = this._assertions.filter(assertFilter).map( function(a){ 
    return a(instance,schema); 
  });
  if (values.length > 0) accum.push.apply(accum,values);
  if (contextFilter(this)){
    this.contexts.filter(contextFilter).forEach( function(c){
      c.assertionsWhere(assertFilter, contextFilter, accum);
    });
  }
  return accum;
}


function Assertion(value){

  var predicate,
      schemaPath,
      instancePath,
      property,
      expected,
      actual,
      code

  builder.predicate = function(_){
    predicate = _; return this;
  }

  builder.schemaPath = function(_){
    schemaPath = _; return this;
  }

  builder.instancePath = function(_){
    instancePath = _; return this;
  }

  builder.property = function(_){
    property = _; return this;
  }

  builder.expected = function(_){
    expected = _; return this;
  }

  builder.actual = function(_){
    actual = _; return this;
  }

  builder.code = function(_){
    code = _; return this;
  }

  function builder(instance,schema){
    var obj = {};
    obj.value    = value;
    obj.predicate = predicate;
    obj.schemaPath = schemaPath;
    obj.instancePath = instancePath;
    obj.property = property;
    obj.expected = expected;
    obj.actual = actual;
    obj.code = code;
    obj.level = instancePath.length;
    obj.instance = getPath(instance, obj.instancePath);
    obj.schema   = getPath(schema, obj.schemaPath);
    obj.message  = messageShort();
    obj.messageLong = messageLong();
    return obj;
  }

  // private

  function messageShort(){
    var ret = [];
    if (instancePath !== undefined && instancePath.length > 0){
      ret.push(instancePath.join('/'));
    }
    ret.push( value ? "valid" : (predicate || "invalid") );

    if (!value && code){
      ret.push("[" + code + "]");
    }
    return ret.join(' :: ');
  }

  function messageLong(){
    var ret = [];
    ret.push( messageShort() );
    if (property !== undefined && property.length > 0){
      ret.push(property);
    }
    if (!value && expected !== undefined){ 
      ret.push( "expected " + JSON.stringify(expected) + 
                ", was " + JSON.stringify(actual)
              );
    }
    return ret.join(' :: ');    
  }

  builder.value = value;
  return builder;
}


// utils

function joinPath(){
  return [].slice.call(arguments,0).map( function(a){
    return (a == undefined ? '' : a);
  }).join('/');
}


function getPath(instance,path){
  if (!(typeof instance == 'object')) return instance;  // not object or array
  if (0==path.length) return instance;
  var prop = path[0]
    , rest = path.slice(1)
  if (undefined == instance[prop]) return;
  var branch = instance[prop];
  return getPath(branch,rest);
}

