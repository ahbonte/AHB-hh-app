/**
 * FoodCare City Views
 * Author: FoodCare Inc. Copyright 2013. All Rights Reserved
 **/

(function() {

	function createPage(S) {
		var $$ = S.UI.properties;
		var win = null;

		var loadingScreen = {
			name : 'loading',
			title : 'Loading ...',

			createView : function() {

				var loadingView = Ti.UI.createView(S.combine($$.stretch, {
					visible : false
				}));

				var backdrop = Ti.UI.createView(S.combine($$.stretch, {
					backgroundColor : S.Cfg.color.DarkGrey,
					opacity : 0.60
				}));

				var osname = Ti.Platform.osname;

				var isIos = (osname === 'iphone' || osname === 'ipad');
				var isAndroid = (osname === 'android');

				var sdkVersion = parseFloat(Ti.version);
				var ActivityIndicatorStyle;
				if (isIos) {
					ActivityIndicatorStyle = Titanium.UI.iPhone.ActivityIndicatorStyle;
				} else if (sdkVersion >= 3.0) {
					ActivityIndicatorStyle = Titanium.UI.ActivityIndicatorStyle;
				}

				var indicatorAdded = false
				var actInd = Titanium.UI.createActivityIndicator({
					width : Ti.UI.SIZE,
					height : Ti.UI.SIZE
				});
				loadingView.add(backdrop);
				loadingView.addEventListener('dblclick', S.UI.loader.hide);

				Ti.App.addEventListener('app:show.loader', function() {
					Ti.App.Logger.trace('+Show Loader')
					if (win) {
						Ti.App.Logger.trace('bring to front')
						win.zIndex = 1;
						// Bring to front
						return;
						// don't do this twice
					}

					win = Titanium.UI.createWindow({
						title : 'Loading Test',
						barColor : S.Cfg.barColor,
						zIndex : 1,
					});
					win.add(loadingView);
					if (ActivityIndicatorStyle) {
						actInd.style = ActivityIndicatorStyle.BIG;
					}
					if (indicatorAdded == false) {
						win.add(actInd);
						actInd.show();
						indicatorAdded = true;
					}
					loadingView.visible = true;
					win.open({
						model : true,
						animate : false
					});
				});

				Ti.App.addEventListener('app:hide.loader', function() {
					Ti.App.Logger.trace('+Hide Loader')
					// potential race condition
					if (win) {
						Ti.App.Logger.trace('Win exists, closing');
						actInd.message = null;
						actInd.width = Ti.UI.SIZE;
						actInd.hide();
						win.remove(actInd);
						indicatorAdded = false
						loadingView.visible = false;
						win.close();
						win = null;
					}
				});
				return loadingView;
			}
		}
		return loadingScreen;
	}


	exports.createPage = createPage;
	exports.createViewContainer = createPage;

})();

