/**
 * FoodCare City Views
 * Author: FoodCare Inc. Copyright 2013. All Rights Reserved
 *
 **/
(function() {

	var user = require('lib/models/user').user;
	var S;
	// Our App
	var FCPapi = require('lib/fcp').api;
	var location = require('lib/location');
	var sound;
	// opening MP3, crashes Android if it goes out of scope before done playing.
	var customUI = require('ui/windows/components');
	var Dish = require('lib/models/dish').dish;
	var cfg;

	var ui = {

		viewList : {},
		loggedIn : false,

		init : function(MyApp) {
			S = MyApp;
			cfg = S.Cfg;
		},

		loadPages : function(/*Array*/pages) {
			var pageName = 'loading';

			var page = require("/struct/ui/pages/" + pageName).createViewContainer(S, ui);
			page.name = pageName;

			ui.viewList['loading'] = page;
			ui.viewList['loading'].createView();
		},

		getPage : function(pageName) {

			try {
				var page = require("/struct/ui/pages/" + pageName).createViewContainer(S, ui);

				page.name = pageName;
				return S.combine(pageClass, page);
				//    page.prototype = pageClass;

				return page;
			} catch(err) {
				var msg = 'Err: (' + pageName + '): ' + err
				S.Log.print_r(msg);
				throw (err);
			}
		},

		getWindow : function(pageName) {
			var page = ui.getPage(pageName);
			if (!page) {
				alert('Error: Cannot Find Page:' + pageName);
			}
			// set appropriate context
			return page.getWindow.call(page);
		},
		
		/* Opens the home screen with map on top and menu grid on bottom 
		 * params: NA
		 * returns: NA
		 * @date: 23.04.13
		 */
		openDashboard : function() {
			S.Log.trace('+openDashboard');
			Ti.App.showloader = Ti.App.Config.showloader;

			var NavigationController = require('/struct/ui/NavigationController').NavigationController;
			var controller = new NavigationController();

			var page = ui.getPage('mapall');
			location.getLocation(function(e) {
				Ti.API.info('Location Loaded');
			});
			page.useBackButton = false;
			var win = page.getWindow.call(page);
			//focus to load restaurants pins on map
			win.addEventListener('focus', function() {
				Ti.App.fireEvent('app:tab.focus.' + 'mapall', {name : 'bar'});
			});
			//blur to close current map as android does not support multiple map at same time
			win.addEventListener('blur', function() {
				Ti.App.fireEvent('app:tab.blur.' + 'mapall');
			});
			Ti.App.fireEvent('app:tab.focus.' + 'mapall', {
				name : 'bar'
			});

			var page1 = require("/struct/ui/pages/masterview").createPage(S).createView();
			win.add(page1);

			try {
				Ti.UI.setBackgroundColor('#000');
				ui.mainwindow = controller.init(win);
			} catch(err) {
				S.Log.debug(err);
			}

			if (ui.mainController) {
				ui.mainController.home();
			}

			ui.controller = controller;
			ui.mainController = controller;
		},

		openNavController : function() {
			S.Log.trace('+openNavController');
			Ti.App.showloader = Ti.App.Config.showloader;

			var NavigationController = require('/struct/ui/NavigationController').NavigationController;
			var controller = new NavigationController();

			var page = ui.getPage('welcome');
			page.useBackButton = false;
			var win = page.getWindow.call(page);

			try {
				Ti.UI.setBackgroundColor('#000');
				ui.mainwindow = controller.init(win);
			} catch(err) {
				S.Log.debug(err);
			}

			if (ui.mainController) {
				ui.mainController.home();
			}

			ui.controller = controller;
			ui.mainController = controller;
		},

		// This is a forced signout - the token has expired
		// in the middle of our session
		forced_signout : function() {
			S.Log.print('+user has been logged out.');
			S.UI.loader.hide();
			Ti.App.signout = 0;

			S.UI.createAlertDialog(null, 'The current session has ended. Please sign in again.', function(e) {
				ui.signout();
			}).show();

			Ti.App.showloader = Ti.App.Config.showloader;
		},

		signout : function(keep_signed_in) {
			// User has clicked the signout button
			Ti.App.Logger.trace('+ui.signout');
			FCPapi.abort();
			// Abort any pending requests

			if (!keep_signed_in) {
				user.signout();
			}

			if (! Ti.App.Util.isAndroid()) {
				return ui.openNavController();
			}

			// Android Only - clean up
			ui.viewList['loading'] = null;
			ui.removeEventListeners();
			setTimeout(ui.exit, 500);
		},

		exit : function() {
			S.Log.trace("+ui.exit");
			if (Ti.App.Util.isAndroid()) {
				try {
					S.Log.trace("+ui.exit.activity.finish");
					// This should just close the application,
					// but sometimes in barfs with an Invalid Index
					var activity = Titanium.Android.currentActivity;
					if (activity)
						activity.finish();
					S.Log.trace("-ui.exit.activity.finish");
				} catch (err) {
					S.Log.print('ERR Closing Current Activity');
					S.Log.print_r(err);
				}
			}
			S.Log.trace("-ui.exit");
		},

		addEventListeners : function() {

			ui.app_listeners = [['app:navigate', S.UI._navigate], ['app:user.signout', S.UI.forced_signout], ['app.showkudos', S.UI.showKudos]];

			for ( i = 0; i < ui.app_listeners.length; i++) {
				Ti.App.addEventListener(ui.app_listeners[i][0], ui.app_listeners[i][1]);
			}
		},

		removeEventListeners : function() {
			S.Log.trace("+ui.removeEventListeners");
			for ( i = 0; i < ui.app_listeners.length; i++) {
				Ti.App.removeEventListener(ui.app_listeners[i][0], ui.app_listeners[i][1]);
			}
			ui.applisteners = [];
		},

		run : function(main) {
			S.Log.trace('+ui.run');
			// Everyone starts with Navigation Controller
			// create NavigationController which will drive our application
			S.Log.trace('1. +ui.run');

			Ti.App.showloader = false;
			if (user.isSignedIn()) {
				// See if we're still logged in
				user.getUserDataFromServer(function(response) {
					if (response.success) {
						ui.openDashboard();
						ui.addEventListeners();
						return;
					} else {
						// Make signout explict
						user.clearAuthentication();
						ui.openNavController();
						ui.addEventListeners();
						return;
					}
				});
			} else {
				ui.openNavController();
				ui.addEventListeners();
				return;
			}
			S.Log.trace('-ui.run');
		},

		home : function() {
			S.UI.controller.home();
		},

		// Call only from navigate()
		openWindow : function(pageName, data) {
			S.Log.trace('+openWindow: ' + pageName);
			var win = null;

			// Give time for garbage collection to
			// catch up and memory to be freed
			// also stop double clicks
			var delay = 100;
			//
			if (Ti.App.Util.isAndroid()) {
				delay = 500;
			}

			setTimeout(function() {
				try {
					var win;
					//Cuisine List has its own separate map
					if (pageName == 'cuisinelist') {
						var pageTop = ui.getPage('mapDishList');
						location.getLocation(function(e) {
							Ti.API.info('Location Loaded');
						});
						var win = pageTop.getWindow.call(pageTop);
						Ti.App.fireEvent('app:tab.focus.' + 'mapDishList_2', {
							name : 'bar',
							data : data
						});
						var pageRest = require("/struct/ui/pages/" + pageName).createPage(S).createView(win, data);
						var viewTop = ui.titleBarCuisine(data);
						win.add(viewTop);
						win.add(pageRest);
					} else if (pageName == 'restaurant_list') {
						var pageTop = ui.getPage('mapall');
						location.getLocation(function(e) {
							Ti.API.info('Location Loaded');
						});
						win = pageTop.getWindow.call(pageTop);
						win.addEventListener('focus', function() {
							pageTop.mapList(data);
						});
						win.addEventListener('blur', function() {
							Ti.App.fireEvent('app:tab.blur.' + 'mapall');
						});
						var pageRest = require("/struct/ui/pages/" + pageName).createPage(S);
						if (pageRest.useTopBar) {
							var viewTop = ui.topBarLink(pageRest.useTopBar);
							win.add(viewTop);
						}
						win.add(pageRest.createView(win, data));
					} else {
						var page = ui.getPage(pageName);
						win = page.getWindow.call(page, data);
						win.layout = 'vertical';
						if (page.useTopBar) {
							win.add(ui.topBarLink(page.useTopBar));
						}
					}
					ui.controller.open(win);

					// Hide the loader if it's open
					setTimeout(ui.loader.hide, delay);
				} catch(err) {
					ui.loader.hide();
					// Hid the loader if it's open
					S.Log.print_r(err);
					S.Log.print('Could not open: ' + pageName);
				}
			}, delay);
		},

		// All window navigation logic should end up here.
		_navigate : function(params) {
			S.Log.trace('_navigate (' + params.viewName + '): Memory: ' + Titanium.Platform.availableMemory);
			S.Log.print_r(params);

			if ('home' === params.viewName) {
				ui.home();
			} else {
				ui.openWindow(params.viewName, params.data);
			}
		},

		// Fire navigate event to de-couple
		navigate : function(viewName, params) {
			if (!params)
				params = {};

			params.viewName = viewName;
			ui._navigate(params);
			// Ti.App.fireEvent('app:navigate', params);
		},

		openCondition : function() {
			// Basic cacheing
			if (S.UI.conditionsResult) {
				ui.navigate('condition', S.UI.conditionsResult);
				return;
			}

			FCPapi.getConditions(function(e) {
				S.UI.loader.show();
				S.UI.conditionsResult = e;
				ui.navigate('condition', e)
			});
		},

		saveConditions : function(callback) {
			S.Log.trace('+user.saveConditions');

			var conditions = S.UI.conditionsResult.data;
			S.Log.print_r(conditions);
			var no_guidelines = {};

			for (var i = 0; i < conditions.length; i++) {
				var condition = conditions[i];

				if (!condition.has_guidelines)
					no_guidelines[condition.id] = condition.name;
			}
			S.Log.print_r(no_guidelines);

			var localdata = user.getUserConditions();

			var err = '';
			for (var c in localdata.conditions) {
				if (localdata.conditions[c] && no_guidelines[c]) {
					err = err + no_guidelines[c] + ",";
				}
			}

			if (!user.validateConditions()) {

				Ti.UI.createAlertDialog({
					title : 'Healthy Hometown',
					message : 'You must select at least one health condition.',
					buttonNames : ['Ok']
				}).show();
				return;
			}

			var alertMsg = 'Profile Saved.'
			if ('' !== err) {
				err = "Note: We are updating our health conditions for the following:\n" + err.slice(0, -1);
				err = err + ".\n\nCheck back soon for an update!";
				alertMsg = err;
			}

			user.save(function(response) {
				S.UI.Alert(response, alertMsg, 'There was a problem saving your conditions. Please try again.', function(response) {
					callback(response);
				});
			});

		},

		search : function(params, viewName, callback) {

			S.Log.print('+UI.search:' + JSON.stringify(params));

			if (! user.validateBirthdate()) {
				S.UI.createAlertDialog({
					success : true
				}, 'Please update your profile from the Profile | My Profile page before continuing').show();
				return;
			}

			if (! user.validateConditions()) {
				S.UI.createAlertDialog({
					success : true
				}, 'We have updated our conditions. Please select the appropriate health conditions from the Profile | Health Conditions page').show();
				return;
			}

			if (! user.validateZipcode()) {
				S.UI.createAlertDialog({
					success : true
				}, 'Please update your profile from the Profile | Location Preferences page before continuing').show();
				return;
			}

			ui.loader.show();

			FCPapi.search(params, function(e) {
				S.Log.trace('+search return');

				var success = false;

				// make sure we have data
				if (e.data)
					if (e.data.restaurants)
						if (e.data.restaurants.length > 0)
							success = true;

				if (!success)
					e.success = false;

				if (e.success) {
					if (callback) {
						callback(e)
					} else {
						ui.navigate(viewName, e);
					}
				} else {
					S.Log.print('No data returned!');
					ui.loader.hide();
					alert('We could not find any dishes in your area that match your conditions. Please Nominate a Restaurant');
				}

			});
		},

		dishlist : function(restid) {
			FCPapi.getRestaurant(restid, function(result) {

				S.Log.print("+dishlist, get restaurant return: " + restid);

				if (result.data)
					if (result.data.dishes)
						if (result.data.dishes.length > 0) {
							ui.navigate('cuisinelist', {
								data : result.data
							});
							return;
						}
				// No data, something went wrong
				ui.Alert(result, "No menu found, please select a different restaurant.", "We're sorry, there was a communication error. Please try again.");
			});

		},

		hometownNewsList : function(hometownId) {
			FCPapi.getHometownID(hometownId, function(result) {

				S.Log.print("+hometown id" + hometownId);

				if (result.data) {
					ui.navigate('newslist', {
						data : result.data
					});
					S.UI.loader.hide();
					return;
				}
				// No data, something went wrong
				ui.Alert(result, "No news found, please select a different news.", "We're sorry, there was a communication error. Please try again.");
			});

		},

		hometownEventsList : function(hometownId) {
			FCPapi.getHometownEventsID(hometownId, function(result) {

				S.Log.print("+hometown id" + hometownId);

				if (result.data) {
					ui.navigate('eventlist', {
						data : result.data
					});
					S.UI.loader.hide();
					return;
				}
				// No data, something went wrong
				ui.Alert(result, "No news found, please select a different news.", "We're sorry, there was a communication error. Please try again.");
			});

		},

		dishdetail : function(restid, dishid) {

			FCPapi.getDish(dishid, function(result) {
				if (false === result.success) {
					ui.Alert(result, 'Item not found, please select a different dish')
					return;
				}
				// We have the result
				var dish = result.data;
				dish.id = dishid;
				// for some reason, the dishid isn't always returned

				FCPapi.getRestaurant(restid, function(result) {
					if (false === result.success) {
						ui.Alert(result, 'Item not found, please select a different dish')
						return;
					}

					var rest = result.data;
					var win = Ti.App.Windows.createDishdetail(S, dish, rest);

					ui.decorateWindow(win);
					ui.controller.open(win);

					setTimeout(ui.loader.hide, 100);
				});

			});
		},

		back : function() {
			ui.controller.back();
		},

		NEWloader : {

			show : function() {
				if (!ui.loader_view) {
					ui.loader_view = Ti.UI.createActivityIndicator({
						style : Ti.UI.iPhone.ActivityIndicatorStyle.BIG,
						message : 'Loading ...',
						font : 'Arial',
						color : '#FFF'
					});
				}
				ui.loader_view.show();
			},
			hide : function() {
				if (ui.loader_view) {
					ui.loader_view.hide();
				}
			}
		},

		loader : {
			show : function(e) {
				// S.Log.trace('+show loader ' + S.Cfg.showloader);
				if (S.Cfg.showloader) {
					Ti.App.fireEvent('app:show.loader');
				}
			},

			hide : function(e) {
				// S.Log.trace('+hide loader ' + S.Cfg.showloader);
				if (S.Cfg.showloader) {
					Ti.App.fireEvent('app:hide.loader');
				}
			}
		},

		showKudos : function(e) {
			var kudos = require('struct/ui/modal/kudos').createPage(S);
			kudos.run(e);
		},

		// internal UI functions
		createButton : function(props, onClick) {
			S.Log.trace('+createButton');
			S.Log.print_r(props);

			if (props.name) {
				S.Log.print('button:' + props.name);
				delete props.title;
				props.width = 270;
				props.height = 45;

				// damn, need another way to special case longer buttons
				if ('get_fc_dietitian' === props.name)
					props.width = 300;
				if ('dietitian_access' === props.name)
					props.width = 300;

				var button = Ti.UI.createButton(S.combine({
					backgroundImage : '/images/buttons/' + props.name + '.png' /*, opacity: 1.0 */
				}, props));
			} else {
				props.title = props.title.toUpperCase();
				var button = Ti.UI.createButton(S.combine($$.Button, props));
			}

			if (Ti.App.Util.isAndroid()) {
				button.height *= 1.5;
				button.width *= 1.5;
			}

			if (onClick) {
				button.addEventListener('click', onClick);
			}
			return button;
		},

		createBGTableView : function(backgroundImage, callback) {
			// if (!props) props = {};
			var views = {};

			if (Ti.App.Util.isAndroid()) {

				var view = S.UI.createTView({
					backgroundImage : backgroundImage
				});

				var tableView = Ti.UI.createTableView({
					top : 0,
					width : '100%',
					height : 'auto', // 1024,
				})

				var subView = Ti.UI.createView({
					top : 0,
					right : 0,
					left : 0,
					bottom : 18
				})

				var wrapperView = Titanium.UI.createScrollView({
					top : 0,
					right : 0,
					left : 0,
					bottom : 0,
					contentHeight : 'auto',
					layout : 'vertical'
				});

				subView.add(tableView);
				view.add(subView);

				views.mainView = view;
				views.tableView = tableView;

				var postLayout = function(e) {
					S.Log.trace('+postlayout');
					S.Log.print_r(views.tableView);
					views.mainView.removeEventListener('postlayout', postLayout);
					try {
						var s = views.tableView.sections[0].rows[0].children[0].size.height;
						var l = views.tableView.sections[0].rows.length;
						S.Log.print(s + ' ' + l);
						var height = s * (l + 1);
						if (height > 0)
							views.tableView.height = height;
					} catch(e) {
						S.Log.print_r(e);
					}
					views.tableView.visible = true;
				};

			} else {
				views.mainView = S.UI.createTView({
					backgroundImage : backgroundImage
				});
				views.tableView = S.UI.createTableView({
					top : 0,
					footerTitle : ''
				});
				views.mainView.add(views.tableView);
			}

			if (callback) {
				views.tableView.addEventListener('click', callback);
			}

			return views;
		},

		createTableViewRow : function(rowData, view) {
			var row = Titanium.UI.createTableViewRow(Ti.App.Util.combine({
				backgroundColor : '#14141F',
				color : 'white',
				ƒheight : 'auto',
				opacity : '0.8'
			}, rowData));
			if (view)
				row.add(view);
			if (row.hasChild) {
				row.rightImage = '/images/table_icons/arrow.png';
			}
			if (row.hasCheck) {
				row.rightImage = '/images/table_icons/tick-mark.png';
			}
			return row;
		},

		createView : function(props) {
			if (!props)
				props = {};
			return Ti.UI.createView(S.combine($$.appView, props));
		},

		createTView : function(props) {
			if (!props)
				props = {};
			return Ti.UI.createView(S.combine($$.tView, props));
		},

		createTableView : function(props) {
			if (!props)
				props = {};
			return Ti.UI.createTableView(S.combine($$.tableView, props, {
				separatorColor : '#000000'
			}));
		},

		createWebView : function(props) {
			if (!props)
				props = {};
			return Ti.UI.createWebView(S.combine($$.webView, props));
		},

		createFormView : function(props, opacity) {
			if (!props)
				props = {};
			var imageDefault = {
				backgroundImage : '/images/bg/city.png'
			};
			var view = Ti.UI.createView(S.combine($$.appView, imageDefault, props));

			if (!opacity === null)
				opacity = 0.4;

			if (opacity > 0.0) {
				var overlay = Ti.UI.createView({
					backgroundColor : '#000',
					opacity : opacity
				});
				view.add(overlay);
			}

			view.focusable = true;

			return view;
		},

		createScrollableFormView : function(props, opacity) {
			if (!props)
				props = {};
			var imageDefault = {
				backgroundImage : '/images/bg/city.png'
			};
			var view = Ti.UI.createScrollView(S.combine($$.appView, imageDefault, props));

			if (!opacity === null)
				opacity = 0.4;

			if (opacity > 0.0) {
				var overlay = Ti.UI.createView({
					backgroundColor : '#000',
					opacity : opacity
				});
				view.add(overlay);
			}

			view.focusable = true;

			return view;
		},

		webSource : function(title, url) {

			var w = Titanium.UI.createWindow({
				title : title,
				barColor : S.Cfg.barColor,
			});

			w.add(Ti.UI.createWebView({
				url : url
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
		},

		getAlertMessage : function(result, message) {
			S.Log.trace('+getAlertMessage');
			S.UI.loader.hide();

			if (!result)
				return message;
			if (!result.data)
				return message;

			if (result.data['full_errors']) {
				var msg = result.data['full_errors'].join("\n");
				S.Log.print(msg);
				return msg;
			}

			if (result.data.message)
				return result.data.message;

			// fall through
			return message;
		},

		createAlertDialog : function(result, message, callback) {
			S.Log.trace("+createAlaert");
			S.Log.print_r(result);
			S.UI.loader.hide();

			message = ui.getAlertMessage(result, message);

			var alert = Ti.UI.createAlertDialog({
				title : 'Healthy Hometown',
				message : message,
				buttonNames : ['Ok']
			});

			if (callback) {
				alert.addEventListener('click', function(e) {
					callback(e);
				});
			}
			return alert;
		},

		Alert : function(result, success, failure, callback) {
			S.Log.trace("Alert");
			S.Log.print_r(result);
			S.UI.loader.hide();

			if (!failure) {
				failure = 'Server too busy. Please Try again.';
			}

			if (!result) {
				result = {
					'success' : false
				};
			}

			var message;

			if (result.success) {
				message = ui.getAlertMessage(result, success);
			} else {
				message = ui.getAlertMessage(result, failure);
			}

			var alert = Ti.UI.createAlertDialog({
				title : 'Healthy Hometown',
				message : message,
				buttonNames : ['Ok']
			});

			if (callback) {
				alert.addEventListener('click', function(e) {
					callback(e);
				});
			}

			alert.show();
		},

		//Decorates the window
		decorateWindow : function(win) {
			if (Ti.App.Util.isAndroid()) {
				var activity = win.activity;
				activity.onCreateOptionsMenu = function(e) {
					var menu = e.menu;
					var menuItem = menu.add({
						title : "Home"
					});
					menuItem.addEventListener("click", function(e) {
						ui.navigate('home');
					});
				};
				win.orientationModes = [Ti.UI.PORTRAIT];

			} else {
				var menuIcon = Ti.UI.createImageView({
					image : '/images/topbar/menu_icon.png',
					right : 10
				});
				menuIcon.addEventListener('click', function(e) {
					S.UI.loader.show();
					S.UI.navigate('cabinet');
				});

				win.setRightNavButton(menuIcon);
				// Not available on Android.
			}
		},

		/*To display navigation bar on android
		 * returns: topbar view
		 */
		navBarAndroid : function(linkView, height, pagename) {
			var navBarView = Titanium.UI.createView({
				height : height,
				layout : 'vertical',
				// zIndex:2,
				top : 0,
				left : 0
			});
			var topBar = Titanium.UI.createView({
				height : '40dp',
				backgroundColor : '#233674',
				layout : 'horizontal',
			});
			var logo = Ti.UI.createImageView({
				image : '/images/topbar/logo-1.png',
				width : '85%',
			});
			var menuImage = Ti.UI.createImageView({
				image : '/images/topbar/menu_icon.png',
				right : 5,
			});
			menuImage.addEventListener('click', function(e) {
				S.UI.loader.show();
				S.UI.navigate('cabinet');
			});
			topBar.add(logo);
			if (pagename !== 'login' && pagename !== 'createaccount' && pagename !== 'personalize') {
				topBar.add(menuImage);
			}
			navBarView.add(topBar);
			navBarView.add(linkView);

			return navBarView;
		},
		/*To display top bar on specific windows
		 * params: message to display
		 * returns: topbar view
		 */
		topBarLink : function(message) {
			var topBar = Titanium.UI.createView({
				height : '30dp',
				backgroundColor : '#FFFFFF',
				layout : 'horizontal',
				top : 0,
			});
			var labelMessage = Titanium.UI.createLabel({
				text : message,
				font : {
					fontSize : '10sp'
				},
				width : 'auto',
				textAlign : 'left',
				top : '5dp',
				left : '15dp',
			});
			var linkE = Titanium.UI.createLabel({
				text : "Recruit It!",
				color : "#2a4088",
				font : {
					fontSize : '10sp',
					fontWeight : 'bold'
				},
				width : 'auto',
				textAlign : 'left',
				top : '5dp',
				left : '5dp',
				height : 'auto',
			});

			linkE.addEventListener('click', function(e) {
				ui.navigate('recruit');
			});
			topBar.add(labelMessage);
			topBar.add(linkE);

			if (Ti.Platform.name == 'android') {
				return ui.navBarAndroid(topBar, '70dp');
			}

			return topBar;
		},
		/*To display title bar on specific windows
		 * params: message to display
		 * returns: titlebar view
		 */
		titleBarView : function(message, pagename) {
			var titleBar = Titanium.UI.createView({
				height : '50dp',
				backgroundColor : '#FFFFFF',
				left : '0',
				top : '0',
				layout : 'horizontal',
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
				text : message,
				font : {
					fontSize : '17sp',
					fontWeight : 'bold'
				},
				width : 'auto',
				textAlign : 'left',
				top : '15dp',
				left : '10dp',
				color : 'black'
			});
			titleBar.add(labelMessage);

			if (Ti.Platform.name == 'android') {
				return ui.navBarAndroid(titleBar, '90dp', pagename);
			}
			return titleBar;
		},
		/*To display title bar on specific windows
		 * params: message to display
		 * returns: titlebar view
		 */
		titleBarCuisine : function(rest) {
			var top;
			if (Ti.App.Util.isAndroid()) {
				top = '40dp';
			} else {
				top = 0;
			}
			var rowView = Titanium.UI.createView({
				height : '50dp',
				backgroundColor : '#FFFFFF',
				left : '0',
				top : top,
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
			var distance = rest.address.distance;
			var rounded = Math.round(distance * 10) / 10;
			distance = rounded.toFixed(1);

			var description = Dish.getRestaurantDescription(rest) || ' ';
			// Description of Rest';

			var header = rest.name;
			if (rest.matched_dishes > 0) {
				header = '(' + rest.matched_dishes + ') ' + rest.name;
			}

			rowView.add(Titanium.UI.createLabel({
				text : header,
				font : {
					fontSize : '15sp',
					fontWeight : 'bold'
				},
				width : 'auto',
				textAlign : 'left',
				top : '2dp',
				height : '18dp',
				left : '5dp',
				color : 'black',
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
				color : 'black',
			}));

			rowView.add(Titanium.UI.createLabel({
				text : distance + ' Miles',
				font : {
					fontSize : '12sp'
				},
				width : 'auto',
				top : '22dp',
				textAlign : 'right',
				right : '50dp',
				color : 'black',
			}));
			var mapView = Titanium.UI.createImageView({
				image : '/images/topbar/map-icon.png',
				top : '15dp',
				right : '5dp',
				height : 34,
				width : 35
			});
			rowView.add(mapView);
			mapView.addEventListener('click', function(e) {
				Ti.Platform.openURL("http://maps.google.com/maps?daddr=" + rest.address.latitude + "," + rest.address.longitude);
			});
			return rowView;
		}
	}

	//*******************************************************
	// Prototype Object, gets created on load
	var pageClass = {
		name : 'abstract',
		title : 'Abstract View',
		view : null,
		win : null,
		useBackButton : true,
		navBarHidden : false,
		// backButtonTitle: 'Back',

		createView : function() {
			Ti.App.Logger.trace('+createView ABSTRACT ' + this.name);
			return Ti.UI.createView({});
		},

		getWindow : function(data) {
			var page = this;
			Ti.App.Logger.trace('+getWindow: ' + this.name + ':' + page);

			var view;
			var win = page.win;

			if (win && Ti.App.Config.testmode) {
				alert('Window open!');
			}
			//return if window is already created
			if (win)
				return win;

			Ti.App.Logger.trace('+createWindow: ' + this.name);

			var topBarImage = Ti.UI.createImageView({
				image : '/images/topbar/hh_logo_new.png'
			});

			var win;
			//custom titlebar for android
			if (Ti.App.Util.isAndroid()) {
				win = new customUI.Window(S, page);
			} else {
				win = Ti.UI.createWindow({
					exitOnClose : false,
					orientationModes : [Ti.UI.PORTRAIT, Ti.UI.UPSIDE_PORTRAIT],
					titleControl : topBarImage,
					barColor : '#233674', // NLT: Use default barcolor
					navBarHidden : this.navBarHidden,
					backButtonTitle : ''
				});
				var customBack = Titanium.UI.createButton({
					style : 0,
					image : '/images/topbar/home.png',
					backgroundImage : 'none',
					backgroundColor : 'none',
					width : 41,
					height : 44,
					top : 0,
					left : 0,
				});
				if (page.useBackArrow) {
					customBack.image = '/images/topbar/back-arrow.png';
				}
				customBack.addEventListener('click', function() {
					ui.controller.navGroup.close(win);
				});
				win.leftNavButton = customBack;
				if (!page.useBackButton) {
					win.setLeftNavButton(null);
				}
			}
			this.win = win;

			if (Ti.App.Util.isAndroid()) {

				win.orientationModes = [Ti.UI.PORTRAIT];

				var gactivity = Titanium.Android.currentActivity;
				var activity = win.activity;

				S.Log.print_r(gactivity);
				S.Log.print_r(activity);

			}

			// Big Change NLT
			//    win.addEventListener('open', function(e) {
			Ti.App.Logger.trace('+open: ' + page.name);

			if (!Ti.App.Util.isAndroid()) {
				var menuIcon = Ti.UI.createImageView({
					image : '/images/topbar/menu_icon.png',
					right : 10
				});
				menuIcon.addEventListener('click', function(e) {
					S.UI.loader.show();
					S.UI.navigate('cabinet');
				});

				if (Ti.Platform.name !== 'android' && page.name != 'login' && page.name != 'createaccount' && page.name != 'profile') {
					win.setRightNavButton(menuIcon);
					// Not available on Android.
				}

				if (win.barImage) {
					win.title = null;
					win.barColor = '#000'
				}
			}

			//    });

			win.addEventListener('close', function(e) {
				//    Ti.App.fireEvent('app:hide.loader');
				// Force garbage collection
				if (page.view)
					win.remove(page.view);
				page.view = null;
				page.win = null;
				// free the window
			});

			win.add(this.createView.call(this, win, data));
			return win;

		},
	}

	ui.properties = require('/struct/ui/styles').properties;
	ui.theme = require('/struct/ui/styles').theme;
	$$ = ui.properties;

	exports.ui = ui;

})();

