// Here's the basics of how to use api-routes

// Export a function which accepts the API object
module.exports = function (api) {

	// Attach an endpoint to the object
	api.endpoint('test', {
		// Give it a url
		url:'/test',
		// Give it a hint
		help: 'Test endpoint.',

		// Set the method handlers
		get: function (req, res) {
			res.send({method: 'get', endpoint: 'test'});
		},
		put: function (req, res) {
			res.send({method: 'put', endpoint: 'test'});
		},
		post: function (req, res) {
			res.send({method: 'post', endpoint: 'test'});
		},
		delete: function (req, res) {
			res.send({method: 'delete', endpoint: 'test'});
		}

		// A magic OPTIONS method will be auto-generated for you.
	})

	.endpoint('test-2', {
		url: '/test/:id', // Do anything you can in express routes
		help: 'Make sure express routing works',

		get: function (req, res) {
			res.send('Your user id is ' + req.params.id);
		}
	});
};

/*

$ curl localhost:8000/api/test
{ "method": "get", "endpoint": "test" }
$ curl localhost:8000/api/test -XPOST
{ "method": "get", "endpoint": "post" }
$ curl localhost:8000/api/test -XOPTIONS
{
  "url": "/test",
  "name": "test",
  "help": "Test endpoint.",
  "available": [
    "get",
    "put",
    "post",
    "delete"
  ]
}

$ curl localhost:8000/api/test/123
Your user id is 123
*/