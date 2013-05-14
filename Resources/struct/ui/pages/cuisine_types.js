/**
 * FoodCare City
 * Author: FoodCare Inc. Copyright 2013. All Rights Reserved
 */

(function() {

	var FCPapi = require('lib/fcp').api;
	var Dish = require('lib/models/dish').dish;

	function createPage(S) {

		var ui = S.UI;

		var cuisineViewContainer = {

			name : 'cuisine_types',
			title : 'Find Cuisine',

			createView : function(win, cuisine_types) {
				Ti.App.Logger.trace('+cuisine_list');

				var views = S.UI.createBGTableView('/images/bg/city.png', function(e) {
					if (e.rowData.cuisine_type_id) {
						ui.search({
							cuisine_type_id : e.rowData.cuisine_type_id
						}, 'restaurant_list');
					}
				});

				var tableData = [];
				for ( i = 0; i < cuisine_types.length; i++) {
					var cuisine_type = cuisine_types[i];
					if (cuisine_type.name && cuisine_type.id) {// protect against null data
						var row = Ti.UI.createTableViewRow({
							title : cuisine_type.name,
							cuisine_type_id : cuisine_type.id,
							hasChild : true,
							color : 'black',
							backgroundColor : 'white'
						});
						tableData.push(row);
					}
				}

				views.tableView.setData(tableData);
				return views.mainView;
			}
		}
		return cuisineViewContainer;
	};

	exports.createViewContainer = createPage;
	exports.createPage = createPage;

})();

