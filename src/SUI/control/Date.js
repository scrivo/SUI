/* Copyright (c) 2011, Geert Bergman (geert@scrivo.nl)
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 * 3. Neither the name of "Scrivo" nor the names of its contributors may be
 *    used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 *
 * $Id: Date.js 786 2013-08-09 13:26:51Z geert $
 */

"use strict";

SUI.control.Date = SUI.defineClass(
	/** @lends SUI.control.Date.prototype */{

	/** @ignore */ baseClass: SUI.Box,

	/**
	 * @class
	 * SUI.control.Date is a control for date entry. It displays date and or
	 * time entry fields and a button for a date/time selection  box. The
	 * control works in a JavaScript setting, but also as a form field. The
	 * order in which the date fields are presented depends on the
	 * internationalization settings.
	 *
	 * @augments SUI.Box
	 *
	 * @description
	 * Create a date(time) control: a set of input fields in the order of
	 * date(time) format, together with a button for a date(time) dialog
	 * box to facilitate date entry.
	 *
	 * @constructs
	 * @param see base class
	 * @param {Date} arg.value Initial date(time) to show in the control.
	 * @param {String} arg.type "date" (default), "time" or "datetime"
	 */
	initializer: function(arg) {

		SUI.control.Date.initializeBase(this, arg);

		// set the control's type, default to date
		this._type = arg.type || "date";
		// initialize the fields array
		this._fields = [];

		// for the button set overflow to visible
		this.el().style.overflow = "visible";

		// get the internationalized date format ...
		var df = SUI.i18n.dateFormat;
		if (this._type == "datetime") {
			df = SUI.i18n.dateFormat + " " + SUI.i18n.timeFormat;
		} else if (this._type == "time") {
			df = SUI.i18n.timeFormat;
		}
		// create a hidden control that will contains a single string
		// representation of the date in the input fields of the control.
		// Note: can't add to doc tree and set type afterwards in IE
		this._hidden = new SUI.form.Input({/*parent: this*/});
		this._hidden.el().type = "hidden";
		this._hidden.el().name = arg.name || this.el().id;
		this._hidden.parent(this);

		// ... and use that set the control's fields in that order
		var l = this._addInputFields(df);

		// create a button that opens the date dialog box
		var that = this;
		this._button = new SUI.ToolbarButton({
			parent: this,
			left: l + this.BUTTON_MARGIN,
			width: this.BUTTON_SIZE,
			height: this.BUTTON_SIZE,
			top: (this.HEIGHT-this.BUTTON_SIZE)/2,
			title: "", // TODO
			icon: this._type == "time"
				? SUI.resource.calTime : SUI.resource.calDate,
			handler: function() {
				new SUI.dialog.Calendar({
					type: that._type,
					date: that._toDate(),
					onOK: function(date) {
						that._setDate(date);
				 }
				}).show();
			}
		});

		// also add the button and the hidden field so that they will be
		// handled by layOut and display
		this._fields.push(this._hidden);
		this._fields.push(this._button);

		// set the width and height of the control
		this.width(this._button.left() + this._button.width());
		this.height(this.HEIGHT);

		// if a value as given in the arguments ...
		if (arg.value) {
		 // ... put that value into the control
			this._setValue(arg.value);
		}
	},

	/**
	 * Margin between the button and the input fields.
	 */
	BUTTON_MARGIN: 7,

	/**
	 * Size (width/height) of the button
	 */
	BUTTON_SIZE: 22,

	/**
	 * Height of the control (not that the button is larger)
	 */
	HEIGHT: 20,

	/**
	 * Width of the 2 digit input fields (day, month, minutes, hours)
	 */
	WIDTH_2: 20,

	/**
	 * Width of the 4 digit input field (year)
	 */
	WIDTH_4: 36,

	/**
	 * Width between the input fields
	 */
	WIDTH_SEP: 10,

	/**
	 * Display the date control. Set the CSS size and position of the input
	 * fields and button.
	 */
	display: function() {
		this.setDim();
		for (var i=0; i<this._fields.length; i++) {
			this._fields[i].display();
		}
	},

	/**
	 * Return the first input field of the control. This is needed to set the
	 * forBox (for) field of a label field.
	 * @return {SUI.Box} the first input box of the date control.
	 */
	firstBox: function() {
		return this._fields[0];
	},

	/**
	 * Lay out the date control. Calculate the sizes and positions of the
	 * input fields and button.
	 */
	layOut: function() {
		for (var i=0; i<this._fields.length; i++) {
			this._fields[i].layOut();
		}
	},

	/**
	 * Get or set the value of the date control.
	 * @param {string|Date} v Either a JavaScript Date object or string in SQL
	 *     Date format to which the control's date will be set. Or the string
	 *     "date" or "string" to select the return type of the function. If no
	 *     parameter is given, the method returns an object. containing the
	 *     fields: date, dateStr and error.
	 * @returns {Object|string|Date} Depending on the given arguments the
	 *     return value can be an object containing the fields: date, dateStr
	 *     and error (no arguments), a Date object (argument: "date") or
	 *     a date string in SQL format (argument: "string"). If the method is
	 *     used as a setter the method returns null.
	 */
	value: function(v) {
	 // act as a getter
	 if (v === undefined) {
	   return this._getValue();
	 } else if (v === "string") {
	   return this._getValue().strDate;
	 } else if (v === "date") {
	   return this._getValue().date;
		}
	 // got here? than act as a setter
	 this._setValue(v);
	 return null;
	},

	// the button that opens the date selection dialog
	_button: null,

	// the day input field
	_day: null,

	// list of all the child boxes of this control
	_fields: null,

	// hidden input field that holds a SQL date string of value set in control
	_hidden: null,

	// the hours input field
	_hour: null,

	// the minutes input field
	_min: null,

	// the month input field
	_month: null,

	// the control's type: date time or datetime
	_type: "",

	// the year input field
	_year: null,

	// add the date input fields including the characters in between them to
	// the _fields array, and add event listeners to the input fields
	_addInputFields: function(df) {

	 // current left position of the field/text
		var l = 0;
	 // loop through the characters of the format string
		for (var i=0; i<df.length; i++) {
		 // add a input field or text for each character in format string
			switch(df.charAt(i)) {

			case "d":
			 // add a 2 character field for the day
				this.day = new SUI.form.Input(
					{parent: this, left: l, width: this.WIDTH_2 });
				this.day.el().maxLength = 2;
				this._fields.push(this.day);
				l += this.WIDTH_2;
				break;

			case "m":
			 // add a 2 character field for the month
				this.month = new SUI.form.Input(
					{parent: this, left: l, width: this.WIDTH_2 });
				this.month.el().maxLength = 2;
				this._fields.push(this.month);
				l += this.WIDTH_2;
				break;

			case "y":
			 // add a 4 character field for the year
				this.year = new SUI.form.Input(
					{parent: this, left: l, width: this.WIDTH_4 });
				this.year.el().maxLength = 4;
				this._fields.push(this.year);
				l += this.WIDTH_4;
				break;

			case "h":
			 // add a 2 character field for the hours
				this.hour = new SUI.form.Input(
					{parent: this, left: l, width: this.WIDTH_2 });
				this.hour.el().maxLength = 2;
				this._fields.push(this.hour);
				l += this.WIDTH_2;
				break;

			case "i":
			 // add a 2 character field for the minutes
				this.min = new SUI.form.Input(
					{parent: this, left: l, width: this.WIDTH_2 });
				this.min.el().maxLength = 2;
				this._fields.push(this.min);
				l += this.WIDTH_2;
				break;

			default:
			 // add a 1 character field for the (separator) character
				var tmp = new SUI.TextBox({parent: this, text: df.charAt(i),
					left: l, width: this.WIDTH_SEP, height: this.HEIGHT });
				tmp.el().style.textAlign = "center";
				this._fields.push(tmp);
				l += this.WIDTH_SEP;
				break;
			}
		}

		// set the hidden field on each "oninput" event on any of the input
		// fields
		var that = this;
		for (var i=0; i<this._fields.length; i++) {
			if (this._fields[i] instanceof SUI.form.Input) {
				SUI.browser.addEventListener(this._fields[i].el(), "input",
					function(e) {
						if (!that._setHidden()) {
							SUI.browser.noPropagation(e);
						}
					}
				);
			}
		}

		// return the total length of the controls so far
		return l;
	},

	// return the value of the control in different formats: as Date object,
	// SQL string and type "error/empty/date/time/datetime"
	_getValue: function(e) {
	 // start with the default return value
		var res = {date: null, strDate: "error", type: "error"};
		// is the control empty ...
		if (this._isEmpty()) {
		 // ... then set return values to empty ...
			res.type = "empty";
			res.strDate = "";
		} else {
		 // ... else try to construct a date value from the input fields ...
			var dt = this._toDate();
			if (dt) {
			 // (ascertain that the hidden field is set)
			 this._setHidden();
			 // ... if successful return these values
				res = {date: dt, strDate: this._hidden.el().value,
					type: this._type};
			}
		}
		// return the result
		return res;
	},

	// check if there are values entered in any of the date fields
	_isEmpty: function() {
	 // value to start with
		var res = "";
		// if we have date input fields ...
		if (this.year) {
			// ... add these values to res
			res += this.year.el().value + this.month.el().value +
				this.day.el().value;
		}
		// if we have time input fields ...
		if (this.hour) {
			// ... add these values to res
			res += this.hour.el().value + this.min.el().value;
		}
		// does a SUI.trim results in an empty string?
		return SUI.trim(res) === "";
	},

	// set the input field to the values given by the JavaScript Date object
	_setDate: function(date) {
		// if we have date input fields ...
		if (this.year) {
			if (date) {
				// ... set date fields with zero padded values ...
				this.year.el().value = SUI.date.padZero(date.getFullYear(), 4);
				this.day.el().value = SUI.date.padZero(date.getDate());
				this.month.el().value = SUI.date.padZero(date.getMonth()+1);
			} else {
				// ... else clear the values
				this.year.el().value = this.day.el().value =
					this.month.el().value = "";
			}
		}
		// if we have time input fields ...
		if (this.hour) {
			if (date) {
				// ... set time fields with zero padded values ...
				this.hour.el().value = SUI.date.padZero(date.getHours());
				this.min.el().value = SUI.date.padZero(date.getMinutes());
			} else {
				// ... else clear the values
				if (this.hour) {
					this.hour.el().value = this.min.el().value = "";
				}
			}
		}
		// set the hidden control field
		this._setHidden();
	},

	// set the hidden field to the current date selection in SQL date format
	// ("YY-MM-DD HH:II:SS"). "error" and "" are also possible values.
	_setHidden: function() {
	 // expect the worst
		var val = "error";
		// do none of the fields contain any values ...
		if (this._isEmpty()) {
		 // ... return an empty string ...
			val = "";
		} else {
			// ... get try the control's date selection ...
			var d = this._toDate();
			if (d) {
				// ... if successful set the SQL date string
				val = SUI.date.toSqlDate(d, this.hour);
			}
		}
		// set the hidden input field of the control
		this._hidden.el().value = val;
	},

	// set the value of the date control using an SQL date string or a
	// JavaScript Date object
	_setValue: function(val) {
	 // if the argument was no Date object ...
	 if (!(val instanceof Date)) {
			// ... was it null or empty? ...
			if (val === null || val === "") {
				// ... yes, then the value null will clear the fields ...
				val = null;
			} else {
				// ... no, try to convert it to a date
				val = SUI.date.parseSqlDate(val);
				if (!val) {
					throw "SUI.control.Date: "
						+ "_setValue called with invalid date";
				}
			}
	 }
	 // set the date into the control fields
	  this._setDate(val);
	},

	// get the values of the input fields and construct a JavaScript Date
	// object.
	_toDate: function() {

		// date object to return
		var dt = new Date();
		// is the date value is valid?
		var valid = true;

		// if we have date input fields ...
		if (this.year) {
		 // ... get the values ...
			var y = parseInt(this.year.el().value, 10);
			var m = parseInt(this.month.el().value, 10);
			var d = parseInt(this.day.el().value, 10);
			// ... set the values in the date object
			dt.setFullYear(y, m-1, d);
			// the JavaScript Date object corrects erroneous entry: 31th of
			// June becomes the 1th of July, so compare entered values with
			// the ones set in the date object.
			valid = valid && dt.getFullYear() === y &&
				(dt.getMonth() + 1) === m && dt.getDate() === d;
		}

		// if we have time input fields ...
		if (this.hour) {
		 // ... get the values ...
			var h = parseInt(this.hour.el().value, 10);
			if (isNaN(h)) {
				h = 0;
			}
			var i = parseInt(this.min.el().value, 10);
			if (isNaN(i)) {
				i = 0;
			}
			// ... set the values in the date object
			dt.setHours(h);
			dt.setMinutes(i);
			// the JavaScript Date object corrects erroneous entry: 14:65
			// becomes 15:05, so compare entered values with the
			// ones set in the date object.
			valid = valid && dt.getHours() === h && dt.getMinutes() === i;
		}

		// return the result
		return valid ? dt : null;
	}

});
