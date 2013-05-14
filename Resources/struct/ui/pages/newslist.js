/**
 * FoodCare City
 * Author: FoodCare Inc. Copyright 2013. All Rights Reserved
 */

(function() {

	function createPage(S) {
		var cfg = S.Cfg;

		var page = {
			name : 'newslist',
			title : 'News List',
			useBackButton : true,
			useBackArrow : true,

			createView : function(win, news) {

				var view = Ti.UI.createScrollView({
					contentHeight : 'auto',
					contentWidth : 'auto',
					showVerticalScrollIndicator : true,
					showHorizontalScrollIndicator : true,
					backgroundColor : 'white',
					top : 0,
					left : 0,
					layout : 'vertical'
				});

				var titleBar = Titanium.UI.createView({
					height : '60dp',
					backgroundColor : '#FFFFFF',
					left : '0',
					top : '0',
					layout : 'horizontal',
					borderColor : '#d7d9db',
					backgroundGradient : {
						type : 'linear',
						startPoint : {
							x : 0,
							y : 0
						},
						endPoint : {
							x : 0,
							y : 37
						},
						colors : ['#d7d9db', '#fdfefd'],
						//startRadius: '50%',
						endRadius : 0,
						backfillStart : false
					}
				});
				var labelMessage = Titanium.UI.createLabel({
					text : news.title,
					font : {
						fontSize : '16sp',
						fontWeight : 'bold'
					},
					width : 'auto',
					textAlign : 'left',
					top : '5dp',
					left : '10dp',
					color : 'black'
				});
				titleBar.add(labelMessage);

				var publishedAt = Titanium.UI.createLabel({
					id : 'publishedAt',
					text : Ti.App.Util.dateToStringMMMdYYYY(Ti.App.Util.stringToDateYYYYMMDD(news.published_at)),
					top : '10dp',
					left : '10dp',
					textAlign : 'left',
					font : {
						fontSize : '14sp'
					},
					height : 'auto',
					textAlign : 'center'
				});

				var description = Titanium.UI.createLabel({
					id : 'description',
					text : news.description,
					top : '10dp',
					left : '10dp',
					textAlign : 'left',
					font : {
						fontSize : '14sp'
					},
					height : 'auto',
					textAlign : 'center'
				});
				var link = Titanium.UI.createLabel({
					id : 'link',
					text : news.link,
					top : '10dp',
					left : '10dp',
					textAlign : 'left',
					font : {
						fontSize : '14sp'
					},
					height : 'auto',
					textAlign : 'center',
					color : 'blue'
				});

				link.addEventListener('click', function(e) {
					var w = Titanium.UI.createWindow({
						title : news.title,
						barColor : S.Cfg.barColor,
					});

					w.add(Ti.UI.createWebView({
						url : news.link
					}));

					if (Ti.Platform.name !== 'android') {
						var b = Titanium.UI.createButton({
							title : 'Close',
							style : Titanium.UI.iPhone.SystemButtonStyle.PLAIN
						});
						w.setLeftNavButton(b);
						b.addEventListener('click', function() {
							w.close();
						});
					}

					w.open({
						modal : true
					});
				});

				view.add(titleBar);
				view.add(publishedAt);
				view.add(description);
				view.add(link);

				return view;
			}
		}
		return page;
	}


	exports.createViewContainer = createPage;
	exports.createPage = createPage;

})();
