/**
 * FoodCare City - FoodCare City
 * Author: FoodCare Inc. Copyright 2013. All Rights Reserved
 * Forms module, based on Forging Titanium
 * http://vimeopro.com/appcelerator/forging-titanium/video/30387041
 **/

( function() {

		var stringToDate = Ti.App.Util.stringToDate;
		var dateToString = Ti.App.Util.dateToString;
		var isValidDate = Ti.App.Util.isValidDate;
		var findOffset = Ti.App.Util.findOffset;

		exports.createSemiModalPicker = function(o) {
			var type = o.type === undefined ? Ti.UI.PICKER_TYPE_PLAIN : o.type;
			var modalWin = Ti.UI.createWindow({
				backgroundColor : 'transparent'
			});
			var overlay = Ti.UI.createView({
				backgroundColor : '#000',
				opacity : 0.6
			});
			var container = Ti.UI.createView({
				bottom : 0,
				layout : 'vertical',
				height : 'auto'
			});

			var picker = Ti.UI.createPicker({
				type : type,
				height : 'auto',
				selectionIndicator : true,
				useSpinner : true
			});
			if (type === Ti.UI.PICKER_TYPE_DATE) {
				picker.value = stringToDate(o.value);
				picker.minDate = new Date(1900, 1, 1);

				// var max = new Date();
				//    max.setYear(max.getYear() - 13);

				// picker.maxDate = max;

			} else if (o.data) {
				for (var i in o.data) {
					picker.add(Ti.UI.createPickerRow({
						title : o.data[i]
					}));
				}
			}
			picker.addEventListener('change', function(e) {
			});

			var cancel = Titanium.UI.createButton({
				title : 'Cancel',
				height : 30,
				width : 80,
				style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED,
				left : 10
			});
			cancel.addEventListener('click', function(e) {
				modalWin.close();
			});

			var done = Titanium.UI.createButton({
				title : 'Done',
				height : 30,
				width : 80,
				style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED,
				right : 10
			});
			done.addEventListener('click', function(e) {
				if (type === Ti.UI.PICKER_TYPE_DATE) {
					o.textField.value = dateToString(picker.value);
				} else {
					o.textField.value = picker.getSelectedRow(0).title;
				}

				modalWin.close();
			});

			var spacer = Titanium.UI.createButton({
				systemButton : Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
			});

			var toolbar = Ti.UI.createView({
				height : 43,
				backgroundColor : '#bbb'
			});

			toolbar.add(cancel);
			toolbar.add(done);
			container.add(toolbar);
			container.add(picker);
			modalWin.add(overlay);
			modalWin.add(container);

			modalWin.setSelected = function(value, data) {
				Ti.API.log('iphone picker SetSelected:' + value);
				Ti.API.log(data);

				if (type === Ti.UI.PICKER_TYPE_DATE) {
					picker.value = stringToDate(value);
				} else {
					var sel = findOffset(value, data);
					picker.setSelectedRow(0, sel);
				}

			}
			return modalWin;
		};
	}());
