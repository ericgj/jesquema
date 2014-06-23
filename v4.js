'use strict';

module.exports = function(url, bindings, formats){

  var schema = bindings[url] = {};
  var fmts = formats[url] = {};

  schema.type                 = require('./bindings/type');
  schema.allOf                = require('./bindings/all_of');
  schema.anyOf                = require('./bindings/any_of');
  schema.oneOf                = require('./bindings/one_of');
  schema.not                  = require('./bindings/not');
  schema.enum                 = require('./bindings/enum');
  schema.minProperties        = require('./bindings/min_properties');
  schema.maxProperties        = require('./bindings/max_properties');
  schema.required             = require('./bindings/required');
  schema.dependencies         = require('./bindings/dependencies');
  schema.properties           = require('./bindings/properties');
  schema.patternProperties    = require('./bindings/pattern_properties');
  schema.additionalProperties = require('./bindings/additional_properties');

}
