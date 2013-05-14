/**
 * FoodCare City
 * Author: FoodCare Inc. Copyright 2013. All Rights Reserved
 * Loads dish list on map
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
			name : 'mapDishList',
			title : 'Dish List',
			useBackButton : true,

			setData : function(data) {

				var rests = data;

				var longitudeDelta = 0.02;
				var latitudeDelta = 0.02;

				S.Log.trace('+mapDishList setData');

				// Move the map
				var count = rests.length;
				if (count > 10)
					count = 10;
				// show only the first 25

				var address = rests.address;
				// assume sorted by greatest distance

				var longitude = address.longitude;
				var latitude = address.latitude;

				if (datastore.getPreference('longitude')) {
					longitude = datastore.getPreference('longitude');
					latitude = datastore.getPreference('latitude');
				} else {
					longitude = rests.address.longitude;
					latitude = rests.address.latitude;
				}

				longitudeDelta = Math.abs(longitude - address.longitude);
				latitudeDelta = Math.abs(latitude - address.latitude);

				if (latitudeDelta < 0.02)
					latitudeDelta = 0.02;
				if (longitudeDelta < 0.02)
					longitudeDelta = 0.02;

				// This should move the map
				Ti.App.Map.setLocation({
					latitude : latitude - 0.01,
					longitude : longitude,
					latitudeDelta : latitudeDelta * 2.5,
					longitudeDelta : longitudeDelta * 2.5,
					animate : true
				});

				var rest = rests;
				address = rests.address;

				rests.pin = Titanium.Map.createAnnotation({
					latitude : address.latitude,
					longitude : address.longitude,
					title : rest.name,
					userLocation : true,
					pincolor : Titanium.Map.ANNOTATION_RED,
					animate : true,
					myid : rest.id
				});

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

					var pin = rests.pin;

					Ti.App.Logger.print(next);
					Ti.App.Logger.print_r(pin);
					Ti.App.Map.addAnnotation(pin);
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

				Ti.App.addEventListener('app:tab.focus.mapDishList', function(e) {
					S.Log.trace("+mapDishList tab focus ");

					Ti.App.Map.addTo(view);
					Ti.App.Map.clear();
					Ti.App.Map.setRegion();

					S.UI.search({}, '', function(e) {
						L.print('+mapDishList search results');
						page.setData(e.data);
					});
				});

				Ti.App.addEventListener('app:tab.focus.mapDishList_2', function(e) {
					S.Log.trace("+mapalllist tab focus ");

					Ti.App.Map.addTo(view);
					Ti.App.Map.clear();
					Ti.App.Map.setRegion();

					page.setData(e.data);
				});

				Ti.App.addEventListener('app:tab.blur.mapDishList', function(e) {
					S.Log.trace("+mapDishList tab blur ");
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

