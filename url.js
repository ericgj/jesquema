
if (typeof URL == 'undefined'){
  module.exports = SchemaURL( window && ( window.URL || webkitURL ) );
} else {
  module.exports = SchemaURL(URL);
}

function SchemaURL(fn){
  return function(path,base){
    if (undefined === base) base = 'file://';
    return new fn(path,base);
  }
}

