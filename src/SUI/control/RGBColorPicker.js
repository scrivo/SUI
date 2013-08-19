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
 * $Id: RGBColorPicker.js 786 2013-08-09 13:26:51Z geert $
 */

"use strict";

SUI.control.RGBColorPicker = SUI.defineClass(
	/** @lends SUI.control.RGBColorPicker.prototype */{

	/** @ignore */ baseClass: SUI.AnchorLayout,

	/**
	 * @class
	 * SUI.control.RGBColorPicker is a control for selection colors by setting
	 * the red, green and blue components of the color separately: thus
	 * blending the color yourself. It is also possible to set the HTML color
	 * code directly and direct visual feedback of the created color is
	 * provided.
	 *
	 * @augments SUI.AnchorLayout
	 *
	 * @description
	 * Create an RGB color picker control.
	 *
	 * @constructs
	 * @param see base class
	 * @param {Function} arg.onChange Listener function that is executed each
	 *     time the control's color selection changes.
	 */
	initializer: function(arg) {

		SUI.control.RGBColorPicker.initializeBase(this, arg);

	 // Set the size of the control
		this.width(this.WIDTH);
		this.height(this.HEIGHT);

		var that = this;

		// start at the top
		var top = this.PADDING;

		// create a red intensity bar and a label
		this._red = new SUI.control.ColorIntensityBar({
			top: top,
			right: this.PADDING,
			anchor: {right: true},
			color: "r",
			onChange: function(c) {
				that._setColor();
			 that.callListener("onChange", that._color);
			}
		});
		this._lblRed = new SUI.form.Label({
			width: this.LABEL_WIDTH,
			left: this.PADDING,
			top: top,
			title: SUI.i18n.rgbRed
		});

		// move to next row
		top += this.ROW_HEIGHT;

		// create a green intensity bar and a label
		this._green = new SUI.control.ColorIntensityBar({
			top: top,
			right: this.PADDING,
			anchor: {right: true},
			color: "g",
			onChange: function(c) {
				that._setColor();
			 that.callListener("onChange", that._color);
			}
		});
		this._lblGreen = new SUI.form.Label({
			width: this.LABEL_WIDTH,
			left: this.PADDING,
			top: top,
			title: SUI.i18n.rgbGreen
		});

		// move to next row
		top += this.ROW_HEIGHT;

		// create a blue intensity bar and a label
		this._blue = new SUI.control.ColorIntensityBar({
			top: top,
			right: this.PADDING,
			anchor: {right: true},
			color: "b",
			onChange: function(c) {
				that._setColor();
			 that.callListener("onChange", that._color);
			}
		});
		this._lblBlue = new SUI.form.Label({
			width: this.LABEL_WIDTH,
			left: this.PADDING,
			top: top,
			title: SUI.i18n.rgbBlue
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
		// after entering the color set control's color selection so that
		// it will reflect the changes
		SUI.browser.addEventListener(this._inpCode.el(), "blur",
			function(e) {
				that.colorCode(this.value);
				that.callListener("onChange", that._color);
				SUI.browser.noPropagation(e);
			}
		);

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

		// set the onChange listener
		if (arg.onChange) {
		 this.addListener("onChange", arg.onChange);
		}

		// now add all components to the control's container box
		this.add(this._lblRed);
		this.add(this._lblGreen);
		this.add(this._lblBlue);
		this.add(this._lblCode);
		this.add(this._lblColor);
		this.add(this._red);
		this.add(this._green);
		this.add(this._blue);
		this.add(this._inpCode);
		this.add(this._boxCol);

		// set the default color of the control
		this.colorCode(this._color);
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
	 * @param {String} val An HTML color code (#FF7700), or none to get the
	 *    current color selection from the control.
	 * @return {String} An HTML color code (#FF7700), if no argument was given
	 *    this method acts as a getter and value will be returned.
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
		 var c = SUI.color.colToRgb(val);
		 // ... set the rgb intensity bars ...
			this._red.value(c.r);
			this._green.value(c.g);
			this._blue.value(c.b);
			// ... and set the color from the bar settings
			this._setColor();
		} else {
		 // ... throw an exception
		 throw "SUI.control.RGBColorPicker: colorCode, invalid color";
		}
		return null;
	},

	// the blue intensity bar
	_blue: null,

	// the color picker's color selection
	_color: "#CCCCCC",

	// box to display the selected color
	_boxCol: null,

	// the gree intensity bar
	_green: null,

	// the input field to enter the color code directly
	_inpCode: null,

	// label for the blue intensity bar
	_lblBlue: null,

	// label for color code input field
	_lblCode: null,

	// label for the color display box
	_lblColor: null,

	// label for the green intensity bar
	_lblGreen: null,

	// label for the red intensity bar
	_lblRed: null,

	// the red intensity bar
	_red: null,

	// set the control's color: set the inensity value of the three color
	// bars, set the color input field and color display box. If requested
	_setColor: function() {
	 // set the selected color, ...
		this._color = SUI.color.rgbToCol({
			r: this._red.value(),
			g: this._green.value(),
		 b: this._blue.value()
		});
		// ... set color code in the input field ...
		this._inpCode.el().value = this._color.toUpperCase();
		// ... and display the color in the color box
		this._boxCol.el().style.backgroundColor = this._color;
	}

});
