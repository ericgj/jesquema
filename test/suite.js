'use strict';

var assert = require('assert')
  , type = require('type')
  , validate = require('jesquima')

var suite = window['json-schema-test-suite']

describe('standard test suite', function(){

  for (var key in suite){
    
    describe(key, function(){

      var tests = suite[key]
      tests = type(tests) == 'array' ? tests : [tests]

      for (var j=0;j<tests.length;++j){
        var test = tests[j]
        genTests(test);
      }

    })
  }

  
})


function genTests(obj){
  
  describe(obj.description, function(){

    var schema = obj.schema

    obj.tests.forEach( function(testcase){
      var exp = testcase.valid
        , instance = testcase.data

      // console.log(testcase.description + ' : expected: %s', exp);

      it(testcase.description, function(){
        var v = validate('4').schema(schema)
          , ctx = v.results(instance)
          , act = ctx.valid()

        ////// This is strictly for debugging. If all tests pass, none of this will output.
        if (exp !== act){
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

        assert(exp == act);
      })
    })
  })
}



