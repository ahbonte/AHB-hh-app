/**
 * FoodCare City
 * Author: FoodCare Inc. Copyright 2013. All Rights Reserved
 */

(function() {

	var L = require('lib/logger');
	var user = require('lib/models/user').user;

	exports.createViewContainer = function(S) {

		var ui = S.ui;

		var tview;
		var condition_type = 1;
		// 0 = one off, 1 = checkbox, later 2 = mutually exclusive. Only #1 has been implemented.
		var condition;
		var b1;

		function setChecks(condition, tdata) {
			S.Log.trace('+subcondition setChecks');

			condition.hasCheck = user.getCondition(condition.id);

			for (var conditionidx = 0; conditionidx < tdata.length; conditionidx++) {
				tdata[conditionidx].hasCheck = user.getSubcondition(tdata[conditionidx].subconditionidx);
			}
		}

		var pref = {
			name : 'subcondition',
			title : 'Select Condition',

			createView : function(win, data) {

				S.Log.trace('+setdata subcondition');
				S.Log.print_r(data);

				condition = data.condition;

				this.win.title = condition.name;

				if (condition.name == 'Chronic Kidney Disease') {
					this.win.title = 'Kidney Disease';
				}

				var tdata = [];
				var view = ui.createTView({
					backgroundImage : '/images/bg/city.png'
				});
				tview = ui.createTableView({
					footerTitle : ''
				});

				for (var subconditionidx = 0; subconditionidx < condition.sub_conditions.length; subconditionidx++) {
					var subcondition = condition.sub_conditions[subconditionidx];
					var row = S.UI.createTableViewRow({
						title : subcondition.name,
						subconditionidx : subcondition.id
					});
					tdata.push(row);
				}

				tview.data = tdata;
				setChecks(data.condition, tdata);

				b1 = S.UI.createButton({
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
						S.UI.loader.hide();
						S.UI.navigate('condition');
					});
				});

				view.add(tview);
				view.add(b1);

				//      pref.mainView.add(view);

				tview.addEventListener('click', function(e) {

					S.Log.trace("+subcondition event");
					S.Log.print_r(e);
					S.Log.print_r(e.source);
					S.Log.print_r(e.rowData);

					var masterChecked = condition.hasCheck;

					if (e.rowData.subconditionidx) {

						if (condition_type === 1) {
							// Many conditions possible, so simply toggle
							e.source.hasCheck = !e.source.hasCheck;
						}

						// If any sub-condition is checked, then the top condition must also be checked.
						// Check if we need to check the Master (skip the first)
						masterChecked = false;
						for (var tdataidx = 0; tdataidx < tdata.length; tdataidx++) {
							if (tdata[tdataidx].hasCheck)
								masterChecked = true;
						}
					}

					condition.hasCheck = masterChecked;

					// Store the data
					user.setCondition(condition.id, condition.hasCheck);

					for (var conditionidx = 0; conditionidx < tdata.length; conditionidx++) {
						user.setSubcondition(tdata[conditionidx].subconditionidx, tdata[conditionidx].hasCheck);
					}
				});

				return view;

			},
		}
		return pref;
	}
})();
