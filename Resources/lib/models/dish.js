/**
* FoodCare City - FoodCare City
* Author: FoodCare Inc. Copyright 2013. All Rights Reserved
*/

(function() {

	var Log = require('/lib/logger');
	var Util = require('/lib/util').util;

	var dish = {

		getCuisineTypes : function(rests) {
			Log.trace('+getCuisineTypes');

			var cuisine_types_hash = {};
			// unique types
			var cuisine_count_hash = {};
			// total number of dishes for each type
			var cuisine_types = [];

			// get all the cuisine types to a hash, making them unique.
			for (var restidx = 0; restidx < rests.length; restidx++) {
				var rest = rests[restidx];
				rest.cuisine_types.unshift({
					id : 0,
					name : 'All'
				});

				for (var cuisine_typeidx = 0; cuisine_typeidx < rest.cuisine_types.length; cuisine_typeidx++) {
					var cuisine_type_id = rest.cuisine_types[cuisine_typeidx].id;

					if (cuisine_count_hash[cuisine_type_id]) {
						cuisine_count_hash[cuisine_type_id] = cuisine_count_hash[cuisine_type_id] + 1;
					} else {
						cuisine_count_hash[cuisine_type_id] = 1;
					}

					cuisine_types_hash[cuisine_type_id] = rest.cuisine_types[cuisine_typeidx];

				}
			}

			// Now flatten to array and add the count
			for (var hash_idx in cuisine_types_hash) {
				cuisine_types_hash[hash_idx].count = cuisine_count_hash[hash_idx]
				cuisine_types.push(cuisine_types_hash[hash_idx]);
			}
			Log.print_r(cuisine_types);

			return cuisine_types;
			// [{"id":2,"name":"American","count":20},{"id":4,"name":"Bagels & Bakeries","count":20}]
		},

		/*
		 * Iterate through all restaurants, adding the ones with the appropriate
		 * cuisine types.
		 */

		filterByCuisineType : function(cuisine_id, rests) {

			var filtered_data = [];

			for (var restidx = 0; restidx < rests.length; restidx++) {
				var rest = rests[restidx];
				for (var cuisine_typeidx = 0; cuisine_typeidx < rest.cuisine_types.length; cuisine_typeidx++) {
					if (rest.cuisine_types[cuisine_typeidx].id === cuisine_id) {
						filtered_data.push(rest);
						break;
						// Only add one restaurant
					}
				}
			}

			return filtered_data;
		},

		/*
		 * Given a raw list of restaurants, return the dishes in a format appropriate
		 * for a table view
		 */
		getDishesFromRestaurants : function(rests) {

			var dish_list = [];

			for (var restidx = 0; restidx < rests.length; restidx++) {
				var rest = rests[restidx];
				var restdata = {
					id : rest.id,
					name : rest.name,
					address : rest.address,
					description : this.getRestaurantDescription(rest)
				}

				for (var dishidx = 0; dishidx < rest.dishes.length; dishidx++) {
					var dish = rest.dishes[dishidx];
					dish.restdata = restdata;
					dish.name = Util.camelcase(dish.name);
					dish_list.push(dish);
				}
			}

			return dish_list;
		},

		getRestaurantDescription : function(rest) {
			var description = rest.address.street1 + ', ' + rest.address.city + ', ' + rest.address.state;
			/*
			 for(var cuisine_typeidx = 0; cuisine_typeidx < rest.cuisine_types.length; cuisine_typeidx++) {
			 description = description +  rest.cuisine_types[cuisine_typeidx].name + ', ';
			 }
			 */
			return description;
			//    return description.slice(0, -2)
		}
	}

	exports.dish = dish;

})();

