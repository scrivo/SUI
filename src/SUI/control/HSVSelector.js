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
 * $Id: HSVSelector.js 786 2013-08-09 13:26:51Z geert $
 */

"use strict";

SUI.control.HSVSelector = SUI.defineClass(
	/** @lends SUI.control.HSVSelector.prototype */{

	/** @ignore */ baseClass: SUI.Box,

	/**
	 * @class
	 * SUI.control.HSVSelector is a hue, saturation, value color selection
	 * control as can be found in image manipulation programs as the GIMP.
	 * The user can make a color section by choosing the hue value from a bar
	 * and the saturation and value from a cartesian system. The hue bar is
	 * representing the perimeter of a color wheel cycling through the red,
	 * green and blue colors while blending into each other). The saturation
	 * and value are selected by selecting a point in an area that is set up
	 * by these two axes.
	 *
	 * @augments SUI.Box
	 *
	 * @description
	 * Create an HSV color selection control.
	 *
	 * @constructs
	 * @param see base class
	 * @param {String} arg.color Initial color selection of the control.
	 * @param {Function} arg.onChange Listener function that is executed each
	 *     time the control's color selection changes.
	 */
	initializer: function(arg) {

		SUI.control.HSVSelector.initializeBase(this, arg);

		// set the width and height of the control. this is a fixed size
		// which can't be altered.
		this.width(2 * this.PADDING + this.AXIS_LENGTH + this.SPLIT_WIDTH
		 + this.HUE_BAR_WIDTH);
		this.height(this.AXIS_LENGTH + 2 * this.PADDING);

		// conversion from length to range can be done nicely by substracting
		// the crosshair width of the length
		this._axisRange = this.AXIS_LENGTH - this.CROSSHAIR_LINE;

		// built the saturation-value pane ...
		this._buildSatValPane();
		// ... and hue bar
		this._buildHueBar();

		// set the onChange handler
		if (arg.onChange) {
		 this.addListener("onChange", arg.onChange);
		}

		// set the control's selected color value
		this.colorCode(arg.color || "#CCCCCC");
	},

	/**
	 * Length of the hue, saturation and value axes.
	 */
	AXIS_LENGTH: 128,

	/**
	 * Width of the crosshair line.
	 */
	CROSSHAIR_LINE: 1,

	/**
	 * Width of the hue bar.
	 */
	HUE_BAR_WIDTH: 20,

	/**
	 * Height of the hue crosshair image.
	 */
	HUE_CROSSHAIR_HEIGHT: 15,

	/**
	 * Width of the hue crosshair image.
	 */
	HUE_CROSSHAIR_WIDTH: 26,

	/**
	 * Padding of the control (half of the sat.-value crosshair image size).
	 */
	PADDING: 15,

	/**
	 * Width and height of the saturation-value crosshair image
	 */
	SATVAL_CROSSHAIR_SIZE: 31,

	/**
	 * distance between the saturation-value pane and hue bar
	 */
	SPLIT_WIDTH: 17,

	/**
	 * Set or get the HTML color code selection of the control.
	 * @param {String} c An HTML color code (#FF7700), or none to get
	 *    the current color selection from the control.
	 * @return {String} An HTML color code (#FF7700), or null if this
	 *    method is used as a setter
	 */
	colorCode: function(c) {
	 if (c === undefined) {
			return SUI.color.hsvToCol(
				 {h: this._hue, s: this._sat, v: this._val});
	 }
	 // got here? the method is a setter
		var col = SUI.color.colToHsv(c);
		// set the new color values
		this._hue = col.h;
		this._sat = col.s;
		this._val = col.v;
		// set the positions of the crosshairs
		this._hueTop();
		this._satTop();
		this._valLeft();
		// redisplay the control
		this.display();

		return null;
	},

	/**
	 * Display HSV control. Set the size and position of the
	 * saturation-value pane, hue bar, crosshairs and set the background
	 * color of the saturation-value.
	 */
	display: function() {
		this.setDim();
		this._satVal.setDim();
		this._hueBar.setDim();
		this._chSatVal.setDim();
		this._chHue.setDim();
		this._satVal.el().style.backgroundColor =
			SUI.color.hsvToCol({h: this._hue, s: 1, v:1});
	},

	/**
	 * Set or get the hue of the control's currently selected color and
	 * redisplay the control if the value was set.
	 * @param {int} hue The new hue for the control's currently selected color
	 *     (0 <= hue <= 360), or no value to use this method as a getter.
	 * @return {int} the hue of the control's currently selected color, or
	 *     null if this method is used as a setter.
	 */
	hue: function(hue) {
	 if (hue === undefined) {
	   return this._hue;
	 }
	 // got here? the method is a setter
		if (hue >= 0 && hue <= 360) {
			this._hue = hue;
		}
		this._hueTop();
		this.display();

	 return null;
	},

	/**
	 * Lay out the HSV control. Calculate the size and position of the
	 * saturation-value pane and hue bar.
	 */
	layOut: function() {
		this._satVal.setRect(this._satVal);
		this._hueBar.setRect(this._hueBar);
	},

	/**
	 * onChange event handler: is executed when the control's color selection
	 * changes. This happens continuously when the user is dragging the
	 * crosshairs.
	 * @param {String} c The HTML color code of the color that is currently
	 *     selected by the control.
	 */
	onChange: function(c) {
	},

	/**
	 * Set the saturation of the control's currently selected color and
	 * redisplay the control.
	 * @param {float} sat The new saturation for the control's currently
	 *     selected color (0 <= saturation <= 1), or no value to use this
	 *     method as a getter.
	 * @return {float} the saturation of the control's currently selected
	 *     color, or null if this method is used as a setter.
	 */
	saturation: function(sat) {
	 if (sat === undefined) {
	   return this._sat;
	 }
	 // got here? the method is a setter
		if (sat >= 0 && sat <= 1) {
			this._sat = sat;
		}
		this._satTop();
		this.display();

	 return null;
	},

	/**
	 * Set the value of the control's currently selected color and redisplay
	 * the control.
	 * @param {float} val The new value for the control's currently selected
	 *     color (0 <= value <= 1), or no value to use this method as a
	 *     getter.
	 * @return {float} the value of the control's currently selected
	 *     color, or null if this method is used as a setter.
	 */
	value: function(val) {
	 if (val === undefined) {
	   return this._val;
	 }
	 // got here? the method is a setter
		if (val >= 0 && val <= 1) {
			this._val = val;
		}
		this._valLeft();
		this.display();

	 return null;
	},

	// length vs range: fi length: 128 -> range: 0-127
	_axisRange: 0,

	// dragger box for the hue crosshair
	_chHue: null,

	// dragger box for the saturation-value pane crosshair
	_chSatVal: null,

	// current hue setting
	_hue: 0,

	// box for the hue bar
	_hueBar: null,

	// offset of the hue crosshair w.r.t. the top of the hue bar
	_ofsChHue: 0,

	// offset of the saturation-value crosshair w.r.t. the top left corner
	// of the saturation-value pane
	_ofsChSatVal: 0,

	// current saturation setting
	_sat: 1,

	// box for the saturation-value pane
	_satVal: null,

	// current value setting
	_val: 0,

	// Create the box for the hue bar and create the draggable crosshair
	_buildHueBar: function() {

	 // build the hue bar
		this._hueBar = new SUI.Box({
		 parent: this,
			width: this.HUE_BAR_WIDTH,
			height: this.AXIS_LENGTH,
			top: this.PADDING,
			left: this.AXIS_LENGTH + this.PADDING + this.SPLIT_WIDTH
		});
		// set hue background image
		this._hueBar.el().style.backgroundImage = "url(" + SUI.imgDir + "/"
			+ SUI.resource.hsvHue + ")";
		// the crosshair extends over the hue bar's edges, show it
		this._hueBar.el().style.overflow = "visible";

		// create the crosshair, a dragger component
		this._chHue = new SUI.Dragger({
		 parent: this._hueBar,
		 width: this.HUE_CROSSHAIR_WIDTH,
		 height: this.HUE_CROSSHAIR_HEIGHT,
			left: (this.HUE_BAR_WIDTH - this.HUE_CROSSHAIR_WIDTH) / 2 | 0
		});
		// calculate the top offset of the crosshair image w.r.t. the top of
		// the hue bar
		this._ofsChHue =
		 (this.CROSSHAIR_LINE - this.HUE_CROSSHAIR_HEIGHT) / 2 | 0;
		// set the range for dragging ...
		this._chHue.yMin(this._ofsChHue);
		this._chHue.yMax(
		 this._ofsChHue + this.AXIS_LENGTH - this.CROSSHAIR_LINE);
		// ... and the direction in which we may draw
		this._chHue.direction(this._chSatVal.VERTICAL);
		// set the crosshair background image ...
		this._chHue.el().style.backgroundImage =
		 "url(" + SUI.imgDir + "/" + SUI.resource.hsvChHue + ")";
		// ... and an appropriate cursor
		this._chHue.el().style.cursor = "pointer";

		// start dragging on the onmousedown of the crosshair
		var that = this;
		SUI.browser.addEventListener(this._chHue.el(), "mousedown",
		 function(e) {
			 if (!that._startHueDrag(new SUI.Event(this, e))) {
			   SUI.browser.noPropagation(e);
			 }
		 }
		);

	},

	// Create the box for the saturation-value pane and create the draggable
	// crosshair
	_buildSatValPane: function() {

	 // build the saturation-value pane
		this._satVal = new SUI.Box({
		 parent: this,
			width: this.AXIS_LENGTH,
		 height: this.AXIS_LENGTH,
		 top: this.PADDING,
		 left: this.PADDING
		});
		// set saturation-value background image
		this._satVal.el().style.backgroundImage = "url(" + SUI.imgDir + "/"
			+ SUI.resource.hsvSatVal + ")";
		// the crosshair extends over the pane's edges, show it
		this._satVal.el().style.overflow = "visible";

		// create the crosshair, a dragger component
		this._chSatVal = new SUI.Dragger({
		 parent: this._satVal,
		 width: this.SATVAL_CROSSHAIR_SIZE,
		 height: this.SATVAL_CROSSHAIR_SIZE
		});
		// calculate the top offset of the crosshair image w.r.t. the top left
		// of the saturation-value pane
		this._ofsChSatVal =
		 (this.CROSSHAIR_LINE - this.SATVAL_CROSSHAIR_SIZE) / 2 | 0;
		// set the range for dragging ...
		var max = this._ofsChSatVal + this.AXIS_LENGTH - this.CROSSHAIR_LINE;
		this._chSatVal.xMin(this._ofsChSatVal);
		this._chSatVal.xMax(max);
		this._chSatVal.yMin(this._ofsChSatVal);
		this._chSatVal.yMax(max);
		// ... and the direction in which we may draw
		this._chSatVal.direction(
		 this._chSatVal.HORIZONTAL + this._chSatVal.VERTICAL);
		// set the crosshair background image ...
		this._chSatVal.el().style.backgroundImage =
		 "url(" + SUI.imgDir + "/" + SUI.resource.hsvChSatVal + ")";
		// ... and an appropriate cursor
		this._chSatVal.el().style.cursor = "pointer";

		// start dragging on the onmousedown of the crosshair
		var that = this;
		SUI.browser.addEventListener(this._chSatVal.el(), "mousedown",
		 function(e) {
			 if (!that._startSatValDrag(new SUI.Event(this, e))) {
			   SUI.browser.noPropagation(e);
			 }
		 }
		);

	},

	// While dragging the hue crosshair change the hue setting and update
	// the hue setting of the saturation-value pane and call the onChange
	// listener
	_hueDrag: function() {
	 // calculate hue from top (hue = distance / range * 360)
		this._hue = (this._axisRange - (this._chHue.top() - this._ofsChHue))
		 * 360 / this._axisRange;
	 // set the background color of the saturation-value pane
	 this._satVal.el().style.backgroundColor =
			SUI.color.hsvToCol({h: this._hue, s:1, v:1});
	 // call the listener
		this.callListener("onChange",
			SUI.color.hsvToCol({h: this._hue, s: this._sat, v: this._val}));
	},

	// Set the top of the hue crosshair to reflect the current hue setting.
	_hueTop: function() {
		// calculate top from hue (distance = (hue / 360) * range)
		this._chHue.top(
		 ((1 - this._hue / 360) * this._axisRange | 0) + this._ofsChHue);
	},

	// Set the top of the saturation-value crosshair to reflect the current
	// saturation setting.
	_satTop: function() {
		// calculate top from saturation (distance = saturation * range)
		this._chSatVal.top(
		 ((1 - this._sat) * this._axisRange | 0) + this._ofsChSatVal);
	},

	// While dragging the saturation crosshair change the saturation and
	// value settings and call the onChange listener
	_satValDrag: function() {
		// calculate saturation from top (saturation = distance / range)
		this._sat =
				(this._axisRange - (this._chSatVal.top() - this._ofsChSatVal))
	   / this._axisRange;
		// calculate value from left (value = distance / range)
		this._val =
		 (this._chSatVal.left() - this._ofsChSatVal) / this._axisRange;
		// call the listener
		this.callListener("onChange",
		   SUI.color.hsvToCol({h: this._hue, s: this._sat, v: this._val}));
	},

	// On start dragging the hue crosshair initialize the onDrag handler of
	// the dragger and start dragging
	_startHueDrag: function(e) {
		var that = this;
		this._chHue.addListener("onDrag", function() { that._hueDrag(); });
		this._chHue.start(e, this);
	},

	// On start dragging the saturation-value crosshair initialize the
	// onDrag handler of the dragger and start dragging
	_startSatValDrag: function(e) {
		var that = this;
		this._chSatVal.addListener(
		 "onDrag", function() { that._satValDrag(); });
		this._chSatVal.start(e, this);
	},

	// Set the left of the saturation-value crosshair to reflect the current
	// value setting.
	_valLeft: function() {
		// calculate left from value (distance = value * range)
		this._chSatVal.left(
		 (this._val * this._axisRange | 0) + this._ofsChSatVal);
	}

});
