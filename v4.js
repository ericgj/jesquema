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
  schema.format               = require('./bindings/format');


  
  fmts['date-time']  = /^(\d{4})-(0[1-9]|1[0-2])-([0-2]\d|3[01])[Tt]([01]\d|2[0-3]):([0-5]\d):([0-5]\d)(\.\d+)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)$/ ;
  
  fmts.email    = /^[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i ;
  
  fmts.hostname = /^[a-zA-Z](([-0-9a-zA-Z]{0,61})?[0-9a-zA-Z])?(\.[a-zA-Z](([-0-9a-zA-Z]{0,61})?[0-9a-zA-Z])?)*$/ ;
  
  fmts.ipv4     = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/ ;
  
  fmts.ipv6     = /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/ ;

  fmts.uri      = new RegExp( '^' +
                    // protocol identifier
                    '(?:(?:https?|ftp)://)' +
                    // user:pass authentication
                    '(?:\\S+(?::\\S*)?@)?' +
                    '(?:' +
                        // IP address exclusion
                        // private & local networks
                        '(?!10(?:\\.\\d{1,3}){3})' +
                        '(?!127(?:\\.\\d{1,3}){3})' +
                        '(?!169\\.254(?:\\.\\d{1,3}){2})' +
                        '(?!192\\.168(?:\\.\\d{1,3}){2})' +
                        '(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})' +
                        // IP address dotted notation octets
                        // excludes loopback network 0.0.0.0
                        // excludes reserved space >= 224.0.0.0
                        // excludes network & broacast addresses
                        // (first & last IP address of each class)
                        '(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])' +
                        '(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}' +
                        '(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))' +
                    '|' +
                        // host name
                        '(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)' +
                        // domain name
                        '(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*' +
                        // TLD identifier
                        '(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))' +
                    ')' +
                    // port number
                    '(?::\\d{2,5})?' +
                    // resource path
                    '(?:/[^\\s]*)?' +
                '$', 'i' 
              );
                
  // additions to the v4 spec below
  
  fmts.datetime = fmts['date-time'];   // alias
  
  fmts['iso8601']  = /^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([Tt\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24\:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/ ;
  
  fmts.date     = /^(\d{4})((\-?)(0\d|1[0-2]))((\-?)([0-2]\d|3[0-1]))$/ ;
  
  fmts.time     = /^([01]\d|2[0-3])((:?)[0-5]\d)((:?)[0-5]\d)$/ ;
  
  fmts.regex    = formatRegExp ;
  
}


function formatRegExp(instance){
  try      { new RegExp(instance); } 
  catch(e) { return false; }
  return true;
}

