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
 * $Id: HSVColorPicker.js 786 2013-08-09 13:26:51Z geert $
 */

"use strict";

SUI.control.HSVColorPicker = SUI.defineClass(
	/** @lends SUI.control.HSVColorPicker.prototype */{

	/** @ignore */ baseClass: SUI.AnchorLayout,

	/**
	 * @class
	 * SUI.control.HSVColorPicker is an enhanced version of the
	 * SUI.control.HSVSelector so that the total hue, saturation, value color
	 * selection control is more like the controls that you'll find in image
	 * manipulation programs as the GIMP. Next to the HSV control you'll find
	 * three input boxes where you can set the values for the hue, saturation
	 * and value directly. Also an HTML color code can be entered directly.
	 * Direct feedback of the control's current color selection is provided.
	 *
	 * @augments SUI.AnchorLayout
	 *
	 * @description
	 * Create an HSV color picker control.
	 *
	 * @constructs
	 * @param see base class
	 * @param  {Function} arg.onChange Listener function that is executed
	 *    each time the control's color selection changes.
	 */
	initializer: function(arg) {

		SUI.control.HSVColorPicker.initializeBase(this, arg);

	 // Set the size of the control
		this.width(this.WIDTH);
		this.height(this.HEIGHT);

		// create a HSV color selection control
		this._hsv = new SUI.control.HSVSelector({});

		// start at the top
		var top = this.PADDING;

		// create an input field and label for direct hue entry
		this._inpHue = new SUI.form.Input({
			width: this.INPUT_WIDTH,
			right: this.PADDING,
			top: top,
			anchor: {right: true}
		});
		this._lblHue = new SUI.form.Label({
			width: this.LABEL_WIDTH,
			left: this.LABEL_LEFT,
			top: top, forBox:
			this._inpHue,
			title: SUI.i18n.hsvHue
		});

	 // move to next row
		top += this.ROW_HEIGHT;

		// create an input field and label for direct saturation entry
		this._inpSat = new SUI.form.Input({
			width: this.INPUT_WIDTH,
			right: this.PADDING,
			top: top,
			anchor: {right: true}
		});
		this._lblSat = new SUI.form.Label({
			width: this.LABEL_WIDTH,
			left: this.LABEL_LEFT,
			top: top,
			forBox: this._inpSat,
			title: SUI.i18n.hsvSaturation
		});

		// move to next row
		top += this.ROW_HEIGHT;

		// create an input field and label for direct value entry
		this._inpVal = new SUI.form.Input({
			width: this.INPUT_WIDTH,
			right: this.PADDING,
			top: top,
			anchor: {right: true}
		});
		this._lblVal = new SUI.form.Label({
			width: this.LABEL_WIDTH,
			left: this.LABEL_LEFT,
			top: top,
			forBox: this._inpVal,
			title: SUI.i18n.hsvValue
		});

		// move to next row
		top += this.ROW_HEIGHT;

		// create an input box and label for the HTML color code
		this._inpCode = new SUI.form.Input({
			width: this.COLBOX_WIDTH,
			right: this.PADDING,
			top: top,
			anchor: {right: true}
		});
		this._inpCode.el().maxLength = 7;
		this._inpCode.el().style.textAlign = "right";
		this._inpCode.el().style.fontFamily = "mono";
		this._lblCode = new SUI.form.Label({
			width: this.LABEL_WIDTH,
			left: this.LABEL_LEFT,
			top: top,
			forBox: this._inpCode,
			title: SUI.i18n.hsvCode
		});

		// move to next row
		top += this.ROW_HEIGHT;

		// create a colored box and label to display the color
		this._boxCol = new SUI.Box({
			width: this.COLBOX_WIDTH,
			height: this.COLBOX_HEIGHT,
			right: this.PADDING,
			top: top,
			anchor: {right: true}
		});
		this._boxCol.border(new SUI.Border(1));
		this._boxCol.el().style.borderColor = "black";
		this._lblColor = new SUI.form.Label({
			width: this.LABEL_WIDTH,
			left: this.LABEL_LEFT,
			top: top,
			title: SUI.i18n.hsvColor
		});

		// set the default value for the input fields
		this._setInputs();

		// set the onChange listener
		if (arg.onChange) {
		 this.addListener("onChange", arg.onChange);
		}

		// add the event handlers of the control
		this._addEventHandlers();

		// now add all components to the control's container box
		this.add(this._hsv);
		this.add(this._lblHue);
		this.add(this._lblSat);
		this.add(this._lblVal);
		this.add(this._lblCode);
		this.add(this._lblColor);
		this.add(this._inpHue);
		this.add(this._inpSat);
		this.add(this._inpVal);
		this.add(this._inpCode);
		this.add(this._boxCol);
	},

	/**
	 * The height of the boxes in which the color an HTML color code are shown.
	 */
	COLBOX_HEIGHT: 20,

	/**
	 * The Width of the boxes in which the color an HTML color code are shown.
	 */
	COLBOX_WIDTH: 64,

	/**
	 * The total height of the control.
	 */
	HEIGHT: 158,

	/**
	 * The width of the hue, saturation and value input boxes.
	 */
	INPUT_WIDTH: 30,

	/**
	 * The left position of the labels.
	 */
	LABEL_LEFT: 200,

	/**
	 * The width of the labels.
	 */
	LABEL_WIDTH: 100,

	/**
	 * The padding of the control.
	 */
	PADDING: 15,

	/**
	 * The row height for the rows with hue, saturation, value and color boxes.
	 */
	ROW_HEIGHT: 27,

	/**
	 * The total width of the control.
	 */
	WIDTH: 335,

	/**
	 * Set or get the HTML color code selection of the control.
	 * @param {String} val An HTML color code (#FF7700), or none to get
	 *    the current color selection from the control.
	 * @return {String} An HTML color code (#FF7700), if no argument was given
	 *    this method act as a getter and value will be returned.
	 */
	colorCode: function(val) {
	 if (val == undefined) {
			return this._hsv.colorCode();
	 }
	 // got here? the method is a setter
	 // strip the # of the color value and try to convert it to a number ...
		var v = parseInt(val.substr(1), 16);
		// ... if that works and the is in the valid range ...
		if (!isNaN(v) && (v >= 0 && v <= 0xFFFFFF)) {
		 // ... set the hsv control's color selection ...
			this._hsv.colorCode(val);
			// ... and hsv input fields
			this._setInputs();
		} else {
		 // ... throw an exception
		 throw "SUI.control.HSVColorPicker: colorCode, invalid color";
		}
		return null;
	},

	/**
	 * onChange event handler: is executed when the control's color selection
	 * changes.
	 * @param {String} c The HTML color code of the color that is currently
	 *     selected by the control.
	 */
	onChange: function(c) {
	},

	// box for the HTML color code
	_inpCode: null,

	// box to display the selected color
	_boxCol: null,

	// the HSV control
	_hsv: null,

	// a label for the HTML color code box
	_lblCode: null,

	// a label for the color display box
	_lblColor: null,

	// a label for the hue input box
	_lblHue: null,

	// a label for the saturation input box
	_lblSat: null,

	// a label for the value input box
	_lblVal: null,

	// the hue input box
	_inpHue: null,

	// the saturation input box
	_inpSat: null,

	// the value input box
	_inpVal: null,

	// add the onblur event handlers to the input buttons an the onChange
	// listener to the HSV control.
	_addEventHandlers: function() {
		var that = this;
		// set hue on the onblur of the hue input field
		SUI.browser.addEventListener(this._inpHue.el(), "blur",
		 function(e) {
			 if (!that._setHue(that._inpHue.el().value)) {
			   SUI.browser.noPropagation(e);
			 }
			}
		);
		// set saturation on the onblur of the saturation input field
		SUI.browser.addEventListener(this._inpSat.el(), "blur",
		 function(e) {
			 if (that._setSaturation(that._inpSat.el().value)) {
			   SUI.browser.noPropagation(e);
			 }
			}
		);
		// set value on the onblur of the value input field
		SUI.browser.addEventListener(this._inpVal.el(), "blur",
		 function(e) {
			 if (that._setValue(that._inpVal.el().value)) {
			   SUI.browser.noPropagation(e);
			 }
			}
		);
		// after entering the color set control's color selection so that
		// it will reflect the changes
		SUI.browser.addEventListener(this._inpCode.el(), "blur",
			function(e) {
				that.colorCode(this.value);
			 that.callListener("onChange", that._hsv.colorCode());
				SUI.browser.noPropagation(e);
			}
		);
		// set the input fields if the HSV control's color selection changes
		this._hsv.addListener("onChange",
			function(c) {
				that._setInputs();
			 that.callListener("onChange", that._hsv.colorCode());
		 }
		);
	},

	// set the hue of the control's selected color
	_setHue: function(val) {
	 // get the hue in degrees ...
		var v = parseInt(String(val), 10);
		// ... is it a valid selection?
		if (!isNaN(v) && (v >= 0 && v <= 360)) {
		 // yes, set the HSV control's hue ...
			this._hsv.hue(v);
			// ... set the input fields to HSV control's color selection ...
			this._setInputs();
			// ... and notify listeners that the color selection was changed
		 this.callListener("onChange", this._hsv.colorCode());
		}
	},

	// set the input field and color boxes to reflect the color that is
	// selected by the HSV control
	_setInputs: function() {
	 var c = this._hsv.colorCode();
	 // get the hue of the HSV control and set the hue input field
		this._inpHue.el().value = this._hsv.hue() | 0;
	 // get saturation of HSV ctrl and set sat. input field as percentage
		this._inpSat.el().value = this._hsv.saturation() * 100 | 0;
	 // get value of HSV ctrl and set value input field as percentage
		this._inpVal.el().value = this._hsv.value() * 100 | 0;
		// display the color code in the text box
		this._inpCode.el().value = c.toUpperCase();
		// display the color in the color box
		this._boxCol.el().style.backgroundColor = c;
	},

	// set the saturation of the control's selected color
	_setSaturation: function(val) {
	 // get the saturation in degrees ...
		var v = parseInt(String(val), 10);
		// ... is it a valid selection?
		if (!isNaN(v) && (v >= 0 && v <= 100)) {
		 // yes, set the HSV control's saturation ...
			this._hsv.saturation(v/100);
			// ... set the input fields to HSV control's color selection ...
			this._setInputs();
			// ... and notify listeners that the color selection was changed
		 this.callListener("onChange", this._hsv.colorCode());
		}
	},

	// set the value of the control's selected color
	_setValue: function(val) {
	 // get the value as percentage ...
		var v = parseInt(String(val), 10);
		// ... is it a valid selection?
		if (!isNaN(v) && (v >= 0 && v <= 100)) {
		 // yes, set the HSV control's value ...
			this._hsv.value(v/100);
			// ... set the input fields to HSV control's color selection ...
			this._setInputs();
			// ... and notify listeners that the color selection was changed
		 this.callListener("onChange", this._hsv.colorCode());
		}
	}

});
