/**
 * FoodCare City Views
 * Author: FoodCare Inc. Copyright 2013. All Rights Reserved
 */

(function() {

	var datastore = require('lib/datastore').datastore;

	function createPage(S) {

		var L = S.Log;
		var ui = S.UI;
		var Cfg = S.Cfg;

		var mapview;
		var view;
		var address;
		var annotations = [];

		var page = {
			name : 'mapall',
			title : 'View Location',
			useBackButton : true,

			mapList : function(data) {
				Ti.App.Map.addTo(view);
				Ti.App.Map.clear();
				Ti.App.Map.setRegion();
				page.setData(data);
			},

			setData : function(data) {

				var rests = data.restaurants;

				var longitudeDelta = 0.02;
				var latitudeDelta = 0.02;

				S.Log.trace('+mapall setData');

				// Move the map
				var count = rests.length;
				if (count > 10)
					count = 10;
				// show only the first 25

				var address = rests[count - 1].address;
				// assume sorted by greatest distance

				var longitude = address.longitude;
				var latitude = address.latitude;

				if (datastore.getPreference('longitude')) {
					longitude = datastore.getPreference('longitude');
					latitude = datastore.getPreference('latitude');
				} else {
					longitude = rests[0].address.longitude;
					latitude = rests[0].address.latitude;
				}

				longitudeDelta = Math.abs(longitude - address.longitude);
				latitudeDelta = Math.abs(latitude - address.latitude);

				if (latitudeDelta < 0.02)
					latitudeDelta = 0.02;
				if (longitudeDelta < 0.02)
					longitudeDelta = 0.02;

				// This should move the map
				// Ti.App.Map.setRegion({latitude: latitude, longitude: longitude, latitudeDelta: latitudeDelta * 2.5, longitudeDelta: longitudeDelta *2.5});
				Ti.App.Map.setLocation({
					latitude : latitude - 0.01,
					longitude : longitude,
					latitudeDelta : latitudeDelta * 2.5,
					longitudeDelta : longitudeDelta * 2.5,
					animate : true
				});

				for ( i = 0; i < count; i++) {
					var rest = rests[i];
					address = rests[i].address;

					rests[i].pin = Titanium.Map.createAnnotation({
						latitude : address.latitude,
						longitude : address.longitude,
						title : rest.name,
						userLocation : true,
						pincolor : Titanium.Map.ANNOTATION_RED,
						animate : true,
						myid : rest.id
					});
				}

				Ti.App.Map.addEventListener('click', function(e) {
					L.print('Map Navigate - Click');
					if (e.clicksource !== 'pin') {
						if (e.annotation.myid) {
							S.UI.dishlist(e.annotation.myid);
						}
					}
				});

				var timeout = 200;

				var addpin = function(next) {
					if (next >= count)
						return;

					var pin = rests[next].pin;

					Ti.App.Logger.print(next);
					Ti.App.Logger.print_r(pin);
					Ti.App.Map.addAnnotation(pin);
					setTimeout(function() {
						addpin(next + 1)
					}, timeout);
				}
				setTimeout(function() {
					S.UI.loader.hide();
				}, 1000);

				// Wait for map to update before adding pins
				setTimeout(function() {
					addpin(0);
				}, 3000);
			},

			createView : function(win, data) {
				view = ui.createView();

				var loadData;
				//Whenever view is on focus it loads the restaurants data
				Ti.App.addEventListener('app:tab.focus.mapall', function(e) {
					S.Log.trace("+mapall tab focus ");

					Ti.App.Map.addTo(view);
					Ti.App.Map.clear();

					Ti.App.Map.setRegion();
					if ( typeof loadData != 'undefined') {
						page.setData(loadData);
					} else {

						S.UI.search({}, '', function(e) {
							L.print('+mapall search results');
							loadData = e.data;
							page.setData(e.data);
						});
					}

				});

				Ti.App.addEventListener('app:tab.blur.mapall', function(e) {
					S.Log.trace("+mapall tab blur ");
					Ti.App.Map.removeFrom(view);
				});

				return view;
			},
		}

		S.Log.print_r(page);
		return page;
	}


	exports.createViewContainer = createPage;
	exports.createPage = createPage;

})();

