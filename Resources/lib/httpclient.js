/**
 * FoodCare City
 * Author: FoodCare Inc. Copyright 2013. All Rights Reserved
 * Provides a basic httpRequest implemnentation for both
 * node and Titanium.
 *
 **/
(function() {

	var working = false;
	var xhr;

	function abort() {
		if (xhr) {
			if (xhr.readyState !== 4 /* Titanium.Network.HTTPClient.DONE */) {
				Ti.API.warn('Aborting Request')
				xhr._aborting = true;
				xhr.abort();
			}
		}
		xhr = null;
	}

	function ti_httpRequest(httpmethod, address, payload, callback) {

		var count = 3;
		var timeout = 5000;
		// 5 seconds to start
		working = true;

		// We only allow one request to be active at a time.
		abort();

		function error_callback(response) {

			if (xhr && xhr._aborting) {
				working = false;
				return;
				// Done if we're aborting
			}

			count = count - 1;
			if (count > 0 && (response.status === 0 || response.status > 500)) {
				// Server down, retry
				timeout = timeout * 1.5;
				setTimeout(function() {
					ti_httpRequest_ex(httpmethod, address, payload, timeout, success_callback, error_callback)
				}, timeout / 2.5);
			} else {
				// can't retry, notify the app
				working = false;
				callback(response);
			}
		}

		function success_callback(response) {
			working = false;
			if (xhr && xhr._aborting)
				return;
			// Done if we're aborting
			callback(response);
		}

		return ti_httpRequest_ex(httpmethod, address, payload, timeout, success_callback, error_callback);
	}

	function ti_httpRequest_ex(httpmethod, address, payload, timeout, cb_success, cb_error) {

		xhr = Ti.Network.createHTTPClient({
			autoEncodeUrl : true,
			async : true
		});
		xhr._aborting = false;
		xhr.setTimeout(timeout);
		Ti.API.warn('=>' + address);
		xhr.open(httpmethod, address, true);
		// last param, async
		// xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.setRequestHeader('x-access-token', '3e5c3751deec7881f913a412475ec186');
		xhr.setRequestHeader('User-Agent', 'EE ' + Titanium.Platform.name + ' ' + Ti.App.getVersion());

		// Error
		xhr.onerror = function() {
			if (xhr._aborting) {
				Ti.API.warn('(onerror) Aborting Request: ' + address)
			} else {
				cb_error({
					status : this.status,
					body : this.responseText
				});
			}
		};

		// Success
		xhr.onload = function() {
			if (xhr._aborting) {
				Ti.API.warn('(onload) Aborting Request: ' + address)
			} else {
				cb_success({
					status : this.status,
					body : this.responseText
				});
			}
		}
		// Send
		if (payload) {
			xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			xhr.send(payload);
		} else {
			xhr.send();
		}

		return xhr;
	}


	ti_httpRequest.abort = abort;
	exports.httpRequest = ti_httpRequest;

})();

