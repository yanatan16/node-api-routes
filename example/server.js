// builtin
var http = require('http');

// vendor
var express = require('express');

// local
var Api = require('../lib');

// Setup application
var app = express();

app.use(express.logger('dev'));

// Include API Routes
var api = new Api('/api' /* base route */);

// You can add routes right here
api.endpoint('base', {
	url: '',
	help: 'Base route',
	get: function (req, res) {
		res.send({method:'get', endpoint: 'base'});
	}
});

// Or use the more organized requireAll
api.requireAll({
	dirname: __dirname + '/routes'
});

// Setup the middleware
app.use(api.router);

var server = http.createServer(app).listen(8000, function(){
	console.log("Api server listening on port 8000 at route /api");
});

//=============
