/**
 * FoodCare City
 * Author: FoodCare Inc. Copyright 2013. All Rights Reserved
 */

(function() {

	var Dish = require('lib/models/dish').dish;

	function createPage(S) {

		var ui = S.UI;

		var eventsViewContainer = {

			name : 'hometown_events',
			title : 'News & Events',

			createView : function(win, events) {

				var view = Ti.UI.createScrollView({
					contentHeight : 'auto',
					contentWidth : 'auto',
					showVerticalScrollIndicator : true,
					showHorizontalScrollIndicator : true,
					backgroundImage : '/images/bg/city.png',
					top : 0,
					left : 0,
				});
				var topBar = Titanium.UI.createView({
					height : '50dp',
					backgroundColor : '#FFFFFF',
					left : '0',
					top : '0',
					layout : 'horizontal',
				});

				var News = Ti.UI.createLabel({
					text : 'News',
					width : '50%',
					height : '100%',
					textAlign : 'center',
					color : 'black',
					font : {
						fontWeight : 'bold',
						fontSize : '17sp'
					},
					backgroundColor : '#F0F0F0',
				});

				var Events = Ti.UI.createLabel({
					text : 'Events',
					width : '50%',
					height : '100%',
					textAlign : 'center',
					color : 'white',
					font : {
						fontWeight : 'bold',
						fontSize : '17sp'
					},
					backgroundColor : '#111F30',
				});

				topBar.add(News);
				topBar.add(Events);

				var view1 = require('/struct/ui/pages/hometown_news').createPage(S).createView(win);
				view1.top = '50';
				var state;

				view1.visible = true;

				view.add(topBar);
				view.add(view1);
				var view2;
				setTimeout(function() {
					view2 = require('/struct/ui/pages/hometown_events').createPage(S).createView(win);
					view2.top = '50';
					view2.visible = false;
					view.add(view2);
				}, 3000);

				News.addEventListener('click', function(e) {
					view1.visible = true;
					view2.visible = false;
					News.backgroundColor = '#F0F0F0';
					News.color = 'black';
					Events.backgroundColor = '#111F30';
					Events.color = 'white';
				});
				Events.addEventListener('click', function(e) {
					view1.visible = false;
					view2.visible = true;
					Events.backgroundColor = '#F0F0F0';
					Events.color = 'black';
					News.backgroundColor = '#111F30';
					News.color = 'white';
				});

				return view;
			}
		}
		return eventsViewContainer;
	};

	exports.createViewContainer = createPage;
	exports.createPage = createPage;

})();

