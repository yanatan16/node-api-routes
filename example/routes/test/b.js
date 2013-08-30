module.exports = function (api) {
	api.endpoint('b', {
		url: '/b'
	})

	.endpoint('a.b', {
		url: '/b',

		get: function (req, res) {
			res.send({name: 'b'});
		}
	});
};