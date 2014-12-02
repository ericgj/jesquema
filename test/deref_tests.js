'use strict';

var validate = require('jesquema')
  , assert = require('assert')

describe('context.scope', function(){
  
  it('should return top-level id if given', function(){
    var schema = {'id': 'http://foo.com/some/path' }
    var v = validate('4');
    var actual = v(schema,{});
    assert.equal(actual.scope(), schema.id);
  });

  it('should return top-level id from sub-schema', function(){
    var schema = {'id': 'http://foo.com/some/path', 'properties': { 'foo': {} } }
    var v = validate('4');
    var actual = v(schema,{'foo': 'bar'});
    assert.equal(actual.contexts.length, 1);
    actual.contexts.forEach( function(c){
      assert.equal(c.scope(), schema.id);
    });
  });

  it('should return sub-schema fragment id resolved against top-level id, if given', function(){
    var schema = {'id': 'http://foo.com/some/path', 'properties': { 'foo': { 'id': '#foo'} } }
    var v = validate('4');
    var actual = v(schema,{'foo': 'bar'});
    assert.equal(actual.contexts.length, 1);
    var propcontext = actual.contexts[0];
    console.log(this.test.fullTitle() + ': %o', propcontext.scope());
    assert.equal(propcontext.scope(), schema.id + '#foo');
  });
 
  it('should return sub-schema path id resolved against top-level id, if given', function(){
    var schema = {'id': 'http://foo.com/some/path', 'properties': { 'foo': { 'id': 'foo'} } }
    var v = validate('4');
    var actual = v(schema,{'foo': 'bar'});
    assert.equal(actual.contexts.length, 1);
    var propcontext = actual.contexts[0];
    console.log(this.test.fullTitle() + ': %o', propcontext.scope());
    assert.equal(propcontext.scope(), 'http://foo.com/some/foo');
  });

  it('should return nested sub-schema fragment id resolved against parent level id, if given', function(){
    var schema = {'id': 'http://foo.com/some/path', 
                  'properties': { 
                    'foo': { 
                      'id': 'foo', 
                      'properties': { 
                        'bar': {
                          'id': '#bar'
                        }
                      } 
                    } 
                  }
                 };
    var v = validate('4');
    var actual = v(schema,{'foo': { 'bar': 0 } });
    assert.equal(actual.contexts.length, 1);
    assert.equal(actual.contexts[0].contexts.length, 1);
    var propcontext = actual.contexts[0].contexts[0];
    console.log(this.test.fullTitle() + ': %o', propcontext.scope());
    assert.equal(propcontext.scope(), 'http://foo.com/some/foo#bar');
  });

  it('should return nested sub-schema path id resolved against parent level id, if given', function(){
    var schema = {'id': 'http://foo.com/some/path', 
                  'properties': { 
                    'foo': { 
                      'id': 'foo', 
                      'properties': { 
                        'bar': {
                          'id': 'bar'
                        }
                      } 
                    } 
                  }
                 };
    var v = validate('4');
    var actual = v(schema,{'foo': { 'bar': 0 } });
    assert.equal(actual.contexts.length, 1);
    assert.equal(actual.contexts[0].contexts.length, 1);
    var propcontext = actual.contexts[0].contexts[0];
    console.log(this.test.fullTitle() + ': %o', propcontext.scope());
    assert.equal(propcontext.scope(), 'http://foo.com/some/bar');
  });
  
})

describe('pointer dereferencing', function(){

  it('should dereference prior', function(){
    var schema = { id: 'http://foo.com/some/path',
                   definitions: {
                     'maybeString': {
                       'type': ['null', 'string']
                     }
                   },
                   properties: {
                     'foo': { '$ref': '#/definitions/maybeString' }
                   }
                 }

    var v = validate('4');
    var actual = v(schema,{'foo': null});
    console.log(this.test.fullTitle() + ': trace: %o', actual.trace());
    assert( actual.valid() );
    assert.equal( actual.trace().length, 1);
  })

  it('should dereference post', function(){
    var schema = { id: 'http://foo.com/some/path',
                   properties: {
                     'foo': { 
                       'type': 'array',
                       'items': {
                         '$ref': '#/definitions/maybeString' }
                       }
                   },
                   definitions: {
                     'maybeString': {
                       'type': ['null', 'string']
                     }
                   }
                 }

    var v = validate('4');
    var actual = v(schema,{'foo': [null,'2',null,3] });
    console.log(this.test.fullTitle() + ': trace: %o', actual.trace());
    assert( !actual.valid() );
    assert.equal( actual.trace().length, 9);
  })

  it('should dereference nested two and three times', function(){
    var schema = { id: 'http://foo.com/some/path',
                   properties: {
                     'foo': { '$ref': '#/definitions/maybeString' }
                   },
                   definitions: {
                     'one': { 'type': 'null' },
                     'two': { 'type': 'string' },
                     'three': { 'type': 'number', 'enum': [0] },
                     'maybeString': {
                       'oneOf': [
                         { '$ref': '#/definitions/one' },
                         { '$ref': '#/definitions/two' },
                         { '$ref': '#/definitions/insane' }
                       ]
                     },
                     'insane': {
                       '$ref': '#/definitions/three'
                     }
                   }
                 }

    var v = validate('4');
    var actual = v(schema,{'foo': 0 });
    console.log(this.test.fullTitle() + ': trace: %o', actual.trace());
    assert( actual.valid() );
    assert.equal( actual.trace().length, 5);
  })

  it('should throw reference error if pointer doesnt exist', function(done){
    var schema = { id: 'http://foo.com/some/path',
                   properties: {
                     'foo': { '$ref': '#/doesnt/exist' }
                   }
                 }
    var v = validate('4');
    try {
      var actual = v(schema,{'foo': 'imaginary'});
    } catch (e){
      console.log(this.test.fullTitle() + ': error: %o', e);
      assert.equal(e.name, 'ReferenceError');
      done();
    }
  })

})


