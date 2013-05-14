/**
 * FoodCare City
 * Author: FoodCare Inc. Copyright 2013. All Rights Reserved
 */

(function() {

	var mapview = Titanium.Map.createView({
		userLocation : true,
		mapType : Titanium.Map.STANDARD_TYPE,
		region : {
			latitude : 39,
			longitude : -98,
			latitudeDelta : 20,
			longitudeDelta : 40
		}
	});
	var events = [];
	var currentView = null;

	var map = {

		addTo : function(view) {
			Ti.App.Logger.print('Map Add');
			if (currentView) {
				currentView.remove(mapview);
			}
			view.add(mapview);
		},

		removeFrom : function(view) {
			Ti.App.Logger.print('Map Remove');
			view.remove(mapview);
			map.clear();
		},

		setRegion : function(region) {
			if (!region) {
				region = {
					latitude : 39,
					longitude : -98,
					latitudeDelta : 20,
					longitudeDelta : 40
				};
			}
			Ti.App.Logger.print_r(region);
			if (!currentView)
				return;

			mapview.setRegion(region);
			// Should zoom, but doesn't'
			region.animate = true;
			mapview.setLocation(region);
		},

		setLocation : function(region) {
			region.animate = true;
			Ti.App.Logger.print_r(region);
			mapview.setLocation(region);
		},

		clear : function() {
			var listener;

			mapview.removeAllAnnotations();
			mapview.annotations = [];

			for ( i = 0; i < events.length; i++) {
				listener = events[i];
				mapview.removeEventListener(listener.evt, listener.callback);
			}
			events = [];
		},

		createAnnotation : function(params) {
			return Ti.Map.createAnnotation(params);
		},

		addAnnotation : function(pin) {
			mapview.addAnnotation(pin);
		},

		addEventListener : function(evt, callback) {
			var listener = {
				evt : evt,
				callback : callback
			};
			events.push(listener);
			mapview.addEventListener(listener.evt, listener.callback);
		}
	}

	exports.map = map;

})();

