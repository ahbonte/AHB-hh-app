/**
 * FoodCare City
 * Author: FoodCare Inc. Copyright 2013. All Rights Reserved
 */

(function() {

	var L = require('lib/logger');
	var user = require('lib/models/user').user;

	exports.createViewContainer = function(S, ui) {

		var pref = {
			name : 'condition',
			title : 'Health Conditions',
			useBackButton : true,

			createView : function(win, data) {
				L.print('Condition View Set');
				L.print_r(data);

				var view = ui.createTView({
					backgroundImage : '/images/bg/city.png'
				});
				var tview = ui.createTableView({
					footerTitle : ''
				});

				var b1 = S.UI.createButton({
					title : 'SAVE & CONTINUE',
					height : 43,
					width : Ti.App.Util.getPlatformHeight(),
					bottom : -3,
					borderWidth : 0,
					borderRadius : 0,
					name : 'save_continue'
				}, function(e) {
					S.Log.print('Save');

					S.UI.saveConditions(function(response) {
						S.UI.navigate('condition');
					});
				});

				tview.addEventListener('click', function(e) {
					if (e.rowData.condition) {
						ui.navigate('subcondition', {
							data : {
								condition : e.rowData.condition,
								rowData : e.rowData
							}
						});
					}
				});

				view.add(tview);
				view.add(b1);
				// pref.mainView.add(view);

				var tdata = [];

				for (var conditionidx = 0; conditionidx < data.length; conditionidx++) {
					var condition = data[conditionidx];
					Ti.App.Logger.print_r(condition);
					var name = condition.name;

					if (!condition.has_guidelines) {
						name = name + ' (coming soon)';
					}
					var row = S.UI.createTableViewRow({
						title : name,
						condition : condition,
						hasChild : true
					});
					tdata.push(row);
				}

				tview.data = tdata;

				function setChecks() {
					for (var conditionidx = 0; conditionidx < tdata.length; conditionidx++) {
						tdata[conditionidx].hasCheck = user.getCondition(tdata[conditionidx].condition.id);
						if (tdata[conditionidx].hasCheck) {
							tdata[conditionidx].backgroundColor = '#fffedd';
							tdata[conditionidx].color = 'black';
							tdata[conditionidx].hasChild = true;
						} else {
							tdata[conditionidx].backgroundColor = 'black';
						}
					}
				}

				setChecks();

				win.addEventListener('focus', function(e) {
					S.Log.print('WINDOW FOCUS (Setchecks): ' + pref.title)
					setChecks();
				});

				return view;
			},
		}

		return pref;
	}
})();

