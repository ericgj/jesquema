'use strict';

module.exports = function(url, bindings, formats){

  var schema = bindings[url] = {};
  var fmts = formats[url] = {};

  schema.type = require('./bindings/type');
  schema.properties = require('./bindings/properties');
  schema.patternProperties = require('./bindings/pattern_properties');
  schema.additionalProperties = require('./bindings/additional_properties');

}
