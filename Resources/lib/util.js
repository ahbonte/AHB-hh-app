/**
 * FoodCare City
 * Author: FoodCare Inc. Copyright 2013. All Rights Reserved
 * Methods for common string, date and validation type utilities
 */

(function() {

	var empty = {};

	function str_repeat(i, m) {
		for (var o = []; m > 0; o[--m] = i) {
		};
		return o.join('');
	}

	function mixin(/*Object*/target, /*Object*/source) {
		var name, s, i;
		for (name in source) {
			s = source[name];
			if (!( name in target) || (target[name] !== s && (!( name in empty) || empty[name] !== s))) {
				target[name] = s;
			}
		}
		return target;
		// Object
	};

	/*
	 Branching logic based on OS
	 */
	var osname = Ti.Platform.osname;

	util = {

		os : function(/*Object*/map) {
			var def = map.def || null;
			//default function or value
			if ( typeof map[osname] != 'undefined') {
				if ( typeof map[osname] == 'function') {
					return map[osname]();
				} else {
					return map[osname];
				}
			} else {
				if ( typeof def == 'function') {
					return def();
				} else {
					return def;
				}
			}
		},

		isAndroid : function() {
			if ('android' === Ti.Platform.name) {
				return true;
			} else {
				return false;
			}
		},

		ucwords : function(str) {
			if (null === str)
				return null;
			return (str + '').replace(/^([a-z])|\s+([a-z])/g, function($1) {
				return $1.toUpperCase();
			});
		},

		camelcase : function(str) {
			if (null === str)
				return null;

			str = str + '';

			return util.ucwords(str.toLowerCase());
		},

		clone : function(obj) {
			// Handle the 3 simple types, and null or undefined
			if (null == obj || "object" != typeof obj)
				return obj;

			// Handle Date
			if ( obj instanceof Date) {
				var copy = new Date();
				copy.setTime(obj.getTime());
				return copy;
			}

			// Handle Array
			if ( obj instanceof Array) {
				var copy = [];

				for (var i = 0, len = obj.length; i < len; ++i) {
					copy[i] = util.clone(obj[i]);
				}
				return copy;
			}

			// else Handle other objects Object
			if (1) {// if (obj instanceof Object) {
				var copy = {};
				for (var attr in obj) {
					if (obj.hasOwnProperty(attr))
						copy[attr] = util.clone(obj[attr]);
				}
				return copy;
			}

			//      throw new Error("Unable to copy obj! Its type isn't supported:" + typeof obj);
		},

		mixin : function(/*Object*/obj, /*Object...*/props) {
			if (!obj) {
				obj = {};
			}
			for (var i = 1, l = arguments.length; i < l; i++) {
				mixin(obj, argußments[i]);
			}
			return obj;
			// Object
		},

		//create a new object, combining the properties of the passed objects with the last arguments having
		//priority over the first ones
		combine : function(/*Object*/obj, /*Object...*/props) {
			var newObj = {};
			for (var i = 0, l = arguments.length; i < l; i++) {
				mixin(newObj, arguments[i]);
			}
			return newObj;
		},

		parseDate : function(input, format) {
			format = format || 'yyyy-mm-dd';
			// default format
			var parts = input.match(/(\d+)/g), i = 0, fmt = {};
			// extract date-part indexes from the format
			format.replace(/(yyyy|dd|mm)/g, function(part) {
				fmt[part] = i++;
			});

			return new Date(parts[fmt['yyyy']], parts[fmt['mm']] - 1, parts[fmt['dd']]);
		},

		Date_toYMD : function(date) {
			var year, month, day;
			year = String(date.getFullYear());
			month = String(date.getMonth() + 1);
			if (month.length == 1) {
				month = "0" + month;
			}
			day = String(date.getDate());
			if (day.length == 1) {
				day = "0" + day;
			}
			return year + "-" + month + "-" + day;
		},

		validateEmail : function(email) {
			var re = /\S+@\S+\.\S+/;
			return re.test(email);
		},

		validateZipCode : function(zvalue) {
			zvalue = zvalue.replace(/\D+/, "");

			if (zvalue.length != 5 && zvalue.length != 9)
				return false;

			if (zvalue.length > 5) {
				// z.value = z.value.substr(0,5) + "-" + z.value.substr(5);
				zvalue = zvalue.substr(0, 5);
			}
			return (zvalue);
		},

		//  http://developer.appcelerator.com/question/125317/calculate-apps-density-pixel-width--height-using-titaniumplatformdisplaycapsdpi
		PixelsToDPUnits : function(ThePixels) {
			if (Titanium.Platform.displayCaps.dpi > 160)
				return (ThePixels / (Titanium.Platform.displayCaps.dpi / 160));
			else
				return ThePixels;
		},

		DPUnitsToPixels : function(TheDPUnits) {
			if (Titanium.Platform.displayCaps.dpi > 160)
				return (TheDPUnits * (Titanium.Platform.displayCaps.dpi / 160));
			else
				return TheDPUnits;
		},

		// Date and time
		stringToDateYYYYMMDD : function(value) {

			if (!value)
				return new Date();

			var mydate = value.split("-");
			var oDate = new Date();
			oDate.setFullYear(parseInt(mydate[0], 10), parseInt(mydate[1], 10) - 1, parseInt(mydate[2], 10));
			if (util.isValidDate(oDate)) {
				return oDate;
			} else {
				return new Date();
			}
		},

		/*To return date in format MMM d, YYYY
		 * params: Date()
		 * returns: customized date
		 * @date: 11.05.13
		 */
		dateToStringMMMdYYYY : function(date) {
			var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

			return monthNames[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
		},

		dateToStringYYYYMMDD : function(date) {
			return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
		},

		stringToDate : function(value) {
			if (!value)
				return new Date();

			var mydate = value.split("/");
			var oDate = new Date();
			oDate.setFullYear(parseInt(mydate[2], 10), parseInt(mydate[0], 10) - 1, parseInt(mydate[1], 10));
			if (util.isValidDate(oDate)) {
				return oDate;
			} else {
				return new Date();
			}
		},

		dateToString : function(date) {
			return (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
		},

		isValidDate : function(d) {
			if (Object.prototype.toString.call(d) !== "[object Date]")
				return false;
			return !isNaN(d.getTime());
		},

		findOffset : function(value, data) {
			var sel = 0;

			for (var i = 0; i < data.length; i++) {
				Ti.API.debug('ofset ==' + value + ' ?= ' + data[i]);
				if (value === data[i]) {
					sel = i;
				}
				Ti.API.debug('Offset: ' + sel);
			}

			return sel;
		},
		
		/*To return platform width in integer format
		 * params: none
		 * returns: platform width
		 * @date: 26.04.13
		 */
		getPlatformWidth : function(){
			return parseInt(Titanium.Platform.displayCaps.platformWidth);
		},
		
		/*To return platform height in integer format
		 * params: none
		 * returns: platform height
		 * @date: 26.04.13
		 */
		getPlatformHeight : function(){
			return parseInt(Titanium.Platform.displayCaps.platformHeight);
		},
	};

	exports.util = util;
})();

