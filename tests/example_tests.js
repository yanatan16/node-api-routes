var tests = module.exports = {};

var request = require('request');

// Startup the example server
var port = 8888,
	server = require('../example/server')(port);

function makeTest(method, url, exp_body) {
	return function (test) {
		request({
			json: typeof exp_body !== 'string',
			method: method,
			url: 'http://localhost:'+port+'/api' + url
		}, function (err, res, body) {
			test.ifError(err);
			test.equal(200, res.statusCode);
			if (res.headers.content) {
				test.equal(exp_body, body);
			}
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

tests.inheritance = makeTest('get', '/inheritance', {method:'get', endpoint: 'inheritance', tosay: 'my'});
tests.inheritancePost = makeTest('post', '/inheritance', {method:'post', endpoint: 'inheritance', tosay: 'myyolo'});
tests.inheritanceChain = makeTest('get', '/inheritance/chain', {
  method:'get', endpoint:'inheritance.chain', tosay: 'mynameis'
});
tests.inheritanceChainPost = makeTest('post', '/inheritance/chain', {
  method:'post', endpoint:'inheritance.chain', tosay: 'myyolonameis'
});

tests.reorderA = makeTest('get', '/a/b', {name: 'b'});
tests.reorderB = makeTest('get', '/b/a', {name: 'a'});

tests.authFail = function (test) {
	request('http://localhost:'+port+'/api/authtest', function (err, res, body) {
		test.ifError(err);
		test.equal(403, res.statusCode);
		test.done();
	});
};
tests.authPass = makeTest('get', '/authtest?auth=true', 'authenticated!');
tests.authFail2 = function (test) {
	request('http://localhost:'+port+'/api/authtest2', function (err, res, body) {
		test.ifError(err);
		test.equal(403, res.statusCode);
		test.done();
	});
};
tests.authPass = makeTest('get', '/authtest2?auth=true', 'authenticated!');

tests.final = function (test) {
	server.close(test.done);
};