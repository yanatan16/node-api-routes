// Here we show how to do endpoint inheritance

module.exports = function (api) {
	api.endpoint('inheritance', {
		url:'/inheritance',
		help: 'Showing how to inherit routes.',

		// You can put middleware here
		get: function (req, res) {
			res.send({method: 'get', endpoint: 'inheritance'});
		}
	})

	.endpoint('inheritance.chain', /* magical inheritance notation with the period */ {
		url: '/chain', // <-- This is the only thing that is extended by inheritance
									 // Actual url: /inheritance/chain
		help: 'I\'m a child',
		// You can include custom fields in the OPTIONS JSON response.
		seealso: '/inheritance',

		// You can put middleware here
		get: function (req, res) {
			res.send({method: 'get', endpoint: 'inheritance.chain'});
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