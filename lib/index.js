// api.js

// vendor
var _ = require('underscore'),
	express = require('express');

module.exports = Api;

function Api (base) {
	this._router = new express.Router();
	this.router = this._router.middleware;
	this.routes = this._router.map;
	this.base = base;
	this.methods = ['get', 'put', 'post', 'delete', 'all', 'options'];
	this.endpoints = {};
}

// The main endpoint creation.
Api.prototype.endpoint = function apiEndpoint(name, info) {
	var endpoint = this.getParent(name);
	if (endpoint) {
		endpoint = this.extend(endpoint, info);
	} else {
		endpoint = info;
	}
	endpoint.name = name;

	if (endpoint.url === undefined) {
		throw new Error("Endpoint " + name + " has no URL!?");
	}

	this.saveEndpoint(endpoint);
	this.exposeEndpoint(endpoint);

	return this;
};

Api.prototype.saveEndpoint = function apiSaveEndpoint(endpoint) {
	this.endpoints[endpoint.name] = endpoint;
};

Api.prototype.exposeEndpoint = function apiExposeEndpoint(endpoint) {
	var url = this.base + endpoint.url,
		app = this._router,
		filtered = _.pick(endpoint, this.methods),
		args = [url];

	if (endpoint.middleware) {
		args = args.concat(endpoint.middleware);
	}

	_.each(filtered, function (handler, method) {
		app[method].apply(app, args.concat(handler));
	});

	if (_.intersection(filtered, ['options', 'all']).length === 0) {
		var options = _.extend(_.omit(endpoint, this.methods, 'middleware'), {
			url: endpoint.url,
			name: endpoint.name,
			help: endpoint.help,
			available: _.keys(filtered)
		});
		app.options(url, function (req, res) {
			res.send(options);
		});
	}
};

Api.prototype.getParent = function apiGetParent(name) {
	var endpoints = this.endpoints;

	var possibles = _.aggjoin(_.initial(name.split('.'))).reverse();

	return _.first(_.filter(_.map(possibles, function (poss) {
		return endpoints[poss];
	}), _.identity));
};

Api.prototype.extend = function apiExtend (parent, child) {
	var url = (parent.url || '') + (child.url || '');
	return _.extend(_.omit(parent, this.methods), child, {url: url});
};

// Add routes to Api by executing a list of function (api) {}
// Usually called via requireAll
Api.prototype.execRoutes = function apiExecRoutes(routes) {
	var api = this;
	_.each(routes, function (route, file) {
		if (_.isFunction(route)) {
			route(api);
		} else if (_.isObject(route)) {
			api.execRoutes(route);
		} else {
			throw new Error('Cant execute route for ' + file);
		}
	});
};

// Helper function to produce error messages.
Api.prototype.error = function apiError (err) {
	if (_.isString(err)) {
		err = new Error(err);
	}

	return {
		error: err.message,
		stack: err.stack
	};
};

Api.prototype.requireAll = function requireAll (opts) {
	var reqAll = require('require-all');
	var routes = reqAll(opts);
	this.execRoutes(routes);
}

_.mixin({
	aggregate: function (seq) {
		return _.reduce(seq, function (memo, a) {
			return memo.concat([(memo.length ? _.last(memo) : []).concat([a])]);
		}, []);
	},
	aggjoin: function (seq, sep) {
		return _.map(_.aggregate(seq), function (x) { return x.join(sep); });
	}
});