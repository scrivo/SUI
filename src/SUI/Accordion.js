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
 * $Id: Accordion.js 786 2013-08-09 13:26:51Z geert $
 */

"use strict";

SUI.Accordion = SUI.defineClass(
	/** @lends SUI.Accordion.prototype */{

	/** @ignore */ baseClass: SUI.Box,

	/**
	 * @class
	 * SUI.Accordion is a component that helps you to save space by stacking a
	 * number of panels/boxes and let the user swap them. It's sort of a
	 * vertical tab list. The SUI.Accordion object can host a number of SUI
	 * boxes, each of them has a title bar for the user to identify and select
	 * them.
	 *
	 * @augments SUI.Box
	 *
	 * @description
	 * Construct a SUI.Accordion object. The titles of the headers and
	 * (optional) the client boxes are given as argument to this constructor.
	 * It is also possible to select the initial box.
	 *
	 * @constructs
	 * @param {inherit} arg An argument object.
	 * @param {Object[]} arg.items An array of object containing data for the
	 *    accordion items.
	 * @param {String} [arg.items[].title="Item x"] Header title.
	 * @param {SUI.Box} [arg.items[].box] A client box.
	 * @param {int} [arg.selected] Index of the client box that is initially
	 *     shown.
	 */
	initializer: function(arg) {

		// anchors default to all sides
		if (!arg.anchor) {
			arg.anchor = {left:true,right:true,top:true,bottom:true};
		}

		SUI.Accordion.initializeBase(this, arg);

		if (!arg.selected) {
			arg.selected = 0;
		}

		this._buildControl(arg);
	},

	/**
	 * Line thickness of the lines separating the different parts of the
	 * control.
	 * @constant
	 * @type int
	 * @private
	 */
	ITEM_BORDER_BOTTOM_WIDTH: 1,

	/**
	 * Height of an header.
	 * @constant
	 * @type int
	 * @private
	 */
	ITEM_HEIGHT: 24,

	/**
	 * Padding top of text and icon in the header.
	 * @constant
	 * @type int
	 * @private
	 */
	ITEM_PADDING_TOP: 4,

	/**
	 * Padding left and right of text and icon in the header.
	 * @constant
	 * @type int
	 * @private
	 */
	ITEM_PADDING_LR: 5,

	/**
	 * Size (width/height) of the icon.
	 * @constant
	 * @type int
	 * @private
	 */
	ICON_SIZE: 16,

	/**
	 * Add a box to one of the client areas of the control.
	 * @param {SUI.Box} child The box to add to the control.
	 * @param {int} i Index position of the client container to at the box to.
	 */
	add: function(child, i) {
		this._items[i].content.add(child);
	},

	/**
	 * Display the accordion control. Set the CSS size and position of all the
	 * headers and for the currently displayed content box.
	 */
	display: function() {

		// size and position of the current control
		this.setDim();

		// size and position of the header
		for (var i=0; i<this._items.length; i++) {
			this._items[i].header.setDim();
			this._items[i].headertext.setDim();
		}

		// and the client area
		this._selectedItem.content.display();
	},

	/**
	 * Lay out the accordion control. Calculate the size and position of all
	 * the headers and for the currently displayed content box.
	 */
	layOut: function() {

		for (var i=0, t=0; i<this._items.length; i++) {

			// get the size and position of all the header parts
			this._items[i].header.setRect(
				t, 0, this.width(), this.ITEM_HEIGHT
			);
			this._items[i].headertext.setRect(
				this.ITEM_PADDING_TOP, this.ITEM_PADDING_LR,
				this.width() - 2 * this.ITEM_PADDING_LR - this.ICON_SIZE,
				this.ITEM_HEIGHT - this.ITEM_PADDING_TOP
			);
			// set CSS positions of the icon
			SUI.style.setRect(this._items[i].headersign,
				this.ITEM_PADDING_TOP,
				this.width() - this.ITEM_PADDING_LR - this.ICON_SIZE,
				this.ICON_SIZE,     this.ICON_SIZE
			);

			// increase top with header height
			t += this.ITEM_HEIGHT;

			// by default we use a close sign ...
			this._items[i].headersign.src = SUI.imgDir + "/"
				+ SUI.resource.acClosed;
			// ... and do not display the content
			this._items[i].content.el().style.display = "none";

			// but if the item is selected ...
			if (this._selectedItem === this._items[i]) {
				// ... then show the open sign ...
				this._items[i].headersign.src = SUI.imgDir + "/"
					+ SUI.resource.acDown;
				// ... and display the content
				this._items[i].content.el().style.display = "block";

				// get the available height for the content ...
				var h = this._contentHeight();
				// ... and use it to set the client area of the control
				this._items[i].content.setRect(t, 0, this.width(), h);
				// ... and to set the new top
				t += h;
			}
		}

		// and layOut the control's client area
		this._selectedItem.content.layOut();
	},

	/**
	 * The list of accordion items.
	 * @type Object[]
	 * @private
	 */
	_items: null,

	/**
	 * Reference to the currently selected item.
	 * @type Object
	 * @private
	 */
	_selectedItem: null,

	/**
	 * Add the onclick event handler on the header.
	 * @param {Object} item Accordion item object.
	 * @private
	 */
	_addOnClickHeader: function(item) {
		var that = this;
		// 'that' and 'item' are two closures
		SUI.browser.addEventListener(item.header.el(), "click",
			function(e) {
				if (!that._doClick(item)) {
					SUI.browser.noPropagation(e);
				}
			}
		);
	},

	/**
	 * Make all required boxes for the control.
	 * @param {Object[]} arg Argument object as passed to the constructor.
	 * @private
	 */
	_buildControl: function(arg) {

		// start with an empty list
		this._items = [];
		// and no selected item
		this._selectedItem = null;

		// read in the items form the arguments object and store them in
		// a standardized way in the item list
		for (var i=0; i<arg.items.length; i++) {
			// start with a default profile
			var def = {
				title: "Item "+i,
				box: null
			};
			for (var prop in arg.items[i]) {
				// and overwrite the default profile with the entries set
				// in the arguments
				if (arg.items[i].hasOwnProperty(prop)) {
					def[prop] = arg.items[i][prop];
				}
			}
			this._items.push(def);
		}

		// Work trough the items and make the necessary boxes
		for (var i=0; i<this._items.length; i++) {

			// create a header box which gets the onclick
			this._items[i].header = new SUI.Box({parent: this});
			this._addOnClickHeader(this._items[i]);
			this._items[i].header.addClass("sui-ac-header");
			this._items[i].header.border(
				new SUI.Border(0, 0, this.ITEM_BORDER_BOTTOM_WIDTH));

			// a simple box for the header text
			this._items[i].headertext = new SUI.Box(
				{parent: this._items[i].header});
			this._items[i].headertext.el().innerHTML = this._items[i].title;

			// and add the open/close icon to the header
			this._items[i].headersign = SUI.browser.createElement("IMG");
			this._items[i].header.el().appendChild(this._items[i].headersign);

			// create a container to use as client panel
			this._items[i].content = new SUI.AnchorLayout({parent: this});
			this._items[i].content.addClass("sui-ac-content");
			this._items[i].content.border(
				new SUI.Border(0, 0, this.ITEM_BORDER_BOTTOM_WIDTH));
			this._items[i].content.el().style.overflow = "auto";
			this._items[i].content.el().style.display = "none";

			// if there is already content, then add it to the container
			if (this._items[i].box) {
				this.add(this._items[i].box, i);
			}

			// if this is the one, set the selected item
			if (i === arg.selected) {
				this._selectedItem = this._items[i];
			}
		}

		if (!this._selectedItem) {
			this._selectedItem = this._items[0];
		}
	},

	/**
	 * On onclick set the selected item and redraw the control.
	 * @param {Object} item Accordion item object.
	 * @private
	 */
	_doClick: function(item) {
		this._selectedItem = item;
		this.draw();
	},

	/**
	 * Calculate the available height for the content box.
	 * @return {int} Available height for the content box.
	 * @private
	 */
	_contentHeight: function() {
		return this.height() - this._items.length * this.ITEM_HEIGHT
			+ this.ITEM_BORDER_BOTTOM_WIDTH;
	}

});
