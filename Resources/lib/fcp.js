/**
 * FoodCare City
 * Author: FoodCare Inc. Copyright 2013. All Rights Reserved
 * Methods to abstract various API calls
 */

(function() {

	var inSearch = false;

	var httpRequest = require('lib/httpclient').httpRequest;
	var datastore = require('lib/datastore').datastore;
	var Log = require('lib/logger');
	var cfg = require('config').current;

	var api = {

		default_callback : function(response) {
			Log.print('+++ Data Received' + ' ' + response.method);
			Log.print_r(response);
			Log.print('--- Data Received');
		},

		healthcheck : function(callback) {
			this.callapi('healthcheck', 'GET', {}, callback);
		},

		createAccount : function(user, callback) {
			var params = {
				user : JSON.stringify(user)
			}
			this.callapi('users', 'POST', params, callback);
		},

		signin : function(user, callback) {
			var params = {
				user : JSON.stringify(user)
			}
			this.callapi('signin', 'POST', params, function(response) {
				if (response.success) {
					datastore.setProperty('id', response.data.id);
					datastore.setProperty('auth_token', response.data.auth_token);
				}
				callback(response);
			});
		},

		signout : function() {
			Ti.App.signout = 1;
			// Mark we are signed out on purpose
			this.callapi('signout', 'DELETE', {}, null);
			datastore.setProperty('id', null);
			datastore.setProperty('auth_token', null);
		},

		passwordReset : function(user, callback) {
			Log.trace('+api.passwordReset');
			Log.print_r(user);
			var params = {
				user : JSON.stringify(user)
			}
			this.callapi('passwords/reset', 'POST', params, callback);
		},

		update : function(user, callback) {
			var params = {
				user : JSON.stringify(user)
			}

			var id = datastore.getProperty('id');
			if (!id) {
				if (callback)
					callback({
						success : false
					});
				return;
			}
			this.callapi('users/' + id, 'PUT', params, callback);
		},

		// are we REALLY logged in? scuccess true if we are
		checkUserState : function(callback) {
			var params = {
				user : JSON.stringify({})
			}

			var id = datastore.getProperty('id');
			if (!id) {
				if (callback)
					callback({
						success : false
					});
				return;
			}
			this.callapi('users/' + id, 'PUT', params, callback, false, true);
		},

		getUserData : function(callback) {
			var params = {};
			var id = datastore.getProperty('id');
			if (!id) {
				if (callback)
					callback({
						success : false
					});
				return;
			}
			this.callapi('users/' + id, 'GET', params, callback);
		},

		getCuisineTypes : function(callback) {
			var params = {};
			this.callapi('cuisine_types', 'GET', params, callback, false);
		},

		//Gets hometown news for News & Events screen
		getHometownNews : function(callback) {
			var params = {};
			this.callapi('v2/hometown_news', 'GET', params, callback, false);
		},

		//Gets hometown events for News & Events screen
		getHometownEvents : function(callback) {
			var params = {};
			this.callapi('v2/hometown_events', 'GET', params, callback, false);
		},

		//Gets news id for single news
		getHometownID : function(id, callback) {
			var params = {};
			this.callapi('v2/hometown_news/' + id, 'GET', params, callback);
		},

		//Gets event id for single event
		getHometownEventsID : function(id, callback) {
			var params = {};
			this.callapi('v2/hometown_events/' + id, 'GET', params, callback);
		},

		//Gets all available health resources, CommunityChampion, EducationTip, Program
		getHealthResources : function(callback) {
			var params = {};
			this.callapi('v2/health_resources', 'GET', params, callback);
		},

		getRestaurants : function(params, callback) {
			if (!params) {
				params = {};
			}
			this.callapi('restaurants', 'GET', params, callback, true);
		},

		getRestaurant : function(id, callback) {
			var params = {};
			this.callapi('restaurants/' + id, 'GET', params, callback);
		},

		getDishes : function(params, callback) {
			if (!params) {
				params = {};
			}
			this.callapi('dishes', 'GET', params, callback, true);
		},

		getDish : function(id, callback) {
			var params = {};
			this.callapi('dishes/' + id, 'GET', params, function(result) {
				// Make sure we return the dish.id
				if (result.success) {
					if (!result.data.id) {
						result.data.id = id;
					}
				}
				callback(result);
			});
		},

		getZipLocation : function(zipcode, callback) {
			this.callapi('zipcode/' + zipcode + '/coordinates', 'GET', {}, callback, false, true);
		},

		// @todo could be cached
		getConditions : function(callback) {
			var params = {};
			this.callapi('conditions', 'GET', params, callback);
		},

		kudos : function(params, callback) {
			if (!params) {
				params = {};
			}
			params.service = 'kudos';
			this.callapi('restaurants/kudos', 'POST', params, callback);
		},

		echo : function(params, callback) {
			if (!params) {
				params = {};
			}

			this.callapi('echo', 'GET', params, callback);
		},

		log : function(params, callback) {
			if (!params) {
				params = {};
			}
			this.callapi('log', 'GET', params, callback);
		},

		nominate : function(params, callback) {
			if (!params)
				params = {};
			params.service = 'nominate';
			this.callapi('log', 'GET', params, callback);
		},

		grantaccess : function(params, callback) {
			if (!params)
				params = {};
			params.service = 'grantaccess';
			this.callapi('users/access/grant', 'POST', params, callback);
		},

		// Search is implemented in terms of getRestaurants
		search : function(params, callback) {

			inSearch = true;
			if (!params)
				params = {};
			if (!params.per_page) {
				params.per_page = cfg.per_page;
			}

			this.getRestaurants(params, function(result) {
				if (params.cuisine_type_id) {
					result.data.cuisine_type_id = params.cuisine_type_id;
				}
				callback(result);
				inSearch = false;
			});

		},

		// Status 401 is a forceful signout
		// localEcho is for testing, and can be used to stub out many other functions
		localEcho : function(params, callback) {
			var method = 'echo';
			if (params.method) {
				method = params.method;
			}
			setTimeout(function() {
				callback.call(this, {
					status : 200,
					data : params,
					method : method,
					params : params
				})
			}, 500);
		},

		callapi : function(method, http_method, postdata, callback, needLocation, checkState) {
			Log.trace('+callapi: ' + method);

			if (Ti.App.showloader) {
				Ti.App.fireEvent('app:show.loader');
			}

			var url = Ti.App.api_url + method + '?access_token=' + cfg.access_token + '&';
			var query = '';
			var rdata = '';
			var params = {};
			var request_data = {};

			if (!callback) {
				callback = this.default_callback;
			}

			if (datastore.getProperty('auth_token'))
				params.auth_token = datastore.getProperty('auth_token');

			// Determine Location & Distance
			if (true) {

				if ('Use Current Location' === datastore.getPreference('geolocate')) {
					if (datastore.getPreference('longitude')) {
						params.longitude = datastore.getPreference('longitude');
						params.latitude = datastore.getPreference('latitude');
					}
				}

				// Send a zipcode unless we have a location
				if (!params.longitude) {
					if (datastore.getPreference('zipcode'))
						params.zip = datastore.getPreference('zipcode');

					if (!params.zip && needLocation) {
						// Massive error, stop right here
						callback.call(this, {
							status : false,
							message : 'Cannot determine location. Please enter your zipcode in the location preferences.'
						});
						return;
					}

				}

				var distance_string = datastore.getPreference('distance');
				if (distance_string) {
					Ti.App.Logger.print('GET DISTANCE:' + distance_string);
					params.distance = parseInt(distance_string);
					Ti.App.Logger.print('DISTANCE:' + params.distance);
				} else {
					//default distance preference is 5 Miles
					params.distance = 5;
				}

				//default distance preference is 5 Miles
				if (isNaN(params.distance))
					params.distance = 5;
				if (null === params.distance)
					params.distance = 5;
			}

			Log.print_r(params);

			Log.log("");
			Log.log('=== REQUEST ====');
			Log.log(http_method + ' ' + method);
			Log.log(url);
			Log.log(params)
			Log.log(postdata);

			// Encode data
			for (var n in params) {
				query = query + n + '=' + encodeURIComponent(params[n]) + '&';
				request_data[n] = params[n];
			}

			for (var n in postdata) {
				rdata = rdata + n + '=' + encodeURIComponent(postdata[n]) + '&';
				request_data[n] = postdata[n];
			}
			rdata = rdata.replace(/\&$/, '');

			if ((http_method === 'GET') || (http_method === 'DELETE')) {
				query = query + rdata;
				rdata = null;
			}

			if (method.indexOf("hometown") == -1 && method.indexOf("resources") == -1) {
				url = url + query;
			}
			url = url.replace(/\&$/, '');
			Log.print("->" + url);

			httpRequest(http_method, url, rdata, function(response) {
				Log.trace("= Request Return =: " + response.status);
				Log.print_r(response);

				response.method = method;
				response.params = request_data;

				try {
					response.data = JSON.parse(response.body);
				} catch(error) {
					response.data = {};
					// or null?
				}

				if (response.status > 0 && response.status < 400) {
					response.success = true;
				} else {
					response.success = false;
				}

				// don't perform this test in userCheckState because a
				// 401 is a valid false response

				if (response.status === 401 && !checkState) {
					// The Server thinks we've signed out!
					datastore.setProperty('id', null);
					datastore.setProperty('auth_token', null);
					Ti.App.fireEvent('app:user.signout');
					return;
				}

				if (response.status === 503 || response.status === 0) {
					// The server is down. no data was returned
					response.data = {};
					response.data.message = 'We are currently experiencing too much traffic to our servers.' + 'Please wait a few moments and try again.';
				}
				delete response.body;
				Log.log('=== RESPONSE ====');
				Log.log(response);
				Log.log('');

				Log.print_r(response);
				if (!callback) {
					// should never get here
					Log.print('ERROR: API callback is null!!');
					return;
				}
				try {
					Log.trace('+api callback');
					callback.call(this, response);
				} catch(error) {
					Log.trace('callback exception: ' + error);
				}
			});
		},

		abort : function() {
			httpRequest.abort();
		},

		signout_ex : function() {
			Log.trace('signout_ex');

			var auth_token = datastore.getProperty('auth_token');
			if (!auth_token)
				return;

			var url = Ti.App.api_url + 'signout?access_token=' + cfg.access_token + '&auth_token=' + encodeURIComponent(auth_token);

			datastore.setProperty('id', null);
			datastore.setProperty('auth_token', null);

			Log.print("->" + url);
			httpRequest('DELETE', url, {}, function() {
			});
		}
	}
	exports.api = api;

})();
