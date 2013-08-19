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
 * $Id: Window.js 786 2013-08-09 13:26:51Z geert $
 */

"use strict";

SUI.Window = SUI.defineClass(
	/** @lends SUI.Window.prototype */{

	/** @ignore */ baseClass: SUI.AnchorLayout,

	/**
	 * @class
	 * SUI.Window is a component to create dialog boxes. Dialog boxes are
	 * container boxes that are displayed on top of the user interface. They
	 * can be either modal (disable the current interface) or modeless (still
	 * keeping the current user interface active). The windows are always
	 * movable and by default resizeable too.
	 *
	 * @augments SUI.AnchorLayout
	 *
	 * @description
	 * Create a window, use show to show it in modal mode or draw to display
	 * as it modeless window.
	 *
	 * @constructs
	 * @param see base class
	 * @param {boolean} arg.resizable Create a resizable window.
	 */
	initializer: function(arg) {

		// the window stack is a static list of currently open windows, if
		// it is not yet craeted, create it now.
		if (!SUI.Window.windowStack) {
			this._initWindowStack();
		}

		// set the default minimum size for a window
		arg.minWidth = arg.minWidth || 200;
		arg.minHeight = arg.minHeight || 100;

		SUI.Window.initializeBase(this, arg);

		// use visible overflow to allow the resizer element to become larger
		// than the windows
		this.el().style.overflow = "visible";

		// if the top position was not explicitly set center the window
		if (!arg.top) {
			this.center();
		}

		// create a resizable window (default true) ?
		this._resizable = arg.resizable ? true : false;

		// create the boxes for the window and add the event handlers
		this._buildControl(arg);
	},

	/**
	 * The inner border width.
	 */
	BORDER_WIDTH: 3,

	/**
	 * Right offset of the close icon.
	 */
	CLOSE_RIGHT: 2,

	/**
	 * Close icons size (width and height).
	 */
	CLOSE_SIZE: 20,

	/**
	 * Top offset of the close icon.
	 */
	CLOSE_TOP: 1,

	/**
	 * Size of the corner draggers.
	 */
	CORNER_SIZE: 16,

	/**
	 * Border width of border around the the inner window (without the
	 * caption bar).
	 */
	INNER_BORDER_OUTLINE: 1,

	/**
	 * Border width of border around the whole window.
	 */
	OUTER_BORDER_OUTLINE: 1,

	/**
	 * Height of the caption bar (excluding borders).
	 */
	CAPTION_HEIGHT: 23,

	/**
	 * Padding top of the caption text in the caption bar.
	 */
	CAPTION_PADDING_TOP: 3,

	/**
	 * Padding left of the caption text in the caption bar.
	 */
	CAPTION_PADDING_LEFT: 5,

	/**
	 * Add a box component to the window.
	 * @param {SUI.Box} child Child box to add
	 */
	add: function(child) {
		SUI.Window.parentMethod(this, "add", child, this.body);
	},

	/**
	 * Set or get the caption text.
	 * @param {String} text The new caption text (null to use the method as
	 *   getter)
	 * @return {String} The caption text (null if the method was used as
	 *   setter)
	 */
	caption: function(text) {
		if (text === undefined) {
			return this._caption.el().innerHTML;
		}
		this._caption.el().innerHTML = text;
		return null;
	},

	/**
	 * Set the top and left so that the window will be centered when it will
	 * be drawn.
	 */
	center: function() {

		// set the top and left so that the window will be centered
		// horizontally and vertically with slight offset to the top
		this.top(SUI.browser.viewportScrollY() +
			((SUI.browser.viewportHeight - this.height()) / 3 | 0));
		this.left(SUI.browser.viewportScrollX() +
			((SUI.browser.viewportWidth - this.width()) / 2 | 0));

		// correct top and/or left if the window top and/or left are outside
		// of the browser screen
		if (this.top() < 0) {
			this.top(0);
		}
		if (this.left() < 0) {
			this.left(0);
		}
	},

	/**
	 * Close a modal window that was created buy calling 'show'
	 */
	close: function() {

		// This is an ie cursor patch. The is the cursor is in and
		// contenteditable div on this window and this window is closed
		// by the close icon causes problems with placing the cursor in
		// other input fields. Selecting the current range when closing the
		// window seems to 'free' the cursor.
// Moved this to the onfocus of editable elements
//        if (SUI.browser.isIE) {
//            document.selection.createRange().select();
//        }

		// remove the overlay from the DOM tree ...
		document.body.removeChild(this._overlay);
		// ... and the window itself ...
		this.removeBox();
		// ... and pop it of the stack
		SUI.Window.windowStack.pop();

		// if there are still windows on the stack ...
		if (SUI.Window.windowStack.length) {
			// ... set the previously removed style back on the overlay
			var topI = SUI.Window.windowStack.length-1;
			SUI.style.addClass(SUI.Window.windowStack[topI]._overlay,
				"sui-overlay-disable");
		}

		// set the tab index back of all elements where it was removed
		for (var i=0; i<this._disabledElements.length; i++) {
			this._disabledElements[i].el.tabIndex =
				this._disabledElements[i].ti.tabIndex;
		}
		// and clear the list
		this._disabledElements = null;

	},

	/**
	 * Get the top, left, right and bottom offset of the client area
	 * relative to the outer dimensions of the window.
	 */
	clientAreaPosition: function() {
		var w = this._draggerBorderWidth();
		return { top: w+this.CAPTION_HEIGHT, left: w, right: w, bottom: w };
	},

	/**
	 * Display the window control. Set the CSS size and position of the
	 * window's boxes.
	 */
	display: function() {

		// set the CSS dimensions of outer box
		this.setDim();
		// set the CSS dimensions of the header
		this._caption.setDim();
		// set the CSS dimensions of the client area
		this._mainArea.setDim();
		this.body.setDim();

		// If the window is resizable ...
		if (this._resizable) {
			// ... set the CSS dimensions of the side draggers ...
			this._n.setDim();
			this._e.setDim();
			this._s.setDim();
			this._w.setDim();
			// ... and of the corner draggers
			this._nw.setDim();
			this._ne.setDim();
			this._se.setDim();
			this._sw.setDim();
		}

		// display all the child controls
		SUI.Window.parentMethod(this, "display");
	},

	/**
	 * Lay out the the window. Calculate the sizes and positions of all
	 * the window's elements.
	 */
	layOut: function() {

		// set the size and position of the caption bar and icon
		this._caption.setRect(0, 0, this.clientWidth(), this.CAPTION_HEIGHT);
		SUI.style.setRect(this._closeIcon, this.CLOSE_TOP,
			this.clientWidth() - this.CLOSE_SIZE - this.CLOSE_RIGHT,
			this.CLOSE_SIZE, this.CLOSE_SIZE);

		// set the size and position of the client area: note that 'body' is
		// no child of '_mainArea'
		this._mainArea.setRect(this.CAPTION_HEIGHT, 0, this.clientWidth(),
			this.clientHeight() - this.CAPTION_HEIGHT);
		this.body.setRect(
			   this._mainArea.top() + this._mainArea.border().top
				   + this._mainArea.padding().top,
			   this._mainArea.left() + this._mainArea.border().left
				   + this._mainArea.padding().left,
			this._mainArea.clientWidth(), this._mainArea.clientHeight());

		// If the window is resizable ...
		if (this._resizable) {

			var obo = this.OUTER_BORDER_OUTLINE;
			var bw = this._draggerBorderWidth();

			// ... set the size and positions of the side draggers ...
			this._n.setRect(-obo, -obo, this.width(), bw);
			this._e.setRect(-obo, this.width() - bw - obo, bw, this.height());
			this._s.setRect(this.height() - bw - obo, -obo, this.width(), bw);
			this._w.setRect(-obo, -obo, bw, this.height());

			// ... and corner draggers
			this._nw.setRect(-obo, -obo, this.CORNER_SIZE, this.CORNER_SIZE);
			this._ne.setRect(-obo, this.clientWidth() + obo - this.CORNER_SIZE,
				this.CORNER_SIZE, this.CORNER_SIZE);
			this._se.setRect(this.clientHeight() + obo - this.CORNER_SIZE,
				this.clientWidth() + obo - this.CORNER_SIZE, this.CORNER_SIZE,
				this.CORNER_SIZE);
			this._sw.setRect(this.clientHeight() + obo - this.CORNER_SIZE,
				-obo, this.CORNER_SIZE, this.CORNER_SIZE);
		}

		// lay out all child boxes
		SUI.Window.parentMethod(this, "layOut");
	},

	/**
	 * onClose event handler. This event handler is called when the
	 * user clicks on the 'close' button on the window's caption.
	 * @event
	 */
	onClose: function() {
	},

	/**
	 * Show a modal window. Before creating the window an overlay will be
	 * placed over the current window to disallow access to the other elements
	 * of the interface.
	 */
	show: function() {

		// check if the window is already shown
		if (this._disabledElements) {
			return;
		}

		// start a new list ...
		this._disabledElements = [];
		// .. get all the elements of the DOM tree ...
		var l = document.getElementsByTagName("*");
		// ... and loop through them ...
		for(var i; i<l.length; i++) {
			// ... if the tab index was set ...
			if (l[i].tabIndex !== undefined && l[i].tabIndex != -1) {
				// ... store it
				this._disabledElements.push({ti: l[i].tabIndex, el: l[i]});
				l[i].tabIndex = -1;
			}
		}

		// if there is an other overlay active ...
		if (SUI.Window.windowStack.length) {
			// ... remove the class so it not visible any more
			var topI = SUI.Window.windowStack.length-1;
			SUI.style.removeClass(SUI.Window.windowStack[topI]._overlay,
				"sui-overlay-disable");
		}

		// create a new overlay for this window
		this._overlay = SUI.browser.createElement();
		SUI.style.setRect(this._overlay,
			0, 0, SUI.browser.viewportWidth, SUI.browser.viewportHeight);
		if (true) {
		SUI.style.addClass(this._overlay, "sui-overlay-disable");
		} else {
			// for taking screenshots:
			this._overlay.style.backgroundColor = "white";
			this.el().style.webkitBoxShadow = "none";
			this.el().style.boxShadow = "none";
		}

		this._overlay.style.position = "fixed";

		// append the overlay to the document body
		document.body.appendChild(this._overlay);

		// add the window to the window stack ...
		SUI.Window.windowStack.push(this);
		// ... and append it to the document tree
		this.parent({el: function() { return document.body; }});

		// now draw the window
		this.draw();
	},

	// storage for disabled elements under the window (we need to enable them
	// later on)
	_disabledElements: null,

	// the overlay window that obscures the rest of the UI when the window
	// is shown
	_overlay: null,

	// if it is a resizable window or not
	_resizable: true,

	/* Add _startDragBorder event handler on the onmousedown event of the
	 * element.
	 */
	_addResizeHandler: function(element, dir) {
		var that = this;
		// 'that' and 'dir' are two closure variables
		SUI.browser.addEventListener(element, "mousedown",
			function(e) {
				if (!that._startDragBorder(new SUI.Event(this, e), dir)) {
					SUI.browser.noPropagation(e);
				}
			}
		);
	},

	/* And the event handlers for the close button and to move the window.
	 */
	_addWindowEvents: function() {

		var that = this;

		// add the 'move window' event handler on the onmousedown event of
		// the caption bar
		SUI.browser.addEventListener(this._caption.el(), "mousedown",
			function(e) {
				if (!that._startDragWindow(new SUI.Event(this, e))) {
					SUI.browser.noPropagation(e);
				}
			}
		);

		// close the window on the click event of the close icon
		SUI.browser.addEventListener(this._closeIcon, "click",
			function(e) {
				// call the onclose listener before closing the form
				that.callListener("onClose");
				if (!that.close()) {
					SUI.browser.noPropagation(e);
				}
			}
		);

	},

	/* Make all required boxes for the control and set the event handlers.
	 */
	_buildControl: function(arg) {

		// set the window's main style
		this.addClass("sui-window-border");
		this.border(new SUI.Border(this.OUTER_BORDER_OUTLINE));

		// create the main area for the window
		this._mainArea = new SUI.Box({parent: this});
		this._mainArea.addClass("sui-window");
		this._mainArea.border(
			new SUI.Border(this.INNER_BORDER_OUTLINE));
		this._mainArea.padding(new SUI.Padding(this.BORDER_WIDTH));

		// create the caption bar
		this._caption = new SUI.Box({parent: this});
		this._caption.addClass("sui-window-caption sui-window-border");
		this._caption.el().innerHTML = arg.caption || SUI.i18n.captionWindow;
		this._caption.padding(new SUI.Padding(this.CAPTION_PADDING_TOP, 0, 0,
		 this.CAPTION_PADDING_LEFT));
		this._caption.el().style.cursor = "move";

		// if the window is resizable create the resize handlers
		if (this._resizable) {

			// create the the boxes for the side handles
			this._n = new SUI.Box({parent: this});
			this._e = new SUI.Box({parent: this});
			this._s = new SUI.Box({parent: this});
			this._w = new SUI.Box({parent: this});

			// create the the boxes for the corner handles
			this._nw = new SUI.Box({parent: this});
			this._ne = new SUI.Box({parent: this});
			this._se = new SUI.Box({parent: this});
			this._sw = new SUI.Box({parent: this});

			// set the cursors and resize event handlers for the handles
			var arr = [this._n, this._e, this._s, this._w, this._nw,
				this._ne, this._se, this._sw];
			var curs = ["n", "e", "s", "w", "nw", "ne", "se", "sw"];
			for (var i=0; i<arr.length; i++) {
				arr[i].el().style.cursor = curs[i] + "-resize";
				this._addResizeHandler(arr[i].el(), curs[i]);
			}
		}

		// create the close icon
		this._closeIcon = document.createElement("INPUT");
		this._closeIcon.type = "image";
		this._closeIcon.src = SUI.imgDir+"/"+SUI.resource.wnClose;
		this._closeIcon.style.position = "absolute";
		this.el().appendChild(this._closeIcon);

		// create the client area of the window (don't add it to _mainArea
		// because it has to lay over the corner draggers
		this.body = new SUI.Box({parent: this});
		this.body.addClass("body sui-window-body");
		if (arg.padding) {
			this.body.padding(arg.padding);
		}

		// add the event handlers
		this._addWindowEvents();
	},

	/* The draggable border width equals the width of all the borders.
	 */
	_draggerBorderWidth: function() {
		return this.OUTER_BORDER_OUTLINE + this.INNER_BORDER_OUTLINE +
			this.BORDER_WIDTH;
	},

	/* End the dragging motion, set the window's size and/or position to
	 * the ones of the dragger.
	 */
	_endDrag: function(dragger) {

		// set the window's size and/or position
		this.setRect(this.top() + dragger.top(), this.left() + dragger.left(),
			dragger.width(), dragger.height());

		// remove the dragger from the document tree
		dragger.removeBox();

		// redraw the window
		this.draw();
	},

	/* Initalize this static window stack.
	 */
	_initWindowStack: function() {

		// if there is no static windowStack, create it. The windowStack is
		// system global list of displayed modal windows.
		if (!SUI.Window.windowStack) {

			SUI.Window.windowStack = [];

			// add an event handler to the window that resizes all overlays
			// on the window resize event
			SUI.browser.addEventListener(window, "resize",
				function(event){
					for (var i=0; i<SUI.Window.windowStack.length; i++) {
						SUI.style.setRect(SUI.Window.windowStack[i]._overlay,
							0, 0, SUI.browser.viewportWidth-0,
							SUI.browser.viewportHeight-0);
					}
					SUI.browser.noPropagation(event);
				}
			);

			// add an event handler to the window that catches some keycodes
			// to close the window
			// TODO
			SUI.browser.addEventListener(window.document, "keydown",
				function(event) {
					var e = new SUI.Event(this, event);
					if (SUI.Window.windowStack.length) {
						var topI = SUI.Window.windowStack.length-1;
						var win = SUI.Window.windowStack[topI];
						// handle the esc key
						if (e.event.keyCode == 27 ) {
							// call the onclose listener before closing form
							win.callListener("onClose");
							win.close();
						}
						// handle the enter key
						//if (e.event.keyCode == 13 ) {
							//win.handleEnter(new SUI.Event(this, e));
						//}
						SUI.browser.noPropagation(event);
					}
				}
			);

		}

	},

	/* Start dragging of one of the borders of the window.
	 */
	_startDragBorder: function(event, dir) {

		// create a dragger
		var dragger = new SUI.Dragger({
			parent: this,
			width: this.width(),
			height: this.height(),
			border: new SUI.Border(this._draggerBorderWidth())
		});

		// set the style of the dragger
		dragger.addClass("sui-window-dragger");
		dragger.el().style.cursor = event.elListener.style.cursor;

		// set the direction of the dragger
		dragger.direction(dir);

		// get the boundaries and the dragger
		var xMax, yMax;
		if (dir.indexOf("w") != -1 || dir.indexOf("n") != -1) {
			xMax = this.left() + this.width();
			yMax = this.top() + this.height();
		} else {
			xMax = SUI.browser.viewportWidth - this.left() - 1;
			yMax = SUI.browser.viewportHeight - this.top() - 1;
		}

		if (xMax > this.maxWidth()) {
			xMax = this.maxWidth();
		}
		if (yMax > this.maxHeight()) {
			yMax = this.maxHeight();
		}

		// set the boundaries and direction of the dragger
		dragger.xMin(this.minWidth());
		dragger.yMin(this.minHeight());
		dragger.xMax(xMax);
		dragger.yMax(yMax);

		// set CSS dimensions of the dragger
		dragger.setDim();

		var that = this;
		// 'this' and 'dragger' are closure variables
		dragger.addListener("onEndDrag",
			function() {
				that._endDrag(dragger);
			}
		);

		// and start dragging
		dragger.start(event, this);
	},

	/* Start dragging the window.
	 */
	_startDragWindow: function(event) {

		// create a dragger ...
		var dragger = new SUI.Dragger({
			parent: this,
			width: this.width(),
			height: this.height(),
			border: new SUI.Border(this._draggerBorderWidth())
		});

		// ... set the style ...
		dragger.addClass("sui-window-dragger");
		dragger.el().style.cursor = this._caption.el().style.cursor;
		// ... and direction
		dragger.direction(dragger.HORIZONTAL + dragger.VERTICAL);

		// set the dragging boundaries
		dragger.xMin(-this.left() - this.OUTER_BORDER_OUTLINE);
		dragger.xMax(SUI.browser.viewportWidth - this.width() - this.left()
			- this.OUTER_BORDER_OUTLINE);
		dragger.yMin(-this.top() - this.OUTER_BORDER_OUTLINE);
		dragger.yMax(SUI.browser.viewportHeight - this.height() - this.top()
			- this.OUTER_BORDER_OUTLINE);

		// set CSS dimensions of the dragger
		dragger.setDim();

		var that = this;
		// 'this' and 'dragger' are closure variables
		dragger.addListener("onEndDrag",
			function() {
				that._endDrag(dragger);
			}
		);

		// and start dragging
		dragger.start(event, this);
	}

});
