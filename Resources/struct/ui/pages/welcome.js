/**
 * FoodCare City
 * Author: FoodCare Inc. Copyright 2013. All Rights Reserved
 */

(function() {

	var FCPapi = require('lib/fcp').api;
	var User = require('lib/models/user').user;

	function createPage(S) {

		ui = S.ui;
		cfg = S.Cfg;

		var page = {
			name : 'welcome',
			title : 'FoodCare City', // + "\u2122",
			navBarHidden : true,

			createView : function(win) {
				win.exitOnClose = true;
				win.navBarHidden = true;

				var view = S.UI.createView({
					backgroundImage : '/images/bg/loginBG.png'
				});
				var b1 = S.UI.createButton({
					'title' : 'Sign In',
					top : '170dp',
					name : 'sign-in'
				}, function(e) {
					ui.navigate('login');
				});

				view.add(b1);

				var b2 = S.UI.createButton({
					'title' : 'Create Account',
					top : '225dp',
					name : 'create-account'
				}, function(e) {
					ui.navigate('createaccount');
				});
				view.add(b2);

				var b3 = S.UI.createButton({
					'title' : 'Sign In As Guest',
					top : '280dp',
					name : 'cont-as-guest'
				}, function(e) {
					FCPapi.signin(S.Cfg.guestSignin, function(response) {
						if (response.success) {
							User.getUserDataFromServer(function(response2) {
								if (response2.success) {
									// ***********************
									S.UI.openDashboard();
									win.close({
										animate : false
									});
									// ************************
								} else {
									S.UI.createAlertDialog(response2, 'There was a problem signing in. Please try again.').show();
								}
							});
						} else {
							alert("There is some error");
						}
					});
				});
				view.add(b3);

				var version = Ti.UI.createLabel({
					'text' : Ti.App.getVersion(),
					color : 'white',
					font : {
						fontSize : 7
					},
					bottom : 0,
					right : 0
				});
				view.add(version);

				/*
				 Capture swipes and taps:
				 left corner doubletap, down swipe, down swipe, left corner doubletap, logtap

				 Double tap on right side to clear
				 */

				var state = 0;
				var changeStateAlert = Ti.UI.createAlertDialog({
					title : 'System',
					buttonNames : ['Dev', 'Prod']
				});
				changeStateAlert.addEventListener('click', function(e) {
					S.Log.print_r(e);
					S.Log.print_r(S.Cfg.url);

					if (e.index === 0) {
						S.Cfg.setDev();
					} else {
						S.Cfg.setProd();
					}

					S.Log.print_r(S.Cfg.url);
					// Change configuration options here.
					state = 0;
				});

				/* For testing switch logic
				 view.addEventListener('dblclick', function(e) {
				 S.Log.trace('dbclick');   S.Log.print_r(e);
				 changeStateAlert.show();
				 });
				 */

				view.addEventListener('doubletap', function(e) {
					S.Log.trace('doubletap');
					S.Log.print_r(e);
					if (e.x > 200)
						state = 0;
					if ((state === 0) && (e.x < 50) && (e.y < 50)) {
						state = 1;
						// double tap top left corner
						setTimeout(function() {
							state = 0
						}, 10000);
						// if the process isn't complete in 5 seconds, reset
					}
					if ((state === 3) && (e.x < 50) && (e.y < 50))
						state = 4;
					// double tap top left corner
					S.Log.print('State:' + state);
				});

				view.addEventListener('longpress', function(e) {
					S.Log.trace('longpress');
					S.Log.print_r(e);
					if (state === 4) {
						changeStateAlert.show();
					}
					S.Log.print('State:' + state);
				});

				view.addEventListener('swipe', function(e) {
					if (state === 2 && e.direction === 'down')
						state = 3;
					if (state === 1 && e.direction === 'down')
						state = 2;
					S.Log.trace('swipe');
					S.Log.print_r(e);
					S.Log.print('State:' + state);
				});

				return view;
			}
		}

		return page;
	}


	exports.createPage = createPage;
	exports.createViewContainer = createPage;

})();

