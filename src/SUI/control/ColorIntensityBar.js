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
 * $Id: ColorIntensityBar.js 786 2013-08-09 13:26:51Z geert $
 */

"use strict";

SUI.control.ColorIntensityBar = SUI.defineClass(
	/** @lends SUI.control.ColorIntensityBar.prototype */{

	/** @ignore */ baseClass: SUI.Box,

	/**
	 * @class
	 * SUI.control.ColorIntensityBar is a slider control to make a color
	 * intensity selection for a single RGB color component. The intensity
	 * selection made will be in the range 0-1.
	 *
	 * @augments SUI.Box
	 *
	 * @description
	 * Create a color intensity bar. The bar is always 256 pixels long and
	 * 20 pixels high.
	 *
	 * @constructs
	 * @param see base class
	 * @param {String} arg.color The background color of the control: "r",
	 *     "g" or "b".
	 * @param {Function} arg.onChange Listener function that is executed each
	 *     time the control's color intensity selection changes.
	 */
	initializer: function(arg) {

		SUI.control.ColorIntensityBar.initializeBase(this, arg);

		// set the width and height of the bar
		this.width(this.AXIS_LENGTH);
		this.height(this.HEIGHT);
		// the background image and color of the bar
		this.el().style.backgroundImage = "url(" + SUI.imgDir + "/"
			+ SUI.resource.rgbBar+")";
		this.el().style.backgroundColor = arg.color == "r" ? "#FF0000" :
			(arg.color == "g" ? "#00FF00" : "#0000FF");
		// the crosshair extends over the bar's edges, show it
		this.el().style.overflow = "visible";

		// conversion from length to range can be done nicely by substracting
		// the crosshair width of the length
		this._axisRange = this.AXIS_LENGTH - this.CROSSHAIR_LINE;

		// calculate the top offset of the crosshair image w.r.t. the top of
		// the bar
		this._ofsCh =
		 (this.CROSSHAIR_LINE - this.CROSSHAIR_WIDTH) / 2 | 0;
		// create the crosshair, a dragger component
		this._ch = new SUI.Dragger({
		 parent: this,
		 width: this.CROSSHAIR_WIDTH,
		 height: this.CROSSHAIR_HEIGHT,
			top: (this.HEIGHT - this.CROSSHAIR_HEIGHT) / 2 | 0,
			left: this._ofsCh
		});
		// set the range for dragging ...
		this._ch.xMin(this._ofsCh);
		this._ch.xMax(
		 this._ofsCh + this.AXIS_LENGTH - this.CROSSHAIR_LINE);
		// ... and the direction in which we may draw
		this._ch.direction(this._ch.HORIZONTAL);
		// set the crosshair background image ...
		this._ch.el().style.backgroundImage =
		 "url(" + SUI.imgDir + "/" + SUI.resource.rgbCh + ")";
		// ... and an appropriate cursor
		this._ch.el().style.cursor = "pointer";

		// start dragging on the onmousedown of the crosshair
		var that = this;
		SUI.browser.addEventListener(this._ch.el(), "mousedown",
		 function(e) {
			 if (!that._startDrag(new SUI.Event(this, e))) {
			   SUI.browser.noPropagation(e);
			 }
		 }
		);

		// set the onChange handler
		if (arg.onChange) {
		 this.addListener("onChange", arg.onChange);
		}

	},

	/**
	 * Length of the color axis.
	 */
	AXIS_LENGTH: 256,

	/**
	 * Width of the crosshair line.
	 */
	CROSSHAIR_LINE: 1,

	/**
	 * Height of the bar.
	 */
	HEIGHT: 20,

	/**
	 * Height of the crosshair image.
	 */
	CROSSHAIR_WIDTH: 15,

	/**
	 * Width of the crosshair image.
	 */
	CROSSHAIR_HEIGHT: 26,

	/**
	 * Display RGB control. Set the size and position of the bar and crosshair.
	 */
	display: function() {
		this.setDim();
		this._ch.setDim();
	},

	/**
	 * onChange event handler: is executed when the control's color selection
	 * changes. This happens continuously when the user is dragging the
	 * crosshairs.
	 * @param {String} c The color intensity selected by the control.
	 */
	onChange: function(c) {
	},

	/**
	 * Set the value of the control's currently selected color intensity
	 * and redisplay the control.
	 * @param {int} val The new value for the control's currently selected
	 *     color intensity (0 <= value <= 1), no value to use this method
	 *     as a getter.
	 * @return {int} the value of the control's currently selected color
	 *     intentsity, or null if this method is used as a setter.
	 */
	value: function(val) {
	 if (val === undefined) {
			return this._val;
	 }
	 // got here? the method is a setter
		this._val = val;
		this._ch.left((this._val * this._axisRange | 0) + this._ofsCh);
		this.display();

	 return null;
	},

	// length vs range: fi length: 128 -> range: 0-127
	_axisRange: 0,

	// dragger box for the crosshair
	_ch: null,

	// offset of the crosshair w.r.t. the left of the bar
	_ofsCh: 0,

	// current intensity setting
	_val: 0,

	// While dragging the crosshair change the selected color intensity
	// setting and call the onChange listener
	_drag: function() {
		this._val = (this._ch.left() - this._ofsCh) / this._axisRange;
	 this.callListener("onChange", this._val);
	},

	// On start dragging the crosshair initialize the onDrag handler of
	// the dragger and start dragging
	_startDrag: function(e) {
		var that = this;
		this._ch.addListener("onDrag", function() { that._drag(); });
		this._ch.start(e, this);
	}

});
