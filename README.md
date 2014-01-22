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

    // middleware for every request (and every inherited request)
    middleware: [ someMiddleware(), someOtherMiddleware() ],

    // middleware for only POST, PUT, and DELETE
    edit_middleware: [ someAuthMiddleware() ],

		// Set the method handlers
		get: function (req, res) {
			res.send('gotten');
		},
		post: function (req, res) {
			res.send('posters');
		},
		delete: [
      someExtraMiddleware(),
      function (req, res) {
  			res.send('beleted!');
  		}
    ]
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

## Easy URL Sub-Paths via Inheritance

Let's imagine you want the following endpoints: `/users`, `/users/:id`, `/users/:id/profile_pic`, `users/:id/reputation`

Using inheritance, you can set this up cleanly:

```javascript
module.exports = {
    api.endpoint('users', {
        url: '/users',
        post: function(req, res) {}
    })

    api.endpoint('users.user', {
        url: '/:id',
        get: function(req, res) {}
    })

    api.endpoint('users.user.pic', {
        url: '/profile_pic',
        get: function(req, res) {}
    })

    api.endpoint('users.user.reputation', {
        url: '/reputation',
        get: function(req, res) {}
    })
}
```

## License

MIT License found in [LICENSE](https://github.com/yanatan16/node-api-routes/blob/master/LICENSE) file.
