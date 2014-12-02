'use strict';

var assert = require('assert')
  , type = require('type')
  , validate = require('jesquema')

var suite = window['json-schema-test-suite']

describe('standard test suite', function(){

  for (var key in suite){
    
    describe(key, function(){

      var tests = suite[key]
      tests = type(tests) == 'array' ? tests : [tests]

      for (var j=0;j<tests.length;++j){
        var test = tests[j]
        genTests(test,key);
      }

    })
  }

  
})


var REMOTES = {
  'definitions': [ 'http://json-schema.org/draft-04/schema#' ],
  'ref':         [ 'http://json-schema.org/draft-04/schema#' ],
  'refRemote':   [ 'http://localhost:1234/integer.json', 
                   'http://localhost:1234/subSchemas.json',
                   'http://localhost:1234/folder/folderInteger.json'
                 ]
}

var AGENTS = {
  'definitions': githubAPI,
  'ref':         githubAPI
}

function genTests(obj,type){
  
  describe(obj.description, function(){

    var schema = obj.schema

    obj.tests.forEach( function(testcase){
      var exp = testcase.valid
        , instance = testcase.data

      // console.log(testcase.description + ' : expected: %s', exp);

      it(testcase.description, function(done){
        var v = validate('4'), ctx, act;
        var remotes = REMOTES[type];
        var agent   = AGENTS[type];
        if (remotes && remotes.length > 0){
          if (agent) v.agent(agent);
          v.prefetch.apply(v,remotes);
          v.async(schema, instance, function(err,ctx){
            if (err) return done(err);
            var act = ctx.valid();
            if (exp !== act) _debug();
            assert(exp == act);
            done();
          });
        } else {
          var ctx = v(schema, instance);
          var act = ctx.valid();
          if (exp !== act) _debug();
          assert(exp == act);
          done();
        }

        ////// This is strictly for debugging. If all tests pass, none of this will output.
        function _debug(){
          console.error(testcase.description + ' : %o , expected: %s', [instance, schema], exp);
          var trace = ctx.assertions();
          for (var i=0;i<trace.length;++i){
            var rec = trace[i], msg = rec.messageLong, lvl = rec.level, iserr = !rec.value
            // if (iserr){
            //  console.error( Array((lvl+1) * 2).join(" ") + msg );
            //} else {
              console.log( Array((lvl+1) * 2).join(" ") + msg );
            //}
          }
        }
        //////

      })
    })
  })
}


// horrid workaround for Github pages lack of CORS....

function githubAPI(url, cb){
  var parts = new window.URL('',url);
  url = new window.URL(parts.pathname.slice(1), 
                   'https://api.github.com/repos/json-schema/json-schema/contents/0').toString();
  var req = xhr(url, cb, function(req){
    return JSON.parse(req.responseText);
  });
  req.setRequestHeader('Accept','application/vnd.github.3.raw');
  req.send();
}

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


