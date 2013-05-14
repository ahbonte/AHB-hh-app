/**
 * FoodCare City
 * Author: FoodCare Inc. Copyright 2013. All Rights Reserved
 * Provides a basic httpRequest implemnentation for both
 * node and Titanium.
 *
 **/

(function() {

	if ('undefined' !== typeof Ti) {

		var console = {
			info : Ti.API.info,
			log : Ti.API.log,
			trace : Ti.API.log,
			error : Ti.API.error,
			warn : Ti.API.warn,
		}

	}

	function ti_print(/*String*/msg) {
		if ('string' !== typeof msg && Ti.App.Util.isAndroid()) {
			return print_r(msg);
		}

		if ('undefined' !== typeof Ti) {
			Ti.API.info(msg);
		} else {
			console.log(msg);
		}
	}

	function node_print(/*String*/msg) {
		if ('undefined' !== typeof Ti) {
			Ti.API.info(msg);
		} else {
			console.log(msg);
		}
	}

	var print = null;

	if ('undefined' !== typeof Ti) {
		print = ti_print;
	} else {
		print = node_print;
	}

	function print_r(/*Object*/msg) {
		var m = '';
		if (msg) {
			m = JSON.stringify(msg).slice(0, 2048);
		} else {
			m = '*NULL';
		}
		print(m);
	}

	function stub() {
	}


	exports.debug = stub;
	exports.trace = stub;
	exports.node = stub;
	exports.log = stub;
	exports.print = stub;
	// print;
	exports.print_r = stub;
	// print_r;

	exports.print = print;
	exports.print_r = print_r;

	exports.debug = print;
	exports.trace = print;

	if ('undefined' === typeof Ti) {
		exports.print = function(e) {
		}
		exports.print_r = function(e) {
		}
		exports.debug = function(e) {
		}
		exports.trace = function(e) {
		}
		exports.node = print;
		exports.log = console.log;
	}

	exports.console = console;

	// console.log, console.debug, console.info, console.warn, and console.error.

})();
