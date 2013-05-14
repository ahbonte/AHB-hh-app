/**
 * FoodCare City
 * Author: FoodCare Inc. Copyright 2013. All Rights Reserved
 */
(function() {

	var showAlert = true;
	var datastore = require('/lib/datastore').datastore;

	exports.getLocation = function(callback) {

		Ti.Geolocation.preferredProvider = "gps";
		Ti.Geolocation.purpose = "Find nearby restaurants";
		datastore.setPreference('haslocation', false);

		if (showAlert && Titanium.Geolocation.locationServicesEnabled === false) {
			showAlert = false;
			datastore.setPreference('haslocation', false);

			alert('Location services disabled. Using default.');
			return false;
		}

		if (showAlert && Titanium.Platform.name != 'android') {
			showAlert = false;
			datastore.setPreference('haslocation', false);

			var authorization = Titanium.Geolocation.locationServicesAuthorization;

			if (authorization == Titanium.Geolocation.AUTHORIZATION_DENIED) {
				datastore.setPreference('haslocation', false);
				Ti.UI.createAlertDialog({
					title : 'FoodCare City',
					message : 'You have disallowed geolocation services, using zipcode instead.'
				}).show();

				return false;
			} else if (showAlert && authorization == Titanium.Geolocation.AUTHORIZATION_RESTRICTED) {
				showAlert = false;
				datastore.setPreference('haslocation', false);

				Ti.UI.createAlertDialog({
					title : 'FoodCare City',
					message : 'Your system has restricted use of geolocation services, using default zipcode instead.'
				}).show();
				return false;
			}
		}

		//  SET ACCURACY - THE FOLLOWING VALUES ARE SUPPORTED
		//
		// Titanium.Geolocation.ACCURACY_BEST
		// Titanium.Geolocation.ACCURACY_NEAREST_TEN_METERS
		// Titanium.Geolocation.ACCURACY_HUNDRED_METERS
		// Titanium.Geolocation.ACCURACY_KILOMETER
		// Titanium.Geolocation.ACCURACY_THREE_KILOMETERS

		Titanium.Geolocation.accuracy = Titanium.Geolocation.ACCURACY_KILOMETER;

		//
		//  SET DISTANCE FILTER.  THIS DICTATES HOW OFTEN AN EVENT FIRES BASED ON THE DISTANCE THE DEVICE MOVES
		//  THIS VALUE IS IN METERS
		//
		Titanium.Geolocation.distanceFilter = 1000;

		Titanium.Geolocation.getCurrentPosition(function(e) {

			if (!e.success || e.error) {
				Ti.API.info("GeoLocate Error: " + e.code);
				datastore.setPreference('haslocation', false);
				return;
			}

			datastore.setPreference('longitude', e.coords.longitude);
			datastore.setPreference('latitude', e.coords.latitude);
			datastore.setPreference('haslocation', true);

			if (callback) {
				callback(e.coords);
			}

			Ti.App.Logger.print("LOCATION: " + e.coords.longitude + "," + e.coords.latitude);

			var longitude = e.coords.longitude;
			var latitude = e.coords.latitude;
			var altitude = e.coords.altitude;
			var heading = e.coords.heading;
			var accuracy = e.coords.accuracy;
			var speed = e.coords.speed;
			var timestamp = e.coords.timestamp;
			var altitudeAccuracy = e.coords.altitudeAccuracy;
			Ti.API.info('speed ' + speed);

			Titanium.API.info('geo - current location: ' + new Date(timestamp) + ' long ' + longitude + ' lat ' + latitude + ' accuracy ' + accuracy);
		});
	}
})();
