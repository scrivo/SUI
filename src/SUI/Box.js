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
 * $Id: Box.js 786 2013-08-09 13:26:51Z geert $
 */

"use strict";

SUI.Box = SUI.defineClass(
	/** @lends SUI.Box.prototype */{

	/**
	 * @classdesc
	 * <p>SUI.Box is the basic building block of the SUI library. SUI.Box are
	 * objects that represent absolutely positioned div elements and implement
	 * the functionality for the framework to size and display them as
	 * required. SUI.Boxes are basically wrappers for HTML elements and the
	 * method <i>el()</i> will return the box's element ({@link SUI.Box#el}).
	 * </p>
	 * <p>Because we like to work with absolute distances measured in pixels
	 * you'll find the properties common to the style attributes of HTML
	 * elements like top, width, etc. (re)defined as fields of the SUI.Box
	 * class. However in the SUI.Box class no CSS lengths but only integer
	 * values are supported to simplify layout arithmetic.
	 * </p>
	 * <p>To support the layout mechanism you'll find two methods:
	 * <i>layOut</i> ({@link SUI.Box#layOut}) and <i>display</i>
	 * ({@link SUI.Box#display}). These methods will be called when
	 * rendering box objects on the browser's client area. The basic idea
	 * is that the <i>layOut</i> method will calculate the size and position
	 * of the box (or an object that inherits SUI.Box) and the <i>display</i>
	 * method will actually set the CSS properties to the size and position
	 * that was calculated by the <i>layOut</i> method during the lay out
	 * phase.
	 * </p>
	 * <p>The reason to separate between these two operations is that it is
	 * possible that layout operations interact: trying to set a box to
	 * a certain width might be readjusted later in the layout process due
	 * to a child box that has a larger minimum width set. We first want to
	 * fully calculate the layout before starting the rendering process. It
	 * is expected that this will result in a snappier GUI experience and
	 * that's what we're after.
	 * </p>
	 * <p>Boxes can be anchored. This only has meaning if the box is a child
	 * box of a {@link SUI.AnchorLayout}. When anchored a child box of
	 * a container will set its size and position relative to the
	 * container's sides for the given anchor.
	 * </p>
	 * <p>Suppose all sides (left, top, bottom, right) of a box are set to
	 * 10 and the box is anchored to all sides of the container box
	 * (<i>{left: true, right: true, top: true, bottom: true}</i>).
	 * The result will be a box on the container's client area with a
	 * 10 pixel margin, no matter how the parent container is (and will be)
	 * sized, thus ignoring the box's width and height settings. Setting
	 * the bottom anchor to false will keep the box 10 pixels from the top,
	 * right and left sides of the container but the box height setting will
	 * now be respected.
	 * </p>
	 * <p>SUI.Box objects also offer a way to a attach events. More complex
	 * derivatives of SUI.Box will use these: f.i. an subclass of SUI.Box might
	 * implement an 'onLoad' event because it loads its contents using an XHR
	 * request.
	 * </p>
	 * 
	 * @summary
	 * A SUI.Box represents a box structure and is the basic building block of
	 * the SUI library.
	 *
	 * @description
	 * Create a SUI.Box component.
	 *
	 * @constructs
	 *
	 * @param {Object} [arg.elemAttr] Additional (element) attributes for the
	 *    box's element given as an object containing name and value pairs.
	 * @param {Object} [arg.anchor={left: true, top: true}] The anchors for
	 *    the box.
	 * @param {SUI.Border} [arg.border=new SUI.Border()] the border (width)
	 *    of the box. Note: don't edit the border's members, you'll edit the
	 *    boxes prototype. Assign a new SUI.Border object instead.
	 * @param {int} [arg.bottom=0] The bottom position of the box.
	 * @param {int} [arg.height=0] The height of the box.
	 * @param {int} [arg.id=auto generated] The id of the HTML element of
	 *    the box.
	 * @param {int} [arg.left=0] The left position of the box.
	 * @param {int} [arg.maxHeight=1000000] The maximum height of the box.
	 * @param {int} [arg.minHeight=0] The minimal height of the box.
	 * @param {int} [arg.maxWidth=100000] The maximal width of the box.
	 * @param {int} [arg.minWidth=0] The minimal width of the box.
	 * @param {SUI.Padding} [arg.padding=new SUI.Padding()] the padding of
	 *    the box. Note: don't edit the padding's members, you'll edit the
	 *    boxes prototype. Assign a new SUI.Padding object instead.
	 * @param {SUI.Box} [arg.parent] the parent box of the box.
	 * @param {int} [arg.right=0] The right position of the box.
	 * @param {String} [arg.tag="DIV"] An alternative tag name for the box.
	 * @param {int} [arg.top=0] The top position of the box.
	 * @param {int} [arg.width=0] The width of the box.
	 *
	 * @exception {String} If the box was created without argument object.
	 *    Note: an empty argument object is allowed.
	 */
	initializer: function(arg) {

		// no argument object is an error in the SUI library
		if (!arg) {
			throw "creating a box without argument object";
		}

		// anchors default to left and right
		this.anchor = {left: true, right: false, top: true, bottom: false};

		// start with an empty bin
		this.bin = [];

		// create the box's element, allow for non-div elements too
		this._el = SUI.browser.createElement(
			arg.tag || null, arg.elemAttr || null);

		// set the element's id
		if (arg.id) {
			this._el.id = arg.id;
		}

		// set properties from arguments
		if (arg.anchor) {
			this.anchor = arg.anchor;
		}
		if (arg.bottom) {
			this.bottom(arg.bottom);
		}
		if (arg.left) {
			this.left(arg.left);
		}
		if (arg.right) {
			this.right(arg.right);
		}
		if (arg.top) {
			this.top(arg.top);
		}
		if (arg.maxHeight) {
			this.maxHeight(arg.maxHeight);
		}
		if (arg.minHeight) {
			this.minHeight(arg.minHeight);
		}
		if (arg.minWidth) {
			this.minWidth(arg.minWidth);
		}
		if (arg.maxWidth) {
			this.maxWidth(arg.maxWidth);
		}
		if (arg.border) {
			this.border(arg.border);
		}
		if (arg.padding) {
			this.padding(arg.padding);
		}

		// note: set height and weight after max/min setting
		if (arg.height) {
			this.height(arg.height);
		}
		if (arg.width) {
			this.width(arg.width);
		}

		// note: set parent after element node was created
		if (arg.parent) {
			this.parent(arg.parent);
		}
	},

	/**
	 * Get the absolute position (top/left) of this box on the page.
	 * Note: You can only use this function if the HTML content of the page
	 * is fully rendered.
	 */
	absPos: function() {
		var l = 0, t = 0, x = 0;
		var el = this._el;
		// Note that we can use computed style because offsetLeft and
		// offsetRight are computed members themselves are computed members
		// themselves
		if (el.offsetParent) {
			do {
				l += el.offsetLeft;
				x = parseInt(
					SUI.browser.currentStyle(el, "borderLeftWidth"), 10);
				l += (isNaN(x) ? 0 : x);
				t += el.offsetTop;
				x = parseInt(
					SUI.browser.currentStyle(el, "borderTopWidth"), 10);
				t += (isNaN(x) ? 0 : x);
			} while (null !== (el = el.offsetParent));
		}

		return {l:l,t:t};
	},

	/**
	 * Add a CSS class name to the class list of the HTML element associated
	 * with the box.
	 * @param {String} cls the CSS class name to add
	 */
	addClass: function(cls) {
		SUI.style.addClass(this._el, cls);
	},

	/**
	 * Add/register a listener function. This way it is possible to register
	 * more than one listener function on one target.
	 * @param {String} type The listener type (i.e. "onClick", "onOK", etc).
	 * @param {Function} listener The listener function.
	 */
	addListener: function(type, listener) {
		// if the listeners object is not initialized the do it now
		if (!this.listeners) {
			this.listeners = {};
		}
		// if there are no listeners for this type create the listeners array
		if (!this.listeners[type]) {
			this.listeners[type] = [];
		}
		// add the listener
		this.listeners[type].push(listener);
	},

	/**
	 * Get or set the border definition of the box.
	 * @param {SUI.Border} [b] The new border definition (or none to use
	 *    this method as a getter).
	 * @return {SUI.Border} the border definition of the box (or null if this
	 *    method was used as a setter).
	 */
	border: function(b) {

		if (b !== undefined && typeof b === "string") {
			throw "Convert to type Border please";
		}

		return b !== undefined ? (this._border = b) && null : this._border;
	},

	/**
	 * Call a listener function. Execute the default and additional listener
	 * functions. Note: the framework should not execute the default listeners
	 * directly but always through this method to ensure the execution of
	 * additional listener functions.
	 * @param {String} type The listener type (i.e. "onClick", "onOK", etc).
	 */
	callListener: function(type) {
		// get the arguments for the listener: current arguments minus 'type'
		var p = [].slice.call(arguments, 1);
		// execute the default listener if any
		if (this[type]) {
			this[type].apply(this, p);
		}
		// check the additional listeners ...
		if (this.listeners) {
			if (this.listeners[type]) {
				if (this.listeners[type].length) {
					// ... and if there are any, execute them
					for (var i=0; i<this.listeners[type].length; i++) {
						this.listeners[type][i].apply(this, p);
					}
				}
			}
		}
	},

	/**
	 * Get or set the bottom of the box.
	 * @param {int} [b] The new bottom of the box (or none to use this
	 *    method as a getter).
	 * @return {int} The bottom of the box (or null if this method was used as
	 *    a setter).
	 */
	bottom: function(b) {
		return b !== undefined ? (this._bottom = b) && null : this._bottom;
	},


	/**
	 * Get the client height of the box. The client height is the height of
	 * the box minus the top and bottom border and padding width.
	 * @return {int} The client height of the box.
	 */
	clientHeight: function() {
		return this.height() - (this._border ? this._border.height : 0)
			- (this._padding ? this._padding.height : 0);
	},

	/**
	 * Get the client width of the box. The client width is the width of
	 * the box minus the left and right border and padding width.
	 * @return {int} The client width of the box.
	 */
	clientWidth: function() {
		return this.width() - (this._border ? this._border.width : 0)
			- (this._padding ? this._padding.width : 0);
	},

	/**
	 * Display the box. Set the CSS positions of the element's box(es) and
	 * of the children of the box.
	 */
	display: function() {
		if (this.width() > 0 && this.height() > 0) {
			this.setDim();
		}
	},

	/**
	 * Draw the box on the screen. It executes a two phase process: a layout
	 * phase in which the size and positions of the box (and of it's contents,
	 * for more complex derivatives) is calculated and a display phase in
	 * which the CSS size and position of the box's (and possible it's
	 * child elements) is set.
	 */
	draw: function() {
		this.layOut();
		this.display();
	},

	/**
	 * Get the HTML element node of the box.
	 * @return {HTMLElementNode} the HTML element node of the box.
	 */
	el: function() {
		return this._el;
	},

	/**
	 * Get or set the height of the box.
	 * @param {int} [h] The new height of the box (or none to use this
	 *    method as a getter).
	 * @return {int} The height of the box (or null if this method was used as
	 *    a setter).
	 */
	height: function(h) {
		if (h !== undefined) {
			h = h < this._minHeight ? this._minHeight :
				h > this._maxHeight ? this._maxHeight : h;
			// TODO: checking for errors
			if (isNaN(h)) {
				console.log("height: NaN");
			}
			if (h === undefined) {
				console.log("height: undefined");
			}
			this._height = h;
			return null;
		} else {
			return this._height;
		}
	},

	/**
	 * Lay out the box. Calculate the position of the box and its contents. The
	 * layOut function of a simple box does nothing, but it's important for
	 * more complex objects extended from SUI.Box. The layOut mechanism will
	 * set the size and position of the child boxes of the box based on the
	 * on the available space and within the restrictions of the box's minimum
	 * and maximum width and height. So the job of the overridden layOut method
	 * is to recalculate the size and position of all the child elements of
	 * the box when the layout manager sets the size of the box and calls the
	 * box's layOut method.
	 */
	layOut: function() {
	},

	/**
	 * Get or set the left of the box.
	 * @param {int} [l] The new left of the box (or none to use this
	 *    method as a getter).
	 * @return {int} The left of the box (or null if this method was used as
	 *    a setter).
	 */
	left: function(l) {
		return l !== undefined ? (this._left = l) && null : this._left;
	},

	/**
	 * Get or set the maximum height of the box.
	 * @param {int} [mh] The new maximum height of the box (or none to use
	 *    this method as a getter).
	 * @return {int} The maximum height of the box (or null if this method was
	 *    used as a setter).
	 */
	maxHeight: function(mh) {
		if (mh !== undefined) {
			this._maxHeight = mh;
			if (this._height > this._maxHeight) {
				this._height = this._maxHeight;
			}
			return null;
		} else {
			return this._maxHeight;
		}
	},

	/**
	 * Get or set the maximum width of the box.
	 * @param {int} [mw] The new maximum width of the box (or none to use
	 *    this method as a getter).
	 * @return {int} The maximum width of the box (or null if this method was
	 *    used as a setter).
	 */
	maxWidth: function(mw) {
		if (mw !== undefined) {
			this._maxWidth = mw;
			if (this._width > this._maxWidth) {
				this._width = this._maxWidth;
			}
			return null;
		} else {
			return this._maxWidth;
		}
	},

	/**
	 * Get or set the minimum height of the box.
	 * @param {int} [mh] The new minimum height of the box (or none to use
	 *    this method as a getter).
	 * @return {int} The minimum height of the box (or null if this method was
	 *    used as a setter).
	 */
	minHeight: function(mh) {
		if (mh !== undefined) {
			this._minHeight = mh;
			if (this._height < this._minHeight) {
				this._height = this._minHeight;
			}
			return null;
		} else {
			return this._minHeight;
		}
	},

	/**
	 * Get or set the minimum width of the box.
	 * @param {int} [mw] The new minimum width of the box (or none to use
	 *    this method as a getter).
	 * @return {int} The minimum width of the box (or null if this method was
	 *    used as a setter).
	 */
	minWidth: function(mw) {
		if (mw !== undefined) {
			this._minWidth = mw;
			if (this._width < this._minWidth) {
				this._width = this._minWidth;
			}
			return null;
		} else {
			return this._minWidth;
		}
	},

	/**
	 * Get or set the padding definition of the box.
	 * @param {SUI.Padding} [p] The new padding definition (or none to use
	 *    this method as a getter).
	 * @return {SUI.Padding} The padding definition of the box (or null if
	 *    this method was used as a setter).
	 */
	padding: function(p) {
		if (p !== undefined) {
			if (typeof p === "string") {
				throw "Convert to type Padding please";
			}
			this._padding = p;
			return null;
		} else {
			return this._padding;
		}
	},

	/**
	 * Get or set the parent box of the box. When setting the parent the box's
	 * element node will be appended to the parent box's HTML element node.
	 * @param {SUI.Box} p The parent box for this box (or none to use
	 *    this method as a getter).
	 * @return {SUI.Box} The parent box of the box (or null if this method was
	 *    used as a setter).
	 */
	parent: function(p) {
		if (p !== undefined) {
			this._parent = p;
			this._parent.el().appendChild(this._el);
			return null;
		} else {
			return this._parent;
		}
	},

	/**
	 * Remove a box from the DOM tree.
	 */
	removeBox: function() {
		this._parent.el().removeChild(this._el);
	},

	/**
	 * Remove a CSS class name from the class list of the HTML element
	 * associated with the box.
	 * @param {String} cls The CSS class name to remove.
	 */
	removeClass: function(cls) {
		SUI.style.removeClass(this._el, cls);
	},

	/**
	 * Get or set the right of the box.
	 * @param {int} r The new right of the box (or none to use this
	 *    method as a getter).
	 * @return {int} The right of the box (or null if this method was used
	 *    as a setter).
	 */
	right: function(r) {
		return r !== undefined ? (this._right = r) && null : this._right;
	},

	/**
	 * Set the CSS dimensions of this box and it's borders and padding. This is
	 * typically used in display functions to display boxes at the size and
	 * position that was calculated during layout.
	 */
	setDim: function() {
		this.setPos();

		// get the control's client width
		var cw = this.clientWidth();
		// TODO: cw is sometimes null: in what case?
		// Answer: Select list on the link dialog had no initial width
		// Do or don't we want that?
		if (isNaN(cw)) {
			console.log(cw);
			cw = 0;
		}
		// if it is negative try to sacrifice some of the padding
		if (cw <0) {
			this._padding.growW(cw);
			cw = 0;
		}
		// set the CSS width to the client width
		this._el.style.width = cw+"px";

		// get the control's client height
		var ch = this.clientHeight();
		// if it is negative try to sacrifice some of the padding
		if (ch <0) {
			this._padding.growH(ch);
			ch = 0;
		}
		// set the CSS height to the client height
		this._el.style.height = ch+"px";

		// set the CSS border widths
		if (this._border) {
			this._border.set(this._el);
		}

		// set the CSS padding widths
		if (this._padding) {
			this._padding.set(this._el);
		}

	},

	/**
	 * Set the CSS postion of this box. This is typically used in display
	 * functions to display boxes at position that was calculated during
	 * layout. Note: use setDim if you want to set the position and size
	 * of the box.
	 */
	setPos: function() {
		// set the top and left position of the box
		var p = this.parent() instanceof SUI.Box && this.parent().padding();
		this._el.style.top = ((p ? p.top : 0) + this.top())+"px";
		this._el.style.left = ((p ? p.left : 0) + this.left())+"px";
		//this._el.style.top = this.top()+"px";
		//this._el.style.left = this.left()+"px";
	},

	/**
	 * Set the top, left, width and height of a box in one go.
	 * @param {int|SUI.Box} t The new top of the box or another
	 *    reference box to copy the values from.
	 * @param {int} [l] The new left of the box (if the t parameter wasn't a
	 *    reference Box).
	 * @param {int} [w] The new width of the box (if the t parameter wasn't a
	 *    reference Box).
	 * @param {int} [h] The new length of the box (if the t parameter wasn't a
	 *    reference Box).
	 */
	setRect: function(t,l,w,h) {
		if (1 === arguments.length) {
			this.top(t.top());
			this.left(t.left());
			this.width(t.width());
			this.height(t.height());
		} else {
			this.top(parseInt(t, 10));
			this.left(parseInt(l, 10));
			this.width(parseInt(w, 10));
			this.height(parseInt(h, 10));
		}
	},

	/**
	 * Get or set the top of the box.
	 * @param {int} [t] The new top of the box (or none to use this method
	 *    as a getter).
	 * @return {int} The top of the box (or null if this method was used as
	 *    a setter).
	 */
	top: function(t) {
		return t !== undefined ? (this._top = t) && null : this._top;
	},

	/**
	 * Get or set the width of the box.
	 * @param {int} [w] The new width of the box (or none to use this method
	 *    as a getter).
	 * @return {int} The width of the box (or null if this method was used as
	 *    a setter).
	 */
	width: function(w) {
		if (w !== undefined) {
			w = w < this._minWidth ? this._minWidth :
				w > this._maxWidth ? this._maxWidth : w;
			// TODO: checking for errors
			if (isNaN(w)) {
					console.log("width: NaN");
			}
			this._width = w;
			return null;
		} else {
			return this._width;
		}
	},

	/**
	 * The box's border.
	 * @type SUI.Border
	 * @private
	 */
	_border: new SUI.Border(),

	/**
	 * The bottom position of the box.
	 * @type int
	 * @private
	 */
	_bottom: 0,

	/**
	 * The box's element node.
	 * @type HTMLElementNode
	 * @private
	 */
	_el: null,

	/**
	 * The height of the box.
	 * @type int
	 * @private
	 */
	_height: 0,

	/**
	 * The left position of the box.
	 * @type int
	 * @private
	 */
	_left: 0,

	/**
	 * The listeners array.
	 * @type int
	 * @private
	 */
	_listeners: null,

	/**
	 * The maximum height of the box.
	 * @type int
	 * @private
	 */
	_maxHeight: 1000000,

	/**
	 * The maximum width of the box.
	 * @type int
	 * @private
	 */
	_maxWidth: 100000,

	/**
	 * The minimum height of the box.
	 * @type int
	 * @private
	 */
	_minHeight: 0,

	/**
	 * The minimum width of the box.
	 * @type int
	 * @private
	 */
	_minWidth: 0,

	/**
	 * The box's padding.
	 * @type SUI.Padding
	 * @private
	 */
	_padding: new SUI.Padding(),

	/**
	 * The box's parent element.
	 * @type SUI.Box
	 * @private
	 */
	_parent: null,

	/**
	 * The right position of the box.
	 * @type int
	 * @private
	 */
	_right: 0,

	/**
	 * The top position of the box.
	 * @type int
	 * @private
	 */
	_top: 0,

	/**
	 * The width of the box.
	 * @type int
	 * @private
	 */
	_width: 0

});
