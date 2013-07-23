// Here we show how to include authentication via middleware onto your routes.

var authMiddleware = function (req, res, next) {
	// Not a realy authentication middleware, just an example
	if (req.query.auth === undefined) {
		res.send(403, 'Unauthenticated');
	} else {
		next();
	}
};

module.exports = function (api) {
	api.endpoint('auth-test', {
		url:'/authtest',
		help: 'Testing Authentication middleware endpoint.',

		// You can put middleware here
		get: [ authMiddleware, function (req, res) {
			res.send('authenticated!');
		}]
	})

	// Yes you can chain.
	.endpoint('auth-test-2', {
		url: '/authtest2',
		help: 'Testing Authentication middleware endpoint. (#2)',

		// Or you can put middleware here if it should be on every method
		middleware: authMiddleware,
		get: function (req, res) {
			res.send('authenticated!');
		}
	});
};

/*

$ curl localhost:8000/api/authtest
Unauthenticated
$ curl localhost:8000/api/authtest?auth=true
authenticated!
$ curl localhost:8000/api/authtest2
Unauthenticated
$ curl localhost:8000/api/authtest2?auth=true
authenticated!

*/