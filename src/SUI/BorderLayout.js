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
 * $Id: BorderLayout.js 786 2013-08-09 13:26:51Z geert $
 */

"use strict";

SUI.BorderLayout = SUI.defineClass(
	/** @lends SUI.BorderLayout.prototype */{

	/** @ignore */ baseClass: SUI.SplitLayout,

	/**
	 * @class
	 * The border layOut is a container type that lets you split an area into
	 * a center box and (optional) north, south, west and east boxes, just at
	 * as the split layOut from which it is inherited. The difference between
	 * the border layOut and the split layOut is that the border layOut has
	 * sizable borders. When sizing the total border layOut component the same
	 * rules are followed as for the split layOut.
	 *
	 * @augments SUI.SplitLayout
	 *
	 * @description
	 * Construct a split border object. You can tell the split layOut which
	 * areas (north/south/west/east) to set and the dimensions to use.
	 * It's also possible to set the child boxes directly.
	 *
	 * @constructs
	 * @param see base class
	 */
	initializer: function(arg) {

		SUI.BorderLayout.initializeBase(this, arg);

		this.addClass("sui-borderlayout");
		this.anchor = {left:true,right:true,top:true,bottom:true};

		this.center = new SUI.Box({parent: this});
		if (arg.center && arg.center.box) {
			this.add(arg.center.box, "center");
		}

		// add north, south, west and east if given in arguments
		if (arg.north) {
			this.north = new SUI.Box({parent: this});
			this.north.height(arg.north.height);
			this._createBorder(this.north);
			if (arg.north.box) {
				this.add(arg.north.box, "north");
			}
		}

		if (arg.south) {
			this.south = new SUI.Box({parent: this});
			this.south.height(arg.south.height);
			this._createBorder(this.south);
			if (arg.south.box) {
				this.add(arg.south.box, "south");
			}
		}

		if (arg.west) {
			this.west = new SUI.Box({parent: this});
			this.west.width(arg.west.width);
			this._createBorder(this.west);
			if (arg.west.box) {
				this.add(arg.west.box, "west");
			}
		}

		if (arg.east) {
			this.east = new SUI.Box({parent: this});
			this.east.width(arg.east.width);
			this._createBorder(this.east);
			if (arg.east.box) {
				this.add(arg.east.box, "east");
			}
		}

	},

	/**
	 * Width of the border between the panels.
	 */
	BORDER_WIDTH: 6,

	/**
	 * Size of the gripper image on the panel.
	 */
	HANDLE_LENGTH: 48,

	/**
	 * Set the CSS width and height of she SplitLayout, its locations and
	 * all the child boxes.
	 */
	display: function() {

		// set the CSS dimensions of the container box ...
		this.setDim();

		// ... and the of the location boxes ...
		if (this.north) {
			this.north.setDim();
			this.north.paneBorder.setDim();
			this.north.handle.setDim();
		}
		if (this.south) {
			this.south.setDim();
			this.south.paneBorder.setDim();
			this.south.handle.setDim();
		}
		if (this.west) {
			this.west.setDim();
			this.west.paneBorder.setDim();
			this.west.handle.setDim();
		}
		if (this.east) {
			this.east.setDim();
			this.east.paneBorder.setDim();
			this.east.handle.setDim();
		}
		this.center.setDim();

		// ... and of all the children
		SUI.SplitLayout.parentMethod(this, "display");
	},

	/**
	 * Recalculate size of the frames in the border layOut
	 */
	layOut: function() {

		// get the minimum widths and heights
		var tmp = this._prepareLayout();
		var w = tmp.w; // corrected widths
		var h = tmp.h; // corrected heights
		var ct = 0; // center top
		var cl = 0; // center left
		var cw = w.w; // center width
		var ch = h.h; // center height
		var hl = 0; // handle length

		// set the dimensions of the container box
		this.setRect(this.top(), this.left(), w.w, h.h);

		// handle length for horizontal border
		hl = this.HANDLE_LENGTH > w.w ? w.w : this.HANDLE_LENGTH;

		// if there is a north panel ...
		if (this.north) {
			// ... set the dimensions ...
			this.north.setRect(0, 0, w.w, h.nh);
			// ... and adjust the top and height of the center
			ct += h.nh + this.BORDER_WIDTH;
			ch -= ct;

			// set the dimensions of the north border and handle
			this.north.paneBorder.setRect(h.nh, 0, w.w, this.BORDER_WIDTH);
			this.north.handle.setRect(
				0, Math.floor((w.w-hl)/2), hl, this.BORDER_WIDTH);
		}

		// if there is a south panel ...
		if (this.south) {
			// ... set the dimensions ...
			this.south.setRect(h.h-h.sh, 0, w.w, h.sh);
			// ... and adjust the height of the center
			ch -= h.sh + this.BORDER_WIDTH;

			// set the dimensions of the south border and handle
			this.south.paneBorder.setRect(h.h-h.sh-this.BORDER_WIDTH, 0, w.w,
				this.BORDER_WIDTH);
			this.south.handle.setRect(0, Math.floor((w.w-hl)/2), hl,
				this.BORDER_WIDTH);
		}

		// handle length for vertical border
		hl = this.HANDLE_LENGTH > ch ? ch : this.HANDLE_LENGTH;

		// if there is a west panel ...
		if (this.west) {
			// ... set the dimensions ...
			this.west.setRect(ct, 0, w.ew, ch);
			// ... and adjust the left and width of the center
			cl += w.ew + this.BORDER_WIDTH;
			cw -= cl;

			// set the dimensions of the west border and handle
			this.west.paneBorder.setRect(ct, w.ew, this.BORDER_WIDTH, ch);
			this.west.handle.setRect(
				Math.floor((ch-hl)/2), 0,this.BORDER_WIDTH, hl);
		}

		// if there is an east panel ...
		if (this.east) {
			// ... set the dimensions ...
			this.east.setRect(ct, w.w-w.ww, w.ww, ch);
			// ... and adjust the width of the center
			cw -= w.ww + this.BORDER_WIDTH;

			// set the dimensions of the east border and handle
			this.east.paneBorder.setRect(
				ct, w.w-w.ww-this.BORDER_WIDTH, this.BORDER_WIDTH, ch);
			this.east.handle.setRect(
				Math.floor((ch-hl)/2), 0,this.BORDER_WIDTH, hl);
		}

		// now we know the position of the center
		this.center.setRect(ct, cl, cw, ch);

		// layOut the child boxes
		SUI.SplitLayout.parentMethod(this, "layOut"); return;
	},

	/* Create border and handle box for a pane
	 */
	_createBorder: function(pane) {

		// create the border
		pane.paneBorder = new SUI.Box({parent: this});
		pane.paneBorder.addClass("sui-borderlayout-border");
		// and set the cursor type for the border
		pane.paneBorder.el().style.cursor =
			(pane === this.east || pane === this.west)
			? "col-resize" : "row-resize";

		// create the handle
		pane.handle = new SUI.Box({parent: pane.paneBorder});
		pane.handle.addClass("sui-borderlayout-handle");
		pane.handle.el().style.cursor = pane.paneBorder.el().style.cursor;
		pane.handle.el().style.backgroundImage = "url(" + SUI.imgDir + "/"
			+ SUI.resource.blHandle + ")";

		// add the onmousedown handler to the border
		var that = this;
		SUI.browser.addEventListener(pane.paneBorder.el(), "mousedown",
			function(e) {
				if (!that._doMouseDown(new SUI.Event(this, e), pane)) {
					SUI.browser.noPropagation(e);
				}
			}
		);

	},

	/* Start the dragging motion: create and initialize the dragger.
	 */
	_doMouseDown: function(event, pane) {

		// Create  dragger ...
		var dragger = new SUI.Dragger({parent: this});
		// ... width the same dimensions as the border
		dragger.setRect(pane.paneBorder);
		dragger.addClass("sui-borderlayout-dragger");

		// if we're resizing the west pane ...
		if (this.west === pane) {
			// ... set minimum x ...
			dragger.xMin(this.west.minWidth());
			// ... and maximum x ...
			dragger.xMax(this.center.left() + this.center.width()
				- this.center.minWidth() - this.BORDER_WIDTH);
			// ... and horizontal dragging direction
			dragger.direction(dragger.HORIZONTAL);
		}

		// if we're resizing the east pane ...
		if (this.east === pane) {
			// ... set minimum x ...
			dragger.xMin(this.center.left() + this.center.minWidth());
			// ... and maximum x ...
			dragger.xMax(this.east.left() + this.east.width()
				- this.east.minWidth() - this.BORDER_WIDTH);
			// ... and horizontal dragging direction
			dragger.direction(dragger.HORIZONTAL);
		}

		// if we're resizing the north pane ...
		if (this.north === pane) {
			// ... set minimum y ...
			dragger.yMin(this.north.minHeight());
			// ... and maximum y ...
			dragger.yMax(this.center.top() + this.center.height()
				- this.center.minHeight() - this.BORDER_WIDTH);
			// ... and vertical dragging direction
			dragger.direction(dragger.VERTICAL);
		}

		// if we're resizing the south pane ...
		if (this.south === pane) {
			// ... set minimum y ...
			dragger.yMin(this.center.top() + this.center.minHeight());
			// ... and maximum y ...
			dragger.yMax(this.south.top() + this.south.height()
				- this.south.minHeight() - this.BORDER_WIDTH);
			// ... and vertical dragging direction
			dragger.direction(dragger.VERTICAL);
		}

		// make a box that covers the entire border layOut. This prevents
		// HTML objects such as an iframe to steal the onmousemove event. You
		// can use this to keep the cursor if you move off the border also.
		var draggerbg = new SUI.Box({parent: this});
		draggerbg.setRect(0, 0, this.width(), this.height());
		draggerbg.el().style.cursor = pane.paneBorder.el().style.cursor;
		draggerbg.setDim();

		// copy the cursor of the border to the dragger
		dragger.el().style.cursor = pane.paneBorder.el().style.cursor;
		// and set the CSS dimension of the dragger
		dragger.setDim();

		var that = this;
		// 'that', 'pane', 'dragger', 'draggerbg' are closure variables
		dragger.addListener("onEndDrag",
			function() {
				that._endDrag(pane, dragger, draggerbg);
			}
		);

		// and start dragging
		dragger.start(event, this);
	},

	/* End dragging of the border: set the new pane and border dimensions
	 */
	_endDrag: function(pane, dragger, draggerbg) {

		// remove the dragger and dragger background from the DOM tree
		dragger.removeBox();
		draggerbg.removeBox();

		// set the new pane and border dimensions
		if (this.north === pane) {
			var d = this.north.paneBorder.top() - dragger.top();
			this.north.height(this.north.height() - d);
		}
		if (this.south === pane) {
			var d = this.south.paneBorder.top() - dragger.top();
			this.south.height(this.south.height() + d);
		}
		if (this.west === pane) {
			var d = this.west.paneBorder.left() - dragger.left();
			this.west.width(this.west.width() - d);
		}
		if (this.east === pane) {
			var d = this.east.paneBorder.left() - dragger.left();
			this.east.width(this.east.width() + d);
		}

		// redraw the border layOut
		this.draw();
	}

});
