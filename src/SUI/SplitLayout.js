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
 * $Id: SplitLayout.js 786 2013-08-09 13:26:51Z geert $
 */

"use strict";

SUI.SplitLayout = SUI.defineClass(
	/** @lends SUI.SplitLayout.prototype */{

	/** @ignore */ baseClass: SUI.AnchorLayout,

	/**
	 * @class
	 * The split layOut is a container type that lets you split an area into a
	 * center box and (optional) north, south, west and east boxes. When
	 * resizing the center box will shrink or expand until the minimum size of
	 * the content box of the center is reached. Shrinking further will cause
	 * the north, south, west and east boxes to shrink until the minimum width
	 * or height of their content boxes.
	 *
	 * @augments SUI.AnchorLayout
	 *
	 * @description
	 * Construct a split layOut object. You can tell the split layOut which
	 * areas (north/south/west/east) to set and the dimensions to use.
	 * It's also possible to set the child boxes directly.
	 *
	 * @constructs
	 * @param see base class
	 * @param {Object} arg.center An object with the following members:
	 * @param {SUI.Box} arg.center.box A client box (optional)
	 * @param {Object} arg.north (optional) An object with the following
	 *     members:
	 * @param {int} arg.north.height height of the north area
	 * @param {SUI.Box} arg.north.box A client box (optional)
	 * @param {Object} arg.south (optional) An object with the following
	 *     members:
	 * @param {int} arg.south.height height of the south area
	 * @param {SUI.Box} arg.south.box A client box (optional)
	 * @param {Object} arg.west (optional) An object with the following
	 *     members:
	 * @param {int} arg.west.width width of the west area
	 * @param {SUI.Box} arg.west.box A client box (optional)
	 * @param {Object} arg.south (optional) An object with the following
	 *     members:
	 * @param {int} arg.south.width width of the east area
	 * @param {SUI.Box} arg.south.box A client box (optional)
	 */
	initializer: function(arg) {

		SUI.SplitLayout.initializeBase(this, arg);

		// add the center
		this.center = new SUI.Box({parent: this});
		if (arg.center && arg.center.box) {
			this.add(arg.center.box, "center");
		}

		// add north, south, west and east if given in arguments
		if (arg.north) {
			this.north = new SUI.Box({parent: this});
			this.north.height(arg.north.height);
			if (arg.north.box) {
				this.add(arg.north.box, "north");
			}
		}

		if (arg.south) {
			this.south = new SUI.Box({parent: this});
			this.south.height(arg.south.height);
			if (arg.south.box) {
				this.add(arg.south.box, "south");
			}
		}

		if (arg.west) {
			this.west = new SUI.Box({parent: this});
			this.west.width(arg.west.width);
			if (arg.west.box) {
				this.add(arg.west.box, "west");
			}
		}

		if (arg.east) {
			this.east = new SUI.Box({parent: this});
			this.east.width(arg.east.width);
			if (arg.east.box) {
				this.add(arg.east.box, "east");
			}
		}

	},

	/**
	 * {SUI.Box} Center box
	 */
	center: null,

	/**
	 * {SUI.Box} East box
	 */
	east: null,

	/**
	 * {SUI.Box} North box
	 */
	north: null,

	/**
	 * {SUI.Box} South box
	 */
	south: null,

	/**
	 * {SUI.Box} West box
	 */
	west: null,

	/**
	 * Add a child to the current location. You might need an onremove
	 * handler to store the data on the current location if it is replaced
	 * by a new box. To allow for asynchronious usage the remainder of the
	 * function is not executed when the onRemove callback is provided.
	 * One has to finish the action yourself by calling "finishAdd"
	 * which will remove the current element from the frame an replaces
	 * it with the given child.
	 * @param {SUI.Box} child Box to add to the split layout
	 * @param {String} location Location to add the box to ("west", "south",
	 *   "north" or "west")
	 * @param {Function} onRemove Function to execue when the child box is
	 *   removed from the split layout
	 */
	add: function(child, location, onRemove) {

		// get the requested location
		var t = this[location];
		if (t) {

			// get the current child ...
			var loc = this.get(t);

			// is the location is set and there is an onRemove method ...
			if (t.onRemove) {

				// ... set the parameters for a 'delayed add'
				this._faData = { frame: t, loc: loc, child: child,
					onRemove: onRemove};
				// ... do that method and leave the "finishAdd" to
				// the implementation of onRemove. ...
				t.callListener("onRemove", loc);

			} else {

				if (loc){
					// remove the box at the location
					this.remove(loc, t);
				}

				// ... else just add the child to the location
				SUI.SplitLayout.parentMethod(this, "add", child, t);
				this._minsizeCalc();
				// store the onRemove handler, need it for the next add
				// TODO note: don't use addListener
				t.onRemove = onRemove || null;
			}

		} else {
			throw "Splitlayout: Adding to an inexisting location";
		}
	},

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
		}
		if (this.south) {
			this.south.setDim();
		}
		if (this.west) {
			this.west.setDim();
		}
		if (this.east) {
			this.east.setDim();
		}
		this.center.setDim();

		// ... and of all the children
		SUI.SplitLayout.parentMethod(this, "display");
	},

	/**
	 * Get the child box attached to the location.
	 * @param {String} location The location (west, east, north or south) for
	 *     which to retrieve the child box
	 * @returns {SUI.Box} The requested child box, null if there is none
	 */
	get: function(location) {
		for (var i=0; i<this.children.length; i++) {
			if (this.children[i].parent() == location) {
				return this.children[i];
			}
		}
		return null;
	},

	/**
	 * The framework's layOut method. Set the positions of all the
	 * SplitLayout's location boxes and call the layOut method of all child
	 * boxes
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

		// set the dimensions of the container box
		this.setRect(this.top(), this.left(), w.w, h.h);

		// if there is a north panel ...
		if (this.north) {
			// ... set the dimensions ...
			this.north.setRect(0, 0, w.w, h.nh);
			// ... and adjust the top and height of the center
			ct += h.nh;
			ch -= ct;
		}

		// if there is a south panel ...
		if (this.south) {
			// ... set the dimensions ...
			this.south.setRect(h.h-h.sh, 0, w.w, h.sh);
			// ... and adjust the height of the center
			ch -= h.sh;
		}

		// if there is a west panel ...
		if (this.west) {
			// ... set the dimensions ...
			this.west.setRect(ct, 0, w.ew, ch);
			// ... and adjust the left and width of the center
			cl += w.ew;
			cw -= cl;
		}

		// if there is an east panel ...
		if (this.east) {
			// ... set the dimensions ...
			this.east.setRect(ct, w.w-w.ww, w.ww, ch);
			// ... and adjust the width of the center
			cw -= w.ww;
		}

		// now we know the position of the center
		this.center.setRect(ct, cl, cw, ch);

		// layOut the child boxes
		SUI.SplitLayout.parentMethod(this, "layOut"); return;
	},

	/**
	 * When you use an onRemove handler on add you'll have to finish this
	 * add procedure yourself by calling finishAdd(). This because your
	 * onRemove handler can do asynchronious stuff that is not within the
	 * current thread of control.
	 */
	finishAdd: function() {

		if (this._faData) {

			// remove the box at the location
			this.remove(this._faData.loc, this._faData.frame);

			/// and add the the new one
			SUI.SplitLayout.parentMethod(this, "add",
				this._faData.child, this._faData.frame);
			this._minsizeCalc();

			// store the onRemove handler, need it for the next add
			// TODO note: don't use addListener
			this._faData.frame.onRemove = this._faData.onRemove || null;

			this._faData = null;
		}
	},

	// Width of the border between panels
	_borderWidth: 0,

	// Data stored for a delayed add method (when onremove needs data on
	// the current location)
	_faData: null,

	/* recalculate total, north and south height if component is too large
	 */
	_correctHeight: function(height) {

		// north and south height
		var n = this.north ? this.north.height() : 0;
		var s = this.south ? this.south.height() : 0;

		// total height including borders
		var c = n + s + this.center.minHeight()
			+ (this.north ? this._borderWidth : 0)
			+ (this.south ? this._borderWidth : 0);

		// recalculate
		var r = this._correctSizeCalc(height, c, this.minHeight(), n, s,
			this.north ? this.north.minHeight() : 0,
			this.south ? this.south.minHeight() : 0,
			this.north ? true : false, this.south ? true : false);

		// and return total, north and south height
		return {h: r.t, nh: r.nw, sh: r.se};
	},

	/* recalculate total, west and east width if component is too large
	 */
	_correctWidth: function(width) {

		// west and east width
		var w = this.west ? this.west.width() : 0;
		var e = this.east ? this.east.width() : 0;

		// total width including borders
		var c = w + e + this.center.minWidth()
			+ (this.west ? this._borderWidth : 0)
			+ (this.east ? this._borderWidth : 0);

		// recalculate
		var r = this._correctSizeCalc(width, c, this.minWidth(), w, e,
			this.west ? this.west.minWidth() : 0,
			this.east ? this.east.minWidth() : 0,
			this.west ? true : false, this.east ? true : false);

		// and return total, west and east width
		return {w: r.t, ew: r.nw, ww: r.se};
	},


	/* If total w/h (t) is smaller than min w/h (m) set total w/h as
	 * min w/h or if total w/h is smaller than current w/h (c) decrease
	 * west/north w/h (nw) and east/south w/h (se) with proper amount
	 * (mnw/mse: min nw/se, hnw/hse: has nw/se)
	 */
	_correctSizeCalc: function(t, c, m, nw, se, mnw, mse, hnw, hse) {

		if (m > t) {
			// if total height (or width) (t) is smaller than minimum height
			// (or width) (m) then ...

			// ... set north height (or west width) to set to minimum values
			// if there is a north (or west) panel, ...
			if (hnw) {
				nw = mnw;
			}
			// ... set south height (or east width) to set to minimum values
			// if there is a south (or east) panel, ...
			if (hse) {
				se = mse;
			}
			// ... and set the total height (or width) to the minimum value.
			t = m;

		} else if (c > t) {
			// else if total height (or width) (t) is smaller than current
			// height (or width) (c) then ...

			// ... calculate the part that should be subtracted ...
			var rest = (hnw && hse) ? Math.ceil((c-t)/2) : c-t;

			// ... and if we have a north (or west) panel ...
			if (hnw) {
				// ... try to subtract it from that side ...
				nw -= rest;
				// ... but if it is too much and ...
				if (nw < mnw) {
					// ... there is an other side ...
					if (hse) {
						// ... try to get more from that other side ...
						rest += (mnw - nw);
					}
					// ... and set the north height (or west width) to
					// the minimum value
					nw = mnw;
				}
			}

			// ... and if we have a south (or east) panel ...
			if (hse) {
				// ... try to subtract it from that side ...
				se -= rest;
				// ... but if it is too much and ...
				if (se < mse) {
					// ... there is an other side ...
					if (hnw) {
						// ... try to get more from that other side ...
						nw -= (mse - se);
						// ... not not more than the maximum value ...
						if (nw < mnw) {
							nw = mnw;
						}
					}
					// ... and set the south height (or east width) to
					// the minimum value
					se = mse;
				}
			}
		}

		// return the new center north (or west) and south (or east) size
		return {t:t,nw:nw,se:se};
	},

	/* Get the mimimum size for the box by checking the minimal sizes of the
	 * client boxes
	 */
	_minsizeCalc: function() {

		// get the minimal center width and height
		this.minWidth(this.center.minWidth());
		this.minHeight(this.center.minHeight());

		// if there is a north box add its minimal height
		if (this.north) {
			this.minHeight(this.minHeight() + this.north.minHeight()
				+ this._borderWidth);
		}

		// if there is a south box add its minimal height
		if (this.south) {
			this.minHeight(this.minHeight() + this.south.minHeight()
				+ this._borderWidth);
		}

		// if there is a west box add its minimal width
		if (this.west) {
			this.minWidth(this.minWidth() + this.west.minWidth()
				+ this._borderWidth);
		}

		// if there is a east box add its minimal width
		if (this.east) {
			this.minWidth(this.minWidth() + this.east.minWidth()
				+ this._borderWidth);
		}
	},

	/* Retrieve the minimum and maximum height and width settings of child
	 * boxes (can differ from the ones set in this component).
	 */
	_prepareLayout: function() {

		// for all children ...
		for (var i=0; i<this.children.length; i++) {

			var c = this.children[i];

			// ... set the parent's min/max width/height to the child's
			// min/max width/height if appropriate
			if (c.parent().minWidth() < c.minWidth()) {
				c.parent().minWidth(c.minWidth());
			}
			if (c.parent().maxWidth() > c.maxWidth()) {
				c.parent().maxWidth(c.maxWidth());
			}
			if (c.parent().minHeight() < c.minHeight()) {
				c.parent().minHeight(c.minHeight());
			}
			if (c.parent().maxHeight() > c.maxHeight()) {
				c.parent().maxHeight(c.maxHeight());
			}
		}

		// return adjusted width/height if necessary
		return {
			w: this._correctWidth(this.width()),
			h: this._correctHeight(this.height())
		};
	}

});
