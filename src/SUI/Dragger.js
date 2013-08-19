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
 * $Id: Dragger.js 786 2013-08-09 13:26:51Z geert $
 */

"use strict";

SUI.Dragger = SUI.defineClass(
	/** @lends SUI.Dragger.prototype */{

	/** @ignore */ baseClass: SUI.Box,

	/**
	 * @class
	 * A dragger is a box that you can drag with the mouse between certain
	 * restriction. It is a utility component that is used when certain parts
	 * of a component need to make draggable. You can set the restrictions and
	 * direction you want to drag and the dragger will follow the mouse within
	 * the allowed region.
	 *
	 * @augments SUI.Box
	 *
	 * @description
	 * Create a dragger component.
	 *
	 * @constructs
	 * @param see base class
	 */
	initializer: function(arg) {

		SUI.Dragger.initializeBase(this, arg);

		// set initial values to window size
		this._xMin = 0;
		this._yMin = 0;
		this._xMax = SUI.browser.viewportWidth;
		this._yMax = SUI.browser.viewportHeight;
	},

	/**
	 * Constant to use when you want to drag into the east direction.
	 */
	EAST: "e",

	/**
	 * Constant to use when you want to drag into the horizontal direction.
	 */
	HORIZONTAL: "h",

	/**
	 * Constant to use when you want to drag into the north direction.
	 */
	NORTH: "n",

	/**
	 * Constant to use when you want to drag into the south direction.
	 */
	SOUTH: "s",

	/**
	 * Constant to use when you want to drag into the vertical direction.
	 */
	VERTICAL: "v",

	/**
	 * Constant to use when you want to drag into the west direction.
	 */
	WEST: "w",

	/**
	 * Set the drag direction.
	 * @param {const} dir Direction into which to drag.
	 */
	direction: function(dir) {
		this._dir = dir;
	},

	/**
	 * The onEndDrag event handler: this method will be called when the user
	 * stops dragging.
	 */
	onEndDrag: function() {
	},

	/**
	 * The onDrag event handler: this method will be called while the user
	 * is dragging.
	 */
	onDrag: function() {
	},

	/**
	 * Start the dragging action. This will initialize the dragging action
	 * and will typically be called in the onmousedown handler of the box
	 * that must trigger the drag action.
	 * @param {SUI.Event} e An onmousedown event.
	 */
	start: function(e) {

		// make sure the dragger is on top of everything
		this.el().style.zIndex = 1000;

		// get the current mouse position
		this._xPos = SUI.browser.getX(e.event);
		this._yPos = SUI.browser.getY(e.event);

		// and the start positions/dimension
		this._lStart = this.left();
		this._hStart = this.height();
		this._tStart = this.top();
		this._wStart = this.width();

		var that = this;

		// set the onmousemove event handler to _drag()
		SUI.browser.addEventListener(
			document,
			"mousemove",
			this._ehDrag = function(e) {
				if (!that._drag(new SUI.Event(this, e))) {
					SUI.browser.noPropagation(e);
				}
			}
		);

		// set the onmouseup event handler to _endDrag()
		SUI.browser.addEventListener(
			document,
			"mouseup",
			this._ehEndDrag = function(e) {
				if (!that._endDrag()) {
					SUI.browser.noPropagation(e);
				}
			}
		);
	},

	/**
	 * Set the maximum x position (at document level) for the dragging motion.
	 * @param {int} xMax maximum x position (at document level) for the
	 *    dragging motion.
	 */
	xMax: function(xMax) {
		this._xMax = xMax;
	},

	/**
	 * Set the minimum x position (at document level) for the dragging motion.
	 * @param {int} xMin minimum x position (at document level) for the
	 *    dragging motion.
	 */
	xMin: function(xMin) {
		this._xMin = xMin;
	},

	/**
	 * Set the maximum y position (at document level) for the dragging motion.
	 * @param {int} yMax maximum y position (at document level) for the
	 *    dragging motion.
	 */
	yMax: function(yMax) {
		this._yMax = yMax;
	},

	/**
	 * Set the minimum y position (at document level) for the dragging motion.
	 * @param {int} yMin minimum y position (at document level) for the
	 *    dragging motion.
	 */
	yMin: function(yMin) {
		this._yMin = yMin;
	},

	// direction for dragging motion
	_dir: "",

	// reference to the drag function (for unregistering)
	_ehDrag: null,

	// reference to the endDrag function (for unregistering)
	_ehEndDrag: null,

	// dragger height at start dragging action
	_hStart: 0,

	// dragger left at start dragging action
	_lStart: 0,

	// dragger top at start dragging action
	_tStart: 0,

	// dragger width at start dragging action
	_wStart: 0,

	// maximum x position for the dragging action
	_xMax: 0,

	// minimum x position for the dragging action
	_xMin: 0,

	// current x position during the dragging action
	_xPos: 0,

	// maximum y position for the dragging action
	_yMax: 0,

	// minimum y position for the dragging action
	_yMin: 0,

	// current y position during the dragging action
	_yPos: 0,

	/* Function to keep variable value within boundaries.
	 */
	_bounds: function(v, min, max) {
		return v < min ? min : v > max ? max : v;
	},

	/* Drag the component: set the new position and size based on the current
	 * mouse position.
	 */
	_drag: function(e) {

		// get the current mouse position
		var x = SUI.browser.getX(e.event);
		var y = SUI.browser.getY(e.event);

		// if we're dragging in horizontal direction just set the left position
		// of the dragger
		if (this._dir.indexOf("h") != -1) {
			var t = this._lStart + x - this._xPos;
			t = this._bounds(t, this._xMin, this._xMax);
			this.left(t);
		}

		// if we're dragging in vertical direction just set the top position
		// of the dragger
		if (this._dir.indexOf("v") != -1) {
			var l = this._tStart + y - this._yPos;
			l = this._bounds(l, this._yMin, this._yMax);
			this.top(l);
		}

		// if we're dragging into the east direction just set the width
		// of the dragger
		if (this._dir.indexOf("e") != -1) {
			var w = this._wStart + x - this._xPos;
			w = this._bounds(w, this._xMin, this._xMax);
			this.width(w);
		}

		// if we're dragging into the west direction set the width and the
		// left position of the dragger
		if (this._dir.indexOf("w") != -1) {
			var w = this._wStart - x + this._xPos;
			w = this._bounds(w, this._xMin, this._xMax);
			var l = this._lStart - (w - this._wStart);
			this.width(w);
			this.left(l);
		}

		// if we're dragging into the north direction set the height and the
		// top position of the dragger
		if (this._dir.indexOf("n") != -1) {
			var h = this._hStart - y + this._yPos;
			h = this._bounds(h, this._yMin, this._yMax);
			var t = this._tStart - (h - this._hStart);
			this.height(h);
			this.top(t);
		}

		// if we're dragging into the south direction just set the height
		// of the dragger
		if (this._dir.indexOf("s") != -1) {
			var h = this._hStart + y - this._yPos;
			h = this._bounds(h, this._yMin, this._yMax);
			this.height(h);

		}

		// now set the CSS dimensions of the dragger
		this.setDim();

		// ... and call the onDrag event handler
		this.callListener("onDrag");
	},

	/* End the dragging motion
	 */
	_endDrag: function() {

		// Unregister the event handlers ...
		SUI.browser.removeEventListener(document, "mousemove", this._ehDrag);
		SUI.browser.removeEventListener(document, "mouseup", this._ehEndDrag);

		// ... and call the onEndDrag event handler
		this.callListener("onEndDrag");
	}

});
