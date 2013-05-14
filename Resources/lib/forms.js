/**
 * FoodCare City
 * Author: FoodCare Inc. Copyright 2013. All Rights Reserved
 * Forms module, based on Forging Titanium
 */
(function() {

	var S = require('struct/struct').S;

	var $$ = S.UI.properties;
	var ui = S.UI;

	var stringToDate = Ti.App.Util.stringToDate;
	var dateToString = Ti.App.Util.dateToString;
	var isValidDate = Ti.App.Util.isValidDate;
	var findOffset = Ti.App.Util.findOffset;

	// "Constants"
	exports.STYLE_HINT = 'hint';
	exports.STYLE_LABEL = 'label';

	exports.TYPE_DATE = 'date';
	exports.TYPE_EMAIL = 'email';
	exports.TYPE_NUMBER = 'number';
	exports.TYPE_PASSWORD = 'password';
	exports.TYPE_PHONE = 'phone';
	exports.TYPE_PICKER = 'picker';
	exports.TYPE_TEXT = 'text';
	exports.TYPE_SUBMIT = 'submit';
	exports.TYPE_CHECKBOX = 'checkbox';
	exports.TYPE_CHECKBOX1 = 'checkbox1';
	exports.TYPE_CHECKBOX2 = 'checkbox2';
	exports.TYPE_HEIGHT = 'height';
	exports.TYPE_LABEL = 'label';
	exports.TYPE_TEXTIMAGE = 'text_image';
	exports.TYPE_PASSWORDIMAGE = 'password_image';

	exports.states = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia'];

	var isAndroid = Ti.Platform.osname === 'android';
	var textFieldDefaults = {
		height : '45dp',
		top : '10dp',
		width : '270dp',
		color : '#222',
		borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
		// opacity: 0.80
	};
	//textfield with images
	var textFieldImage = {
		hintText : 'enter first name',
		height : '45dp',
		top : '20dp',
		width : '270dp',
		paddingLeft : '40dp',
	};
	//password field with images
	var passwordFieldImage = {
		hintText : 'enter first name',
		height : '45dp',
		top : '10dp',
		width : '270dp',
		paddingLeft : '40dp',
	};
	var keyboardMap = {};
	keyboardMap[exports.TYPE_EMAIL] = Ti.UI.KEYBOARD_EMAIL;
	keyboardMap[exports.TYPE_TEXTIMAGE] = Ti.UI.KEYBOARD_EMAIL;
	keyboardMap[exports.TYPE_NUMBER] = Ti.UI.KEYBOARD_NUMBER_PAD;
	// Ti.UI.KEYBOARD_DEFAULT;
	keyboardMap[exports.TYPE_PASSWORDIMAGE] = Ti.UI.KEYBOARD_DEFAULT;
	keyboardMap[exports.TYPE_PASSWORD] = Ti.UI.KEYBOARD_DEFAULT;
	keyboardMap[exports.TYPE_PHONE] = Ti.UI.KEYBOARD_NUMBER_PAD;
	keyboardMap[exports.TYPE_TEXT] = Ti.UI.KEYBOARD_DEFAULT;

	var handleStyle = function(form, textField, title) {
		if (form.fieldStyle === exports.STYLE_HINT && textField) {
			textField.hintText = title;
		} else {
			var color = '#222';

			form.container.add(Ti.UI.createLabel({
				text : ' ' + title + ': ',
				top : '10dp',
				left : '35dp',
				color : 'black',
				opacity : 0.6,
				radius : 6,
				font : {
					fontSize : '16sp',
					fontWeight : 'bold'
				},
				height : 'auto',
				width : 'auto'
			}));
			if (textField) {
				textField.top = '5dp';
			}
		}
	};
	//Sets the date in the picker text field
	var setupPickerTextField = function(textField, pickerType, data, value) {
		textField.editable = false;
		textField.rightButton = Ti.UI.createButton({
			style : Ti.UI.iPhone.SystemButton.DISCLOSURE,
			transform : Ti.UI.create2DMatrix().rotate(90)
		});
		textField.rightButtonMode = Ti.UI.INPUT_BUTTONMODE_ALWAYS;
		if (value)
			textField.value = value;

		textField.addEventListener('focus', function(textEvent) {
			textEvent.source.blur();

			//call the modal date picker
			var picker = require('/lib/semiModalPicker').createSemiModalPicker({
				textField : textField,
				value : textField.value,
				type : pickerType,
				data : data
			});

			picker.setSelected(textField.value, data);
			// Picker's are modal. Android sends multiple click
			// events before the window can pop-up. Without this,
			// we have a race condition and the probability of multiple pickers.
			picker.open({
				animated : true,
				modal : true
			});

		});
	};

	//set up the date picker for Android platform
	var setupPickerAndroid = function(textField, pickerType, data, value) {
		textField.editable = false;
		textField.rightButton = Ti.UI.createButton({
			style : Ti.UI.iPhone.SystemButton.DISCLOSURE,
			transform : Ti.UI.create2DMatrix().rotate(90)
		});
		textField.rightButtonMode = Ti.UI.INPUT_BUTTONMODE_ALWAYS;
		//set textfield value
		if (value)
			textField.value = value;

		textField.addEventListener('focus', function(textEvent) {
			textEvent.source.blur();

			var picker = require('/lib/androidModalPicker').createAndroidModalPicker({
				textField : textField,
				value : textField.value,
				type : pickerType,
				data : data
			});

			picker.setSelected(textField.value, data);
			// Picker's are modal. Android sends multiple click
			// events before the window can pop-up. Without this,
			// we have a race condition and the probability of multiple pickers.
			picker.open({
				animated : true,
				modal : true
			});

		});
	};

	var ctr = 1;
	var addField = function(field, fieldRefs) {
		var title = field.title || ('field' + ctr++);
		var id = field.id || title;
		var type = field.type || exports.TYPE_TEXT;
		var form = this;
		var fieldObject = undefined;

		if (field.size === 'small') {
			textFieldDefaults.width = '125dp';
		} else {
			textFieldDefaults.width = '250dp';
			// default
		}

		if (type === exports.TYPE_TEXT || type === exports.TYPE_EMAIL || type === exports.TYPE_NUMBER || type === exports.TYPE_PHONE || type === exports.TYPE_PASSWORD) {
			fieldObject = Ti.UI.createTextField(textFieldDefaults);
			if (field.value) {
				fieldObject.value = field.value;
			}

			// be sure this works on Android
			fieldObject.keyboardType = keyboardMap[type];

			fieldObject.passwordMask = type === exports.TYPE_PASSWORD;
			if (type === exports.TYPE_EMAIL) {
				fieldObject.autocorrect = false, fieldObject.autocapitalization = Titanium.UI.TEXT_AUTOCAPITALIZATION_NONE;
				fieldObject.clearButtonMode = Titanium.UI.INPUT_BUTTONMODE_ONFOCUS;
				fieldObject.keyboardType = Titanium.UI.KEYBOARD_EMAIL;
			}
			handleStyle(form, fieldObject, title);
		} else if (type === exports.TYPE_LABEL) {
			fieldObject = createLabel(field);
			//    handleStyle(form, fieldObject, title);
		} else if (type === exports.TYPE_CHECKBOX) {
			fieldObject = checkbox(field);
			handleStyle(form, fieldObject, title);
		} else if (type === exports.TYPE_CHECKBOX1) {
			fieldObject = checkbox1(field);
			handleStyle(form, fieldObject, title);
		} else if (type === exports.TYPE_CHECKBOX2) {
			fieldObject = checkbox2(field);
			handleStyle(form, fieldObject, title);
		} else if (type == exports.TYPE_HEIGHT) {
			fieldObject = createHeightField(field);
			handleStyle(form, fieldObject, title);
		} else if (type === exports.TYPE_DATE) {

			if (isAndroid) {

				//For adding datepicker as spinner because of 13 yeary birthday issue.
				fieldObject = Ti.UI.createTextField(textFieldDefaults);
				handleStyle(form, fieldObject, title);
				setupPickerAndroid(fieldObject, Ti.UI.PICKER_TYPE_DATE);

			} else {
				fieldObject = Ti.UI.createTextField(textFieldDefaults);
				handleStyle(form, fieldObject, title);
				setupPickerTextField(fieldObject, Ti.UI.PICKER_TYPE_DATE);
			}
		} else if (type === exports.TYPE_PICKER) {
			if (isAndroid) {
				fieldObject = Ti.UI.createPicker({
					type : Ti.UI.PICKER_TYPE_PLAIN,
					width : '250dp'
				});
				handleStyle(form, undefined, title);
				for (var i in field.data) {
					fieldObject.add(Ti.UI.createPickerRow({
						title : field.data[i]
					}));
				}

				fieldObject._data = field.data;

				fieldObject.setValue = function(value) {
					var self = fieldObject;
					var data = self._data;
					self.value = value;
					S.Log.trace('Picker Set Value: ' + value);
					var sel = 0;

					for (var i = 0; i < data.length; i++) {
						Ti.API.log('==' + value + ' ?= ' + data[i]);
						if (value === data[i]) {
							sel = i;
						}
						self.setSelectedRow(0, sel)
						Ti.API.log('setSelected: ' + sel);
					}
				}

				fieldObject.getValue = function() {
					var self = fieldObject;
					var data = self._data;

					S.Log.trace('Picker Get Value');
					var value = self.getSelectedRow(0).title;
					S.Log.print(value);
					return value;
				}

				fieldObject.clearValue = function() {
					S.Log.trace('Picker Clear Selected Value');
					var self = fieldObject;
					self.setSelectedRow(0, 0);
				}
			} else {
				fieldObject = Ti.UI.createTextField(textFieldDefaults);
				handleStyle(form, fieldObject, title);
				setupPickerTextField(fieldObject, Ti.UI.PICKER_TYPE_PLAIN, field.data);
			}

		} else if (type === exports.TYPE_SUBMIT) {
			var button;

			if (field.name) {
				button = S.UI.createButton({
					title : title,
					top : '10dp',
					name : field.name
				});
			} else {
				button = S.UI.createButton(S.combine(ui.properties.Button, {
					title : title,
					top : '10dp'
				}));
			}

			button.addEventListener('click', function(e) {
				var blurred = false;
				S.Log.trace('form button click');
				var values = {};
				values = getData(form, fieldRefs);

				S.Log.print_r(fieldRefs);

				for (var i in fieldRefs) {
					// values[i] = fieldRefs[i].value;
					// Force Keyboard to hide
					if (!blurred) {
						if (fieldRefs[i].type === exports.TYPE_TEXT) {
							fieldRefs[i].blur();
							blurred = true;
						}
					}

				}
				S.Log.print(values)
				form.fireEvent(id, {
					values : values
				});
			});
			form.container.add(button);
		} else if (type === exports.TYPE_TEXTIMAGE) {
			textFieldImage.backgroundImage = field.backgroundImage;
			fieldObject = Ti.UI.createTextField(textFieldImage);
			if (field.value) {
				fieldObject.value = field.value;
			}

			// be sure this works on Android
			fieldObject.keyboardType = keyboardMap[type];

			fieldObject.autocorrect = false, fieldObject.autocapitalization = Titanium.UI.TEXT_AUTOCAPITALIZATION_NONE;
			fieldObject.clearButtonMode = Titanium.UI.INPUT_BUTTONMODE_ONFOCUS;
			fieldObject.keyboardType = Titanium.UI.KEYBOARD_EMAIL;
			handleStyle(form, fieldObject, title);
		} else if (type === exports.TYPE_PASSWORDIMAGE) {
			passwordFieldImage.backgroundImage = field.backgroundImage;
			fieldObject = Ti.UI.createTextField(passwordFieldImage);
			if (field.value) {
				fieldObject.value = field.value;
			}

			// be sure this works on Android
			fieldObject.keyboardType = keyboardMap[type];

			fieldObject.passwordMask = type === exports.TYPE_PASSWORDIMAGE;
			fieldObject.autocorrect = false, fieldObject.autocapitalization = Titanium.UI.TEXT_AUTOCAPITALIZATION_NONE;
			fieldObject.clearButtonMode = Titanium.UI.INPUT_BUTTONMODE_ONFOCUS;
			fieldObject.keyboardType = Titanium.UI.KEYBOARD_EMAIL;
			handleStyle(form, fieldObject, title);
		}

		// Set the value
		if (field.value) {
			try {
				if (fieldObject.setValue) {
					fieldObject.setValue(field.value + '');
				} else {
					fieldObject.value = field.value + '';
				}
			} catch(error) {
				S.Log.debug(error);
			}
		}

		// Add our prepared UI component to the form
		if (fieldObject) {
			form.container.add(fieldObject);
			if ('label' !== type) {
				fieldRefs[id] = fieldObject
			};
		}
	};

	var addFields = function(fields, fieldRefs) {
		for (var i in fields) {
			this.addField(fields[i], fieldRefs);
		}
	};

	exports.setData = function(form, values) {
		S.Log.trace('+form setData');
		S.Log.print_r(form.fieldRefs);
		for (var i in form.fieldRefs) {
			var value = values[i];
			if (!value) {
				value = '';
			} else {
				value = value + '';
			}

			if (value === 'undefined') {
				value = '';
			}
			try {
				form.fieldRefs[i].value = value;
				if (form.fieldRefs[i].setValue) {
					form.fieldRefs[i].setValue(value);
				}
			} catch(err) {
				S.Log.debug(err);
			}
		}
		S.Log.trace('-form setData');
	}

	exports.clearData = function(form) {
		S.Log.trace('+cleardata ');
		for (var i in form.fieldRefs) {
			if (form.fieldRefs[i].clearValue) {
				form.fieldRefs[i].clearValue();
			} else {
				form.fieldRefs[i].value = '';
			}
		}
	}

	exports.getData = getData;

	function getData(form, fieldRefs) {
		S.Log.trace('+getdata ');
		var values = {};
		if (!fieldRefs) {
			fieldRefs = form.fieldRefs;
		}

		for (var i in fieldRefs) {
			if (fieldRefs[i].getValue) {
				values[i] = fieldRefs[i].getValue();
			} else {
				values[i] = fieldRefs[i].value;
			}
			S.Log.print(i + ': ' + values[i]);
		}
		return values;
	}


	exports.createForm = function(o) {
		var container = Ti.UI.createView({
			layout : 'vertical',
			height : 'auto'
		});
		var fieldRefs = {};
		var form = Ti.UI.createScrollView({
			contentHeight : 'auto',
			contentWidth : 'auto',
			showVerticalScrollIndicator : true,
			showHorizontalScrollIndicator : true,

			// new stuff
			container : container,
			fieldStyle : o.style || exports.STYLE_HINT,
			addField : addField,
			addFields : addFields
		});

		form.addFields(o.fields, fieldRefs);
		form.add(container);

		// Add this so each field can be accessed directly from setData
		form.fieldRefs = fieldRefs;

		// Hide the keyboard if we click outside the form
		// expand this into a method for the form
		form.addEventListener('click', function(e) {
			S.Log.print('Form Click');
			S.Log.print_r(e.source);

			// We only want events from outside the form field
			// Is there a better way to find out if this is the
			// container view?
			if ('auto' === e.source.height)
				// Ti.UI.Android.hideSoftKeyboard();
				for (var field in fieldRefs) {
					if (fieldRefs[field].blur) {
						S.Log.print(field + ' blur');
						fieldRefs[field].blur();
					}
				}
		});

		return form;
	};

	function createLabel(field) {

		var opacity;
		if (field.bgOpacity) {
			opacity = field.bgOpacity;
		} else {
			opacity = 0.75;
		}
		S.Log.print(field);
		S.Log.trace('+createLabel:' + opacity);
		var colorLabel;
		if (field.color) {
			colorLabel = field.color;
		} else {
			colorLabel = 'black';
		}
		var l1x = Titanium.UI.createLabel({
			id : field.id,
			text : field.title,
			top : 0,
			height : 'auto', // field.height,
			width : '90%',
			textAlign : 'left', // 'center',
			color : colorLabel,
			backgroundColor : 'white',
			borderRadius : '10dp',
			opacity : opacity,

			backgroundLeftCap : '10dp',
			backgroundRightCap : '10dp',
			backgroundRadius : '5dp',
			backgroundPaddingLeft : '20dp',
			backgroundPaddingRight : '20dp',
			backgroundPaddingTop : '20dp',
			backgroundPaddingBottom : '20dp',
		});

		var l1 = Titanium.UI.createLabel({
			id : field.id,
			text : field.title,
			top : 0,
			height : 'auto',
			width : '90%',
			textAlign : 'left',
			color : colorLabel,

			backgroundLeftCap : '10dp',
			backgroundRightCap : '10dp',
			backgroundRadius : '5dp',
			backgroundPaddingLeft : '20dp',
			backgroundPaddingRight : '20dp',
			backgroundPaddingTop : '20dp',
			backgroundPaddingBottom : '20dp',

		});

		return l1;

		// var label = Ti.UI.createView( { backgroundColor: 'white', opacity: opacity, top: 10, height: field.height + 10, width: '95%', borderRadius: 10 });
		// label.add(l1);

		var label = Ti.UI.createView({
			backgroundColor : 'white',
			top : '10dp',
			height : field.height + 10 + 'dp',
			opacity : opacity,
			width : '95%',
			borderRadius : '10dp'
		});
		label.add(l1);

		return label;

	}

	function createHeightField(field) {
		S.Log.trace('+createHeightField');
		var value = field.value || 66;

		var view = Ti.UI.createView(S.combine(textFieldDefaults, {
			value : value,
			backgroundColor : 'white',
			borderRadius : 4
		}));

		view.gather = function() {
			S.Log.trace("+gather:  " + view.value + ' (' + view.ftField.value + ',' + view.inchField.value + ')')
			view.value = parseInt(view.inchField.value) + parseInt(view.ftField.value) * 12 + '';
			//    view.setValue(view.value + '');
		}

		view.setValue = function(value) {
			S.Log.trace("+setValue:  " + value);
			try {
				if ('' === value)
					value = 0;
				if (value) {
					view.value = parseInt(value, 10);
					if (isNaN(view.value))
						view.value = 0;
					if (view.value < 0)
						view.value = 0;
					if (view.value > 100)
						view.value = 0;
				}
				view.ftField.value = Math.floor(view.value / 12) + '';
				view.inchField.value = view.value % 12 + '';
			} catch(err) {
				S.Log.debug(err);
			}
			S.Log.trace("-setValue:  " + value);
		}

		S.Log.trace('1. createHeightField');

		view.ftField = Ti.UI.createTextField(S.combine(textFieldDefaults, {
			width : '40dp',
			hintText : 'ft',
			top : 0,
			left : '70dp',
			value : '',
			keyboardType : keyboardMap[exports.TYPE_NUMBER]
		}));
		view.ftField.addEventListener('blur', function(e) {
			view.gather()
		});

		view.inchField = Ti.UI.createTextField(S.combine(textFieldDefaults, {
			width : '40dp',
			hintText : 'in',
			left : '140dp',
			top : 0,
			value : '',
			keyboardType : keyboardMap[exports.TYPE_NUMBER]
		}));
		view.inchField.addEventListener('blur', function(e) {
			view.gather()
		});

		S.Log.trace('2. createHeightField');
		view.add(Ti.UI.createLabel(S.combine(textFieldDefaults, {
			width : '60dp',
			top : 0,
			left : '5dp',
			text : 'Height'
		})));
		view.add(Ti.UI.createLabel(S.combine(textFieldDefaults, {
			width : '120dp',
			top : 0,
			left : '120dp',
			text : 'ft'
		})));
		view.add(Ti.UI.createLabel(S.combine(textFieldDefaults, {
			width : '180dp',
			top : 0,
			left : '190dp',
			text : 'inches'
		})));

		S.Log.trace('3. createHeightField');
		view.add(view.ftField);
		view.add(view.inchField);
		S.Log.trace('-createHeightField');
		return view;
	}

	function checkbox1(field) {
		S.Log.print('+checkbox');
		S.Log.print(field);

		var checkbox = Ti.UI.createView(S.combine(textFieldDefaults, {
			backgroundColor : 'white',
			borderRadius : 4
		}));
		var height;
		var width;
		var left;

		if (Ti.Platform.osname == "iphone") {
			height = 25;
			width = 25;
			left = 50;
		} else if (Ti.Platform.osname == "android") {
			height = 50;
			width = 50;
			left = 65;
		}

		var check = Ti.UI.createButton({
			title : "\u2713",
			top : 10,
			left : 10,
			width : width,
			height : height,
			borderColor : 'none',
			borderWidth : 0,
			borderRadius : 0, // 15,
			backgroundImage : 'none',
			color : '#000',
			font : {
				fontSize : 25,
				fontWeight : 'bold'
			},
			image : '/images/buttons/checkbox.png'
		});

		//Attach some simple on/off actions
		checkbox.on = function() {
			// check.color = 'black';
			// check.title = "\u2713";
			check.image = '/images/buttons/checkbox-tick.png';
			checkbox.value = true;
		};

		checkbox.off = function() {
			// check.color = 'black'; // '#159902'; // '#aaa';
			// check.title = '';
			check.image = '/images/buttons/checkbox.png';
			checkbox.value = false;
		};

		check.addEventListener('click', function(e) {
			if (false == checkbox.value) {
				checkbox.on();
			} else {
				checkbox.off();
			}
		});

		checkbox.add(check);
		if (field.value) {
			checkbox.on();
		} else {
			checkbox.off();
		}
		checkbox.check = check;

		if (field.terms_callback) {
			var label = Ti.UI.createLabel({
				left : left,
				text : field.title,
				color : 'blue'
			});
			label.addEventListener('click', field.terms_callback);
		} else {
			var label = Ti.UI.createLabel({
				left : left,
				text : field.title,
				color : 'black'
			});
		}

		checkbox.add(label);

		return checkbox;
	}

	function checkbox2(field) {
		S.Log.print('+checkbox');
		S.Log.print(field);

		var checkbox = Ti.UI.createView(S.combine(textFieldDefaults, {
			backgroundColor : 'black',
			borderRadius : 4
		}));

		var height;
		var width;
		var left;

		if (Ti.Platform.osname == "iphone") {
			height = 30;
			width = 30;
			left = 50;
		} else if (Ti.Platform.osname == "android") {
			height = 50;
			width = 50;
			left = 65;
		}

		var check = Ti.UI.createButton({
			title : "\u2713",
			top : 10,
			left : 10,
			width : width,
			height : height,
			borderColor : 'none',
			borderWidth : 0,
			borderRadius : 0,
			backgroundImage : 'none',
			color : '#fff',
			font : {
				fontSize : 25,
				fontWeight : 'bold'
			},
			image : '/images/buttons/checkbox.png'
		});

		//Attach some simple on/off actions
		checkbox.on = function() {
			// check.backgroundColor = '#159902'; // '#aaa';
			// check.title = "\u2713";
			check.image = '/images/buttons/checkbox-tick.png';
			checkbox.value = true;
		};

		checkbox.off = function() {
			// check.backgroundColor = S.Cfg.color.Salmon; // '#159902';
			// check.title = 'X';
			check.image = '/images/buttons/checkbox.png';
			checkbox.value = false;
		};

		checkbox.addEventListener('click', function(e) {
			S.Log.print(e);
			if (false === checkbox.value) {
				S.Log.print('on');
				checkbox.on();
			} else {
				S.Log.print('off');
				checkbox.off();
			}
		});

		checkbox.add(check);
		if (field.value) {
			checkbox.on();
		} else {
			checkbox.off();
		}
		checkbox.check = check;

		var label = Ti.UI.createLabel({
			left : left,
			text : field.title,
			color : 'white'
		});

		checkbox.add(label);

		return checkbox;
	}

	var checkbox = checkbox1;

})();
