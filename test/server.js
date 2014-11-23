var connect = require('connect');
var static  = require('serve-static');

function allowCrossDomain(req, res, next){
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With');
  next();
}

connect()
  .use(allowCrossDomain)
  .use(static('test/remotes'))
  .listen(1234)

