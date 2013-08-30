module.exports = function (api) {
	api.endpoint('a', {
		url: '/a'
	})

	.endpoint('b.a', {
		url: '/a',

		get: function (req, res) {
			res.send({name: 'a'});
		}
	});
};