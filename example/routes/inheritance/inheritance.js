// Here we show how to do endpoint inheritance

module.exports = function (api) {
	api.endpoint('inheritance', {
		url:'/inheritance',
		help: 'Showing how to inherit routes.',

    middleware: function (req, res, next) { req.tosay = 'my'; next() },

    edit_middleware: function (req, res, next) { req.tosay += 'yolo' },

		// You can put middleware here
		get: function (req, res) {
			res.send({method: 'get', endpoint: 'inheritance', tosay: req.tosay});
		},

    post: function (req, res) {
      res.send({method: 'post', endpoint: 'inheritance.chain', tosay: req.tosay});
    }
	})

	.endpoint('inheritance.chain', /* magical inheritance notation with the period */ {
		url: '/chain', // <-- This is the only thing that is extended by inheritance
									 // Actual url: /inheritance/chain
		help: 'I\'m a child',
		// You can include custom fields in the OPTIONS JSON response.
		seealso: '/inheritance',

    middleware: [
      function (req, res, next) { req.tosay = 'name'; next() },
      function (req, res, next) { req.tosay += 'is'; next() }
    ],

		// You can put middleware here
		get: function (req, res) {
			res.send({method: 'get', endpoint: 'inheritance.chain', tosay: req.tosay});
		},

    post: function (req, res) {
      res.send({method: 'post', endpoint: 'inheritance.chain', tosay: req.tosay});
    }
	})
};

/*

$ curl localhost:8000/api/inheritance
{ "method": "get", "endpoint": "inheritance" }
$ curl localhost:8000/api/inheritance/chain
{ "method": "get", "endpoint": "inheritance.chain" }

$ curl localhost:8000/api/inheritance/chain -XOPTIONS
{
  "help": "I'm a child",
  "url": "/inheritance/chain",
  "seealso": "/inheritance",
  "name": "inheritance.chain",
  "available": [
    "get"
  ]
}

*/