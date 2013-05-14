/**
 * FoodCare City - FoodCare City
 * Author: FoodCare Inc. Copyright 2013. All Rights Reserved
 * Provides a basic httpRequest implemnentation for both
 * node and Titanium.
 *
 **/

(function() {

	// A Property is associated with the app, and stored on the phone
	// A preference is associated with the current user, and associated with the current user

	exports.datastore = {

		getPreference : function(prop) {
			var value = null;
			if (Ti.App.Properties.hasProperty(prop)) {
				value = Ti.App.Properties.getString(prop);
			}

			//    Ti.App.Logger.print("GET: " + prop + "," + value);
			return value;
		},

		setPreference : function(prop, value) {
			//    Ti.App.Logger.print("SET: " + prop + "," + value);
			Ti.App.Properties.setString(prop, value)
			return value;
		},

		getProperty : function(prop) {
			if (Ti.App.Properties.hasProperty(prop)) {
				return Ti.App.Properties.getString(prop);
			} else {
				return null;
			}
		},

		setProperty : function(prop, value) {
			Ti.App.Properties.setString(prop, value);
			return value;
		}
	}

})();

