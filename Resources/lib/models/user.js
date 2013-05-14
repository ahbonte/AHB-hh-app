/**
 * FoodCare City - FoodCare City
 * Author: FoodCare Inc. Copyright 2013. All Rights Reserved
 * @todo: fully seperate datastore from user model
 * fix zipcode storage, which is not stored with
 * profile on the server
 */

(function() {
	var Log = require('lib/logger');
	var FCPapi = require('lib/fcp').api;
	var datastore = require('lib/datastore').datastore;

	setDefaults();

	// full record from server
	var serverdata;

	// This can be sent to FCP update() as-is
	var userdata;

	// We store conditions as a hash rather than array.
	var localdata;

	function setDefaults() {
		serverdata = null;
		userdata = {
			profile : {
				"gender" : '',
				"birthdate" : new Date(),
				"activity_level" : "Sedentary"
			}, // Defaults
			preferences : {
				"geolocate" : "Use Current Location",
				"zipcode" : "",
				"distance" : "5 Miles"
			},
		}
		// localdata = { conditions: {1: true}, sub_conditions: {1: true}, }
		localdata = {
			conditions : {},
			sub_conditions : {},
		}
	}

	var user = {

		getUserConditions : function() {
			return localdata;
		},

		save : function(callback) {
			Log.trace('+user.save');
			Log.print(userdata);

			// Normalize Data and build the profile
			Log.print('copy userdata');
			var user = Ti.App.Util.clone(userdata);
			Log.print(user);
			delete user.id;
			delete user.profile.age;
			delete user.profile.bmi;
			delete user.profile.zipcode;

			try {
				user.profile.birthdate = Ti.App.Util.dateToStringYYYYMMDD(user.profile.birthdate);
			} catch (err) {
				Ti.API.warn("Err:" + err);
			}

			var conditions = [];
			var sub_conditions = [];

			for (var c in localdata.conditions) {
				if (localdata.conditions[c]) {
					conditions.push({
						'id' : c
					});
				}
			}

			for (var s in localdata.sub_conditions) {
				if (localdata.sub_conditions[s]) {
					sub_conditions.push({
						'id' : s
					});
				}
			}

			user.profile.conditions = conditions;
			user.profile.sub_conditions = sub_conditions;

			Log.print('Save User');
			Log.print(user);
			FCPapi.update(user, callback);
		},

		validateConditions : function() {

			var hasCondition = false;

			for (var c in localdata.conditions) {
				if (localdata.conditions[c]) {
					hasCondition = true;
				}
			}

			for (var s in localdata.sub_conditions) {
				if (localdata.sub_conditions[s]) {
					hasCondition = true;
				}
			}

			return hasCondition;
		},

		validateBirthdate : function(bday) {
			try {
				// Validate Date
				var min = new Date();
				min.setYear(min.getFullYear() - 13);

				if (!bday) {
					// We're checking locally
					if (null === userdata.profile.birthdate) {
						return false;
					}
					bday = userdata.profile.birthdate;
				}

				Ti.App.Logger.print(bday);
				Ti.App.Logger.print(min);

				return (bday < min);

			} catch(err) {
				Ti.App.Logger.print("Error: " + err);
			}

			return false;
		},

		validateZipcode : function() {
			var zip = user.getZipcode();

			if (null === zip)
				return false;

			if (false === Ti.App.Util.validateZipCode(zip))
				return false;

			return true;
		},

		getUserDataFromServer : function(callback) {

			// Update fails if we aren't the correct user
			FCPapi.checkUserState(function(response) {
				if (response.success) {
					FCPapi.getUserData(function(response) {
						if (response.success) {
							Log.trace('+setUserData from callback');
							serverdata = response.data;
							Log.print_r(userdata);

							// Put into our internal format
							// minor differences make original record difficult to use
							userdata = Ti.App.Util.clone(serverdata);

							try {
								userdata.profile.birthdate = Ti.App.Util.stringToDateYYYYMMDD(userdata.profile.birthdate);
							} catch (err) {
								Ti.API.warn("Err:" + err);
								userdata.profile.birthdate = new Date();
							}
							delete userdata.profile.conditions;
							delete userdata.profile.sub_conditions;

							var conditions = serverdata.profile.conditions;
							var sub_conditions = serverdata.profile.sub_conditions;

							// Clear out conditions for this user
							localdata = {
								conditions : {},
								sub_conditions : {},
							}

							for (var c = 0; c < conditions.length; c++) {
								var id = conditions[c].id;
								localdata.conditions[id] = true;
							}

							for (var s = 0; s < sub_conditions.length; s++) {
								var id = sub_conditions[s].id;
								localdata.sub_conditions[id] = true;
							}

							datastore.setPreference('distance', userdata.preferences.distance);
							datastore.setPreference('zipcode', userdata.preferences.zipcode);
							datastore.setPreference('geolocate', userdata.preferences.geolocate)

							// Write tests to verify it all
							Log.print(userdata);
							Log.print(localdata);
						}
						callback(response);
						// return the user data to callee
					});
					// get user data
					// end update check success
				} else {
					return callback(response);
				}
			});
			// update check
		},

		setCondition : function(id, value) {
			localdata.conditions[id] = value;
		},

		setSubcondition : function(id, value) {
			localdata.sub_conditions[id] = value;
		},

		getCondition : function(id) {
			if (localdata.conditions[id])
				return true;
			else
				return false;
		},

		getSubcondition : function(id) {
			if (localdata.sub_conditions[id])
				return true;
			else
				return false;
		},

		getUserLocation : function() {
			params = {};
			if (datastore.getPreference('longitude')) {
				params.longitude = datastore.getPreference('longitude');
				params.latitude = datastore.getPreference('latitude');
				return params;
			} else {
				return null;
			}
		},

		isSignedIn : function() {
			Log.trace('+user.isLoggedIn (token): ' + datastore.getProperty('auth_token'));

			if (datastore.getProperty('auth_token')) {
				return true;
			} else {
				return false;
			}
		},

		signout : function() {
			Log.trace('+user.signout');
			FCPapi.signout_ex();
			user.clearAuthentication();
		},

		clearAuthentication : function() {
			datastore.setProperty('id', null);
			datastore.setProperty('auth_token', null);
			setDefaults();
		},

		setProfile : function(values, callback) {
			Log.trace("+User.setProfile");
			userdata.profile = Ti.App.Util.clone(values);
			user.save(callback);
		},

		getProfile : function() {
			Log.trace("+User.getProfile");
			return Ti.App.Util.clone(userdata.profile);
		},

		// location override: Yes, No
		// distance: 1 Mile, 5 Miles, 10 Miles, 25 Miles
		// Zipcode: string

		setLocation : function(data, callback) {
			userdata.preferences.distance = data.distance;
			userdata.preferences.zipcode = data.zipcode;
			userdata.preferences.geolocate = data.geolocate;

			datastore.setPreference('distance', userdata.preferences.distance);
			datastore.setPreference('zipcode', userdata.preferences.zipcode);
			datastore.setPreference('geolocate', userdata.preferences.geolocate)

			user.save(callback);
		},

		getLocation : function() {
			var data = {};

			data.distance = userdata.preferences.distance;
			data.zipcode = userdata.preferences.zipcode;
			data.geolocate = userdata.preferences.geolocate;

			return data;
		},

		setZipcode : function(zipcode) {
			userdata.preferences.zipcode = zipcode;
			datastore.setPreference('zipcode', zipcode);
		},

		getZipcode : function() {
			return datastore.getPreference('zipcode');
		}
	}

	exports.user = user;
})();

