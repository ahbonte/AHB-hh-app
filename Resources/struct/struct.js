/**
 * FoodCare City
 * Author: FoodCare Inc. Copyright 2013. All Rights Reserved
 * Appcelerator Titanium Platform
 * Copyright (c) 2009-2011 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 **/
// Code is stripped-down version of Tweetanium, to expose new structure paradigm

exports.S = ( function() {

		// add utility methods in the "S" namespace
		// @todo refactor this out.
		var S = Ti.App.Util.clone(Ti.App.Util);

		// Get a message from the response or provide a default
		S.getMessage = function(response, default_message) {

			if (response.data)
				if (response.data.message)
					return response.data.message;

			return default_message;

		}
		// Build the app from components
		S.UI = require('/struct/ui/ui').ui;
		S.Log = require('/lib/logger');
		S.Cfg = require('/config').current

		return S;

	}());

