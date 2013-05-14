/**
 * FoodCare City
 * Author: FoodCare Inc. Copyright 2013. All Rights Reserved
 */

(function() {

	var forms = require('/lib/forms');
	var User = require('lib/models/user').user;

	function createPage(S) {
		var ui = S.UI;

		var page = {

			name : 'profile',
			title : 'My Profile',
			useBackButton : true,
			win : null,

			createView : function(win) {
				S.Log.print('+profile.createView');
				S.Log.print('+win:' + win.title);

				var view = S.UI.createFormView({
					backgroundImage : '/images/bg/city.png'
				}, 0.0);
				var activityLevels = ['Sedentary', 'Moderately Active', 'Active'];

				var values = User.getProfile();

				var fields = [{
					title : 'Gender',
					type : 'picker',
					id : 'gender',
					data : ['Female', 'Male'],
					required : true,
					value : values.gender
				}, {
					title : 'Weight (in pounds)',
					type : 'number',
					id : 'weight',
					required : true,
					value : values.weight
				}, {
					title : 'Height',
					type : 'height',
					id : 'height',
					required : true,
					value : values.height
				}, {
					title : 'Birth Date',
					type : 'date',
					id : 'birthdate',
					required : true,
					value : Ti.App.Util.dateToString(values.birthdate)
				}, {
					title : 'Activity Level',
					type : 'picker',
					id : 'activity_level',
					data : activityLevels,
					required : true,
					value : values.activity_level
				}, {
					title : 'Save',
					type : 'submit',
					id : 'saveProfile',
					size : 'small',
					name : 'next'
				}];

				var form = forms.createForm({
					style : forms.STYLE_HINT,
					fields : fields,
				});

				form.addEventListener('saveProfile', function(e) {

					var values = e.values;

					S.Log.trace('+profile saveProfile');
					S.Log.print(e.values);

					var errmsg = '';
					for (var i = 0; i < fields.length; i++) {
						if (fields[i].required) {
							var id = fields[i].id;
							if (e.values[id] === '')
								errmsg += fields[i].title + ' is required.' + "\n";
							break;
						}
					}

					if (e.values['height'] < 24 || e.values['height'] > 108) {
						errmsg += 'Please enter your accurate height.' + "\n";
					}

					if (e.values['weight'] < 25 || e.values['weight'] > 1500) {
						errmsg += 'Please enter your accurate weight.' + "\n";
					}

					if (!Ti.App.Util.isValidDate(e.values.birthdate)) {
						e.values.birthdate = Ti.App.Util.stringToDate(e.values.birthdate);
					}

					// Validate Date
					if (! User.validateBirthdate(e.values.birthdate)) {
						errmsg += 'You must be over 13 to use this application';
					}

					if ('' !== errmsg) {
						alert(errmsg);
						return;
					}

					User.setProfile(values, function(response) {
						ui.loader.hide();
						S.UI.Alert(response, 'Profile Saved.', null, function() {
							if (response.success)
								win.close();
						});
					});

				});

				view.add(form);

				return view;
			},
		}

		return page;
	}


	exports.createViewContainer = createPage;
	exports.createPage = createPage;

})();

