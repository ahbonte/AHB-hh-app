/**
 * FoodCare City
 * Author: FoodCare Inc. Copyright 2013. All Rights Reserved
 */

(function() {

	function createPage(S) {
		var cfg = S.Cfg;

		var page = {
			name : 'eventlist',
			title : 'Events List',
			useBackButton : true,
			useBackArrow : true,

			createView : function(win, events) {

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
					borderColor:'#d7d9db',
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
					text : events.name,
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
				var description = Titanium.UI.createLabel({
					id : 'description',
					text : events.description,
					top : '10dp',
					left: '10dp',
					textAlign : 'left',
					font : {
						fontSize : '14sp'
					},
					height : 'auto',
					textAlign : 'center'
				});
				var timings = Titanium.UI.createLabel({
					id : 'timings',
					text : events.link,
					top : 10,
					textAlign : 'left',
					font : {
						fontSize : '14sp'
					},
					height : 'auto',
					textAlign : 'center',
					color : 'blue'
				});

				var address = Titanium.UI.createLabel({
					id : 'address',
					text : events.link,
					top : 10,
					textAlign : 'left',
					font : {
						fontSize : '14sp'
					},
					height : 'auto',
					textAlign : 'center',
					color : 'blue'
				});

				view.add(titleBar);
				view.add(description);
				view.add(timings);

				return view;
			}
		}
		return page;
	}


	exports.createViewContainer = createPage;
	exports.createPage = createPage;

})();
