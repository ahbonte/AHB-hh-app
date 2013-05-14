/**
 * FoodCare City
 * Author: FoodCare Inc. Copyright 2013. All Rights Reserved
 */

(function() {

	function createPage(S) {

		var page = {
			name : 'cuisinelist',
			title : 'Menu Options',
			useBackButton : true,

			buildRow : function(rowData) {

				rowData.className = 'restaurantViewClass';

				var height = '50dp';
				if (Ti.App.Util.isAndroid()) {
					height = 'auto';
				}

				var row = Ti.UI.createView({
					height : height
				});

				var view = Titanium.UI.createLabel({
					text : Ti.App.Util.camelcase(rowData.name),
					font : {
						fontSize : '17sp',/* fontFamily: Ti.App.Config.fontFamily */
					},
					width : 'auto',
					textAlign : 'left',
					top : '10dp',
					bottom : '5dp',
					height : 'auto',
					left : '45dp',
					color : 'white',
					ellipsize : true
				});
				row.add(view);
				var imageAvatar;
				if (rowData.passes_guidelines) {
					rowData.className = 'restaurantViewClassPass';
					imageAvatar = Ti.UI.createImageView({
						image : '/images/table_icons/like.png',
						left : '10dp',
						top : '10dp',
						width : '25dp',
						height : '25dp'
					});
				} else {
					imageAvatar = Ti.UI.createImageView({
						image : '/images/table_icons/alert.png',
						left : '10dp',
						top : '10dp',
						width : '25dp',
						height : '25dp'
					});
				}
				row.add(imageAvatar);

				return S.UI.createTableViewRow(rowData, row);
			},

			createView : function(win, rest) {

				var restid = rest.id;

				var views = S.UI.createBGTableView('transparent', function(e) {
					S.Log.print('click');
					S.UI.loader.show();
					S.UI.dishdetail(restid, e.rowData.dishid);
				});

				var dishData = [];
				var tableData = [];

				for (var dishidx = 0; dishidx < rest.dishes.length; dishidx++) {
					dishData.push({
						hasChild : true,
						'dishid' : rest.dishes[dishidx].id,
						name : rest.dishes[dishidx].name,
						'passes_guidelines' : rest.dishes[dishidx].passes_guidelines
					});
				}

				rest = null;
				// Free the reference

				var loadData = false;
				var lastRow = 0;

				function displayData() {

					var endRow = lastRow + Ti.App.Config.per_page;
					if (endRow > dishData.length)
						endRow = dishData.length;

					var menuRow = Ti.UI.createView({
						height : '5dp'
					});
					var menuBar = Titanium.UI.createLabel({
						text : 'Menu',
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
					for (var dishidx = lastRow; dishidx < endRow; dishidx++) {
						tableData.push(page.buildRow(dishData[dishidx]));
					}

					lastRow = endRow;
					views.tableView.setData(tableData);

					loadData = false;
				}


				views.tableView.addEventListener('scroll', function(evt) {
					// If we're on android: our total number of rows is less than the first visible row plus the total number of visible
					// rows plus 3 buffer rows, we need to load more rows!
					// ---OR---
					// If we're on ios: how far we're scrolled down + the size of our visible area + 100 pixels of buffer space
					// is greater than the total height of our table, we need to load more rows!
					if (Ti.App.Util.isAndroid() && (evt.totalItemCount < evt.firstVisibleItem + evt.visibleItemCount + 3) || (!Ti.App.Util.isAndroid() && (evt.contentOffset.y + evt.size.height + 100 > evt.contentSize.height))) {
						// tell our interval (above) to load more rows
						if (!loadData) {
							loadData = true;
							S.Log.print("------> Need More Data!!!!");
						}
					}

				});

				setTimeout(function checkSync() {
					// has someone asked us to load data?
					if (loadData === false) {
						// no, return and we'll check again later
						setTimeout(checkSync, 100);
						return;
					}
					Ti.API.warn('LOAD DATA TRIGGERED!');

					if (lastRow < dishData.length) {
						displayData();
						setTimeout(checkSync, 100);
					} else {
						// Add a Row
						tableData.push(Ti.UI.createTableViewRow({
							title : 'Found ' + dishData.length + ' Dishes',
							color : 'white'
						}));
						views.tableView.setData(tableData);
						Ti.API.warn('OUT OF DATA');
					}

					// now we're done; reset the loadData flag and start the interval up again
					loadData = false;
					Ti.API.warn('DATA LOADED!');
				}, 100);

				displayData();
				var _screenH = Ti.App.Util.getPlatformHeight();
				views.mainView.top = _screenH / 2 - 50;
				return views.mainView;
			}
		}
		return page;
	}


	exports.createViewContainer = createPage;
	exports.createPage = createPage;

})();
