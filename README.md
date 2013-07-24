node-api-routes
===============

A declarative system for creating express API routes. It has a few goals:

- Make declaring routes really easy to create, read, and manage.
- Allow all the usual express helpers (middleware, parameters, etc)
- Be RESTful and create OPTIONS endpoints to help developers.

## Install & Usage

```
npm install api-routes --save
```

In your express app declaration:

```javascript
var Api = require('api-routes');
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
// See below for examples on how files should be organized.
api.requireAll({
	// Same options as require-all package
	dirname: __dirname + '/routes',
  filter      :  /(.*)\.js$/, // optional
  excludeDirs :  /^\.(git|svn)$/ //optional
});

// Setup the middleware
app.use(api.router);
```

## Examples

Checkout the [examples](https://github.com/yanatan16/node-api-routes/tree/master/example).

An entire route file may look like this:

```javascript
module.exports = function (api) {

	api.endpoint('test', {

		// Give it a url
		url:'/test',

		// Give it a hint (its in the OPTIONS response)
		help: 'Test endpoint.',

		// Add as many extra fields as you'd like (also included in OPTIONS)
		seealso: '/my-other-route',

		// Set the method handlers
		get: function (req, res) {
			res.send('gotten');
		},
		post: function (req, res) {
			res.send('posters');
		},
		delete: function (req, res) {
			res.send('beleted!');
		}
	});

};
```

Then we can query it like so:

```bash
$ curl localhost:8000/api/test
gotten
$ curl localhost:8000/api/test -XPOST
posters
$ curl localhost:8000/api/test -XDELETE
beleted!
$ curl localhost:8000/api/test -XOPTIONS
{
	"help": "Test endpoint.",
	"url": "/test",
	"seealso": "/my-other-route",
	"name": "test",
	"available": [
		"get",
		"post",
		"delete"
	]
}
```

Other features include inheritance via adding sub-endpoints using a period in the name, such as 'test.abc' being a child of endpoint 'test'. There is an example to show how to use this.

## License

MIT License found in [LICENSE](https://github.com/yanatan16/node-api-routes/blob/master/LICENSE) file.