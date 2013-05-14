/**
 * FoodCare City
 * Author: FoodCare Inc. Copyright 2013. All Rights Reserved
 */

(function() {

	var FCPapi = require('lib/fcp').api;
	var Dish = require('lib/models/dish').dish;

	function createPage(S) {

		var ui = S.UI;

		var newsViewContainer = {

			name : 'hometown_news',
			title : 'News',

			createView : function(win) {
				Ti.App.Logger.trace('+news_list');
				Ti.App.fireEvent('app:show.loader');
				FCPapi.getHometownNews(function(response) {
					var tableData = [];
					var news = response.data;
					for ( i = 0; i < news.hometown_news.length; i++) {
						var news_type = news.hometown_news[i];
						if (news_type.title && news_type.id) {// protect against null data
							// var row  = Ti.UI.createTableViewRow();
							tableData.push(newsViewContainer.buildRow(news_type.title, news_type.published_at, news_type.id, {
								hasChild : true,
								news_type_id : news_type.id
							}));
						}
					}
					// S.UI.loader.hide();
					views.tableView.setData(tableData);
				});

				var views = S.UI.createBGTableView('', function(e) {
					FCPapi.abort();
					// Kill any pending requests
					S.UI.hometownNewsList(e.rowData.news_type_id);
				});

				return views.mainView;
			},
			buildRow : function(title, published_at, news_type_id, rowData) {

				if (Ti.App.Util.isAndroid()) {
					height = 'auto';
				} else {
					height = '60dp';
				}

				var rowView = Titanium.UI.createView({
					height : height,
					width : '100%',
					top : 0,
					left : 0,
				});

				rowView.add(Titanium.UI.createLabel({
					text : title,
					font : {
						fontSize : '15sp',
						fontWeight : 'bold'
					},
					width : 'auto',
					textAlign : 'left',
					top : '10dp',
					height : '18dp',
					left : '5dp',
					color : 'white',
				}));

				rowView.add(Titanium.UI.createLabel({
					text : Ti.App.Util.dateToStringMMMdYYYY(Ti.App.Util.stringToDateYYYYMMDD(published_at)),
					font : {
						fontSize : '12sp'
					},
					width : 'auto',
					textAlign : 'left',
					top : '30dp',
					left : '5dp',
					color : 'white',
				}));

				return S.UI.createTableViewRow(rowData, rowView);

			},
		}
		return newsViewContainer;
	};

	exports.createViewContainer = createPage;
	exports.createPage = createPage;

})();

