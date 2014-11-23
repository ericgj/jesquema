
# jesquema

  [JSON Schema][1] validator for javascript

## Features
  
  - modular; for example, v4 of the spec is entirely implemented by plugins
  - built-in formats for date-time, email, hostname, ipv4, ipv6, uri
    as well as ISO8610 datetime, date, time, regex strings
  - extensive error/assertion reporting
  - extendable context (results) object
  - schema flattening (i.e. list top-level schemas that the instance is valid 
    against, for extracting descriptive data about the instance).
  
## Installation

  Install with [component(1)](http://component.io):

    $ component install ericgj/jesquema

  _npm install coming soon_

## Example

  ```js
  var validator = require('jesquema');
  var v = validator('4').schema( schema );
  
  // simple usage
  var valid = v( instance );

  // or to get assertion context
  var context = v.results( instance );
  if (!context.valid()) console.error( context.error() );
  console.debug( context.trace() );

  // to throw error if invalid
  v.throw(true);
  v( instance );
  
  // to add custom format via regex or function
  v.format( 'account', /^\d{3}\-\d{4}$/ );
  v.format( 'in_range', function(instance){ 
    return instance.y <= (2 * instance.x); 
  });
  
  // to resolve remote schema refs
  v.prefetch( ['http://my.schemas.com/one', 
               'http://my.schemas.com/two'], function(err){
    v( instance );
  });

  // to extract links (link templates) from all valid subschemas
  var links = v.results(instance).links();

  ```

## API

## Tests

  Validated against [JSON-Schema-Test-Suite][suite] as well as implementation-
  specific tests.

  To run the tests, first start the test file server (requires node.js):
  `node test/server.js`. Make sure port 1234 is open on localhost.

  Then open test/index.html in your browser (as a file, does not need to be
  served over http).


## TODO

- document API
- node.js compatibility
- refactor Context


## A note on remote references

  Right now remote refs must be _prefetched_, ie. you must specify up front
  all dependencies (including dependencies of dependencies), rather than
  determining them from the schemas themselves. This is similar to the way
  the [tv4][tv4] validator handles remote references.  _Dynamic_ fetching
  (fetching based on refs encountered in the schemas themselves) is fraught
  with complexity, and I personally do not see a compelling need for it. In
  fact, discouraging complex graphs of dependencies between schema files
  seems like a good idea -- wherever it can be avoided.

  In a browser context, prefetching can be somewhat automated by having the
  server specify the resources to prefetch. For instance, to stray not too
  far from standards, the response could include [prefetch links][prefetch]
  in a Link header:

    Link: </reference1.json>;rel=prefetch, </reference2.json>;rel=prefetch

  Then those links can be used to determine the schema files to prefetch into
  the validator.


## License

  The MIT License (MIT)

  Copyright (c) 2014 Eric Gjertsen <ericgj72@gmail.com>

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.


[1]: http://json-schema.org/
[suite]: https://github.com/json-schema/JSON-Schema-Test-Suite
[tv4]: https://github.com/geraintluff/tv4
[prefetch]: https://en.wikipedia.org/wiki/Link_prefetching

