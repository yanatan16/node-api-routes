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
		res.send('base route!');
	}
});

// Or use the more organized requireAll
api.requireAll({
	dirname: __dirname + '/routes'
});

// Setup the middleware
app.use(api.router);

module.exports = function (port) {
	return http.createServer(app).listen(port, function(){
		console.log("Api server listening on port "+port+" at route /api");
	});
}

//=============
