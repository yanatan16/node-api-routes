var tests = module.exports = {};

var request = require('request');

// Startup the example server
var server = require('../example/server');

function makeTest(method, url, exp_body) {
	return function (test) {
		request({
			json: typeof exp_body !== 'string',
			method: method,
			url: 'http://localhost:8000/api' + url
		}, function (err, res, body) {
			test.ifError(err);
			if (res.headers.content)
			test.equal(exp_body, body);
			test.done();
		});
	}
}

tests.base = makeTest('get', '', 'base route!');
tests.testGet = makeTest('get', '/test', {method: 'get', endpoint: 'test'});
tests.testPost = makeTest('post', '/test', {method: 'post', endpoint: 'test'});
tests.testPut = makeTest('put', '/test', {method: 'put', endpoint: 'test'});
tests.testDelete = makeTest('delete', '/test', {method: 'delete', endpoint: 'test'});
tests.testOptions = makeTest('options', '/test', {
  "url": "/test",
  "name": "test",
  "help": "Test endpoint.",
  "available": [
    "get",
    "put",
    "post",
    "delete"
  ]
});

tests.test2 = makeTest('get', '/test/123', 'Your user id is 123');

tests.inheritance = makeTest('get', '/inheritance', {method:'get', endpoint: 'inheritance'});
tests.inheritanceChain = makeTest('get', '/inheritance/chain', {
	method:'get', endpoint:'inheritance.chain'
});

tests.authFail = function (test) {
	request('http://localhost:8000/api/authtest', function (err, res, body) {
		test.ifError(err);
		test.equal(403, res.statusCode);
		test.done();
	});
};
tests.authPass = makeTest('get', '/authtest?auth=true', 'authenticated!');
tests.authFail = function (test) {
	request('http://localhost:8000/api/authtest2', function (err, res, body) {
		test.ifError(err);
		test.equal(403, res.statusCode);
		test.done();
	});
};
tests.authPass = makeTest('get', '/authtest2?auth=true', 'authenticated!');

tests.final = function (test) {
	server.close(test.done);
};