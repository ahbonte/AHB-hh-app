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

			name : 'profile_location',
			title : 'Location Preferences',
			useBackButton : true,

			createView : function(win) {

				var view = S.UI.createFormView({
					backgroundImage : '/images/bg/city.png'
				}, 0.0);
				var activityLevels = ['Sedentary', 'Moderately Active', 'Active'];

				var fields = [{
					title : 'Zip Code',
					type : 'number',
					id : 'zipcode',
					required : false
				}, {
					title : 'Choose Location Source',
					type : 'picker',
					id : 'geolocate',
					data : ['Use Current Location', 'Use Zip Code'],
					value : 'Use Current Location'
				}, {
					title : 'Search Within',
					type : 'picker',
					id : 'distance',
					data : ['1 Mile', '5 Miles', '10 Miles', '25 Miles'],
					value : '10 Miles'
				}, {
					title : 'Save',
					type : 'submit',
					id : 'saveProfile',
					size : 'small',
					name : 'save'
				}];

				var form = forms.createForm({
					style : forms.STYLE_LABEL,
					fields : fields,
				});

				var values = User.getLocation();
				forms.setData(form, values);

				form.addEventListener('saveProfile', function(e) {
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

					var zip = Ti.App.Util.validateZipCode(e.values.zipcode);
					if (zip) {
						e.values.zipcode = zip;
					} else {
						alert('Please enter your 5-digit zipcode so that we can present restaurants if your location is not available.');
						return;
					}

					if ('' !== errmsg) {
						alert(errmsg);
						return;
					}

					var values = e.values;
					User.setLocation(values, function(response) {
						ui.loader.hide();
						S.UI.Alert(response, 'Profile Saved.', null, function() {
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

