/**
 * FoodCare City
 * Author: FoodCare Inc. Copyright 2013. All Rights Reserved
 */

(function() {

	var Dish = require('lib/models/dish').dish;
	var FCPapi = require('lib/fcp').api;

	function createPage(S) {

		var ui = S.UI;
		var L = S.Log;
		var cfg = S.Cfg;

		var page = {
			name : 'rest',
			title : 'Find Restaurants',
			useTopBar : 'Know of a restaurant missing from our list?',
			useBackButton : true,

			createView : function(win, data) {
				Ti.API.warn('Find Restaurants');
				var rests = data.restaurants;

				var cuisine_type_id = null;
				if (data.cuisine_type_id) {
					cuisine_type_id = data.cuisine_type_id;
				}

				S.Log.print_r(data);

				var tableData = [];
				var menuRow = Ti.UI.createView({
					height : '5dp'
				});
				var menuBar = Titanium.UI.createLabel({
					text : 'Restaurants',
					font : {
						fontSize : '16sp',
						fontWeight : 'bold'
					},
					width : 'auto',
					textAlign : 'left',
					top : '5dp',
					bottom : '5dp',
					height : 'auto',
					left : '5dp',
					color : 'white',
					backgroundColor : 'none',
				});
				tableData.push(S.UI.createTableViewRow({
					backgroundColor : '#E8E8E8'
				}, menuRow));
				tableData.push(S.UI.createTableViewRow({
					backgroundColor : '#14141F'
				}, menuBar));

				for (var restidx = 0; restidx < rests.length; restidx++) {
					var rest = rests[restidx];
					tableData.push(this.buildRow(rest, {
						hasChild : true,
						restid : rest.id
					}));
				}

				var views = S.UI.createBGTableView('transparent', function(e) {
					// Killing the timer breaks the back button.
					//        if (timer1) clearTimeout(timer1); // stop checking for new data
					FCPapi.abort();
					// Kill any pending requests
					S.UI.dishlist(e.rowData.restid);
				});

				var mainView = views.mainView;
				var tableView = views.tableView;
				tableView.setData(tableData);

				var lastRow = 0, loadData = true;
				lastRow = rests.length;

				var timer1 = setTimeout(function checkSync() {
					timer1 = null;

					// has someone asked us to load data?
					if (loadData === false) {
						// no, return and we'll check again later
						timer1 = setTimeout(checkSync, 200);
						return;
					}
					Ti.API.warn('LOAD DATA TRIGGERED!');

					Ti.App.Logger.print('lastRow:' + lastRow + ">=" + rests.restaurant_count);

					if (lastRow >= rests.restaurant_count) {
						Ti.API.warn('OUT OF DATA!');
						return;
					}

					var showloader = Ti.App.showloader;
					Ti.App.showloader = false;

					var params = {
						per_page : Ti.App.Config.per_page,
						page : Math.ceil(lastRow / Ti.App.Config.per_page) + 1
					};
					if (cuisine_type_id) {
						params['cuisine_type_id'] = cuisine_type_id;
					}

					FCPapi.search(params, function(data) {

						Ti.API.warn('Restaurant Return');
						S.Log.print_r(data);

						// we got our data; push some new rows
						Ti.App.showloader = showloader;
						S.UI.loader.hide();

						if (!data.success) {
							S.Log.print('Warning: data retrieve failure');
							return;
						}

						var rests = data.data.restaurants;
						var rest_count = data.data.restaurant_count;

						for (var restidx = 0; restidx < rests.length; restidx++) {
							var rest = rests[restidx];
							tableData.push(page.buildRow(rest, {
								hasChild : true,
								restid : rest.id
							}));
						}

						lastRow = lastRow + rests.length;
						Ti.API.warn('Last Row:' + lastRow);
						Ti.API.warn('Rests:' + rest_count);

						// now we're done; reset the loadData flag and start the interval up again
						loadData = false;
						if (lastRow < rest_count) {
							timer1 = setTimeout(checkSync, 200);
						} else {
							// Add a Row
							tableData.push(Ti.UI.createTableViewRow({
								title : 'Found ' + tableData.length + ' Restaurants',
								color : 'white',
								opacity : 0.8
							}));
							Ti.API.warn('OUT OF DATA');
						}
						tableView.setData(tableData);
					})
				}, 200);

				tableView.addEventListener('scroll', function(evt) {
					// If we're on android: our total number of rows is less than the first visible row plus the total number of visible
					// rows plus 3 buffer rows, we need to load more rows!
					// ---OR---
					// If we're on ios: how far we're scrolled down + the size of our visible area + 100 pixels of buffer space
					// is greater than the total height of our table, we need to load more rows!
					if (Ti.App.Util.isAndroid() && (evt.totalItemCount < evt.firstVisibleItem + evt.visibleItemCount + 3) || (!Ti.App.Util.isAndroid() && (evt.contentOffset.y + evt.size.height + 100 > evt.contentSize.height))) {
						// tell our interval (above) to load more rows
						if (!loadData) {
							loadData = true;
							S.Log.print("------> Want More Data!!!!");
						}
					}

				});
				var _screenH = Ti.App.Util.getPlatformHeight();
				views.mainView.top = _screenH / 2 - 50;
				return mainView;

			},

			buildRow : function(rest, rowData) {

				// A rest is Restaurant entity defined by Food Care
				// Big assumption here!
				rowData.className = 'restaurantClass';

				// One decimal place for distance
				var distance = rest.address.distance;
				var rounded = Math.round(distance * 10) / 10;
				distance = rounded.toFixed(1);

				var description = Dish.getRestaurantDescription(rest) || ' ';
				// Description of Rest';

				if (Ti.App.Util.isAndroid()) {
					height = 'auto';
				} else {
					height = '40dp';
				}

				var rowView = Titanium.UI.createView({
					height : height,
					width : '100%',
					top : 0,
					left : 0,
				});

				var header = rest.name;
				/*if (rest.matched_dishes > 0)
				 {
				 header = '(' + rest.matched_dishes + ') ' + rest.name;
				 }*/

				rowView.add(Titanium.UI.createLabel({
					text : header,
					font : {
						fontSize : '17sp', /*fontFamily: cfg.fontFamily*/
					},
					width : 'auto',
					textAlign : 'left',
					top : '2dp',
					height : '18dp',
					left : '5dp',
					color : 'white',
				}));

				rowView.add(Titanium.UI.createLabel({
					text : description,
					font : {
						fontSize : '12sp'
					},
					width : 'auto',
					textAlign : 'left',
					top : '22dp',
					left : '5dp',
					color : 'white',
				}));

				rowView.add(Titanium.UI.createLabel({
					text : ' ', // description,
					font : {
						fontSize : '6sp'
					},
					width : 'auto',
					textAlign : 'left',
					top : '34dp',
					left : '5dp',
					color : 'white',
				}));

				rowView.add(Titanium.UI.createLabel({
					text : distance + ' Miles',
					font : {
						fontSize : '14sp'
					},
					width : 'auto',
					textAlign : 'right',
					right : '5dp',
					color : 'white',
				}));

				return S.UI.createTableViewRow(rowData, rowView);

			},
		}

		return page;
	}


	exports.createViewContainer = createPage;
	exports.createPage = createPage;

})();

