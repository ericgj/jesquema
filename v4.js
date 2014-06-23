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
  schema.multipleOf           = require('./bindings/multiple_of');
  schema.items                = require('./bindings/items');
  schema.minItems             = require('./bindings/min_items');
  schema.maxItems             = require('./bindings/max_items');
  schema.uniqueItems          = require('./bindings/unique_items');
  schema.minimum              = require('./bindings/minimum');
  schema.maximum              = require('./bindings/maximum');
  schema.minLength            = require('./bindings/min_length');
  schema.maxLength            = require('./bindings/max_length');
  schema.pattern              = require('./bindings/pattern');

}
