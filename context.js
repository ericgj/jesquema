var truefn = function(){ return true; }

module.exports = Context;

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


// utils

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

