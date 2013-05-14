/**
 * FoodCare City
 * Author: FoodCare Inc. Copyright 2013. All Rights Reserved
 * This file contains the code to render the Modal Date Picker on Android platform.
 **/

( function() {

		var stringToDate = Ti.App.Util.stringToDate;
		var dateToString = Ti.App.Util.dateToString;
		var isValidDate = Ti.App.Util.isValidDate;
		var findOffset = Ti.App.Util.findOffset;

		exports.createAndroidModalPicker = function(pickerType) {

			var type = pickerType.type === undefined ? Ti.UI.PICKER_TYPE_PLAIN : pickerType.type;

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

			var picker = createDatePicker({
				format : "DD/MMMM/YYYY",
				top : 20
			})

			var cancel = Ti.UI.createButton({
				title : 'Cancel',
				left : 10
			});

			cancel.addEventListener('click', function(event) {
				modalWin.close();
				pickerType.textField.blur();
			});

			var done = Ti.UI.createButton({
				title : 'Done',
				right : 10
			});

			done.addEventListener('click', function(event) {

				if (type === Ti.UI.PICKER_TYPE_DATE) {
					pickerType.textField.value = dateToString(picker.value);
				} else {
					pickerType.textField.value = picker.getSelectedRow(0).title;
				}
				modalWin.close();
				pickerType.textField.blur();
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
			//call this function to call android date picker
			function createDatePicker(props) {
				//regex to match the date format
				var format = props.format.match(/^(.+?)\/(.+?)\/(.+?)$/) || ["", "DD", "MMM", "YYYY"];

				var picker = Ti.UI.createPicker({
					botom : 0,
					useSpinner : true
				});

				picker.dateColumns = {};
				picker.dateColumns[format[1].substr(0, 1)] = 0;
				picker.dateColumns[0] = format[1].substr(0, 1);
				picker.dateColumns[format[2].substr(0, 1)] = 1;
				picker.dateColumns[1] = format[2].substr(0, 1);
				picker.dateColumns[format[3].substr(0, 1)] = 2;
				picker.dateColumns[2] = format[3].substr(0, 1);

				picker.months = [];
				for (var i = 0; i < 12; i++) {
					//calculate the month from temp date
					var tempDate = new Date();
					tempDate.setMonth(i);
					var month = tempDate.toLocaleDateString().match(/\s(\w+?)\s/)[1];

					picker.months[i] = {};
					picker.months[i].MMMM = month;
					picker.months[i].MMM = month.substr(0, 3);
					picker.months[i].MM = ((i + 1) < 10 ? "0" : "") + (i + 1);
					picker.months[i].M = i + 1;
				}

				Object.defineProperty(picker, "value", {

					//get the date object from the date picker
					get : function() {

						var day = Number(this.getSelectedRow(this.dateColumns["D"]).title);
						var month = this.getSelectedRow(this.dateColumns["M"]).title;
						var year = Number(this.getSelectedRow(this.dateColumns["Y"]).title);
						var days = new Date(year, (new Date(month + "  1," + year).getMonth() + 1), 0).getDate();
						if (day > days)
							day = days
						var date = new Date(month + " " + day + "," + year);
						return (date);
					},
					//set the date selected in the date picker
					set : function(date) {

						var days = new Date(date.getFullYear(), (date.getMonth() + 1), 0).getDate();
						value = date;
						var dayColumn = this.columns[this.dateColumns["D"]];
						if (dayColumn.rows.length > days) {
							for (var i = dayColumn.rows.length; i > days; i--) {
								dayColumn.removeRow(dayColumn.rows[i - 1]);
							}

						} else if (dayColumn.rows.length < days) {
							for (var i = dayColumn.rows.length; i < days; i++) {
								var row = Ti.UI.createPickerRow({
									title : i + 1
								});
								dayColumn.addRow(row);
							}
						}
						this.setSelectedRow(this.dateColumns["D"], (date.getDate() - 1));
						this.setSelectedRow(this.dateColumns["M"], date.getMonth());
						this.setSelectedRow(this.dateColumns["Y"], (date.getFullYear() - Number(this.columns[this.dateColumns["Y"]].rows[0].title)));
					}
				})

				var cols = {};
				cols.D = Ti.UI.createPickerColumn();
				for (var i = 0, days = new Date(new Date().getFullYear(), (new Date().getMonth() + 1), 0).getDate(); i < days; i++) {

					var row = Ti.UI.createPickerRow({
						title : (format[(picker.dateColumns["D"] + 1)] == "DD" ? (i < 10 ? "0" : "") + (i + 1) : (i + 1))
					});
					cols.D.addRow(row);
					cols.D.col = "D";
				}
				cols.M = Ti.UI.createPickerColumn();

				for (var i = 0; i < 12; i++) {
					var row = Ti.UI.createPickerRow({
						title : picker.months[i][(picker.months[i][format[(picker.dateColumns["M"] + 1)]] ? format[(picker.dateColumns["M"] + 1)] : "MMM")]
					});
					cols.M.addRow(row);
					cols.M.col = "M";
				}
				cols.Y = Ti.UI.createPickerColumn();
				for (var i = (new Date().getFullYear() - 100); i < (new Date().getFullYear() + 100); i++) {
					var row = Ti.UI.createPickerRow({
						title : i
					});
					cols.Y.addRow(row);
					cols.Y.col = "Y";
				}
				picker.add(cols[picker.dateColumns[0]]);
				picker.add(cols[picker.dateColumns[1]]);
				picker.add(cols[picker.dateColumns[2]]);
				picker.setSelectedRow(0, 0);
				picker.setSelectedRow(1, 0);
				picker.setSelectedRow(2, 0);
				for (var prop in props) {
					picker[prop] = props[prop];
				}
				picker.addEventListener('change', function(e) {
					if (e.column.col == "M") {
						if (picker.to)
							clearTimeout(picker.to);
						picker.to = setTimeout(function(picker) {
							picker.value = picker.value;
						}, 300, this);
					}
				});
				return picker
			}

			return modalWin;
		};
	}());
