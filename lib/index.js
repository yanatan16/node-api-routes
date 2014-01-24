// api.js

// vendor
var _ = require('underscore'),
	express = require('express'),
	debug = require('debug')('api-routes');

module.exports = Api;

function Api (base, opts) {
	this._router = new express.Router();
	this.router = this._router.middleware;
	this.routes = this._router.map;
	this.base = base;
	this.methods = ['get', 'put', 'post', 'delete', 'all', 'options'];
	this.endpoints = {};
	this.shifted = null;

	opts = opts || {};
	this._router.caseSensative = opts.caseSensative || false;
	this._router.strict = opts.strict || false;
}

Api.prototype.shiftToFinalize = function () {
	this.shifted = [];
};

Api.prototype.finalizeRoutes = function () {
	var api = this,
		shifted = this.shifted;

	this.shifted = null;

	_.each(
		_.sortBy(shifted, function (route) { return route.name.split('.').length; }),
		function (route) {
			api.endpoint(route.name, route.info);
		}
	);
};

// The main endpoint creation.
Api.prototype.endpoint = function apiEndpoint(name, info) {
	if (this.shifted !== null) {
		// Wait for the end;
		this.shifted.push({name: name, info: info});
		return this;
	}

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

	var editargs = _.clone(args)
	if (endpoint.edit_middleware) {
		editargs = editargs.concat(endpoint.edit_middleware);
	}

	_.each(filtered, function (handler, method) {
		debug('Exposing endpoint %s at %s %s', endpoint.name, method, url);
		if (_.contains(['put', 'post', 'delete'], method))
			app[method].apply(app, editargs.concat(handler));
		else
			app[method].apply(app, args.concat(handler));
	});

	if (_.intersection(filtered, ['options', 'all']).length === 0 && url.length > 0) {
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

	var possibles = aggjoin(_.initial(name.split('.')), '.').reverse();

	return _.first(_.filter(_.map(possibles, function (poss) {
		return endpoints[poss];
	}), _.identity));
};

Api.prototype.extend = function apiExtend (parent, child) {
	debug('Extending endpoint %s from %s', child.name, parent.name);
	var url = (parent.url || '') + (child.url || '');
	return _.extend(_.omit(parent, this.methods), child, {
		url: url,
		middleware: parent.middleware && child.middleware ?
			[].concat(parent.middleware).concat(child.middleware) :
			child.middleware || parent.middleware,
		edit_middleware: parent.edit_middleware && child.edit_middleware ?
			[].concat(parent.edit_middleware).concat(child.edit_middleware) :
			child.edit_middleware || parent.edit_middleware
	});
};

// Add routes to Api by executing a list of function (api) {}
// Usually called via requireAll
Api.prototype.execRouteFiles = function apiExecRouteFiles(routes) {
	var api = this;
	_.each(routes, function (route, file) {
		if (_.isFunction(route)) {
			route(api);
		} else if (_.isObject(route)) {
			api.execRouteFiles(route);
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
	var routeFiles = reqAll(_.defaults(opts, {
		filter: '(.*)\.js'
	}));
	this.shiftToFinalize();
	this.execRouteFiles(routeFiles);
	this.finalizeRoutes();
}

function aggregate (seq) {
	return _.reduce(seq, function (memo, a) {
		return memo.concat([(memo.length ? _.last(memo) : []).concat([a])]);
	}, []);
}
function aggjoin (seq, sep) {
	return _.map(aggregate(seq), function (x) { return x.join(sep); });
}