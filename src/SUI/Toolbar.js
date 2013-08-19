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
 * $Id: Toolbar.js 786 2013-08-09 13:26:51Z geert $
 */

"use strict";

SUI.Toolbar = SUI.defineClass(
	/** @lends SUI.Toolbar.prototype */{

	/** @ignore */ baseClass: SUI.Box,

	/**
	 * @class
	 * SUI.Toolbar is a component that gives you a strip that can contain a
	 * number of toolbar buttons and possibly other box elements. The actions
	 * for the buttons can be set individually or provided by an action list.
	 * In case of too little space, toolbar buttons that are that can't be
	 * displayed are substituted by a popup menu.
	 *
	 * @augments SUI.Box
	 *
	 * @description
	 * Create a toolbar.
	 *
	 * @constructs
	 * @param see base class
	 * @param {SUI.Box[]} arg.tools An array of box items that will be
	 *    presented on the toolbar. If these boxes also implement 'setAction'
	 *    than the can be initialized from and item of an action list and if
	 *    they implement menuItemData then the will appear on the toolbar's
	 *    sub menu if the tool can't be displayed due to lack of space.
	 */
	initializer: function(arg) {

		// anchor by default not to the bottom
		if (!arg.anchor) {
			arg.anchor = { right:true,left:true,top:true,bottom:false };
		}

		// set default height
		if (!arg.height) {
			arg.height = this.TOOLBAR_HEIGHT;
		}

		SUI.Toolbar.initializeBase(this, arg);

		this.actionList = arg.actionlist || null;

		// fix the min and max height to the current height
		this.minHeight(this.height());
		this.maxHeight(this.height());

		// initialize the tools array
		this._tools = [];

		// loop through all tools in the arguments ...
		for (var i=0; i<arg.tools.length; i++) {
		 // ... and add them to our list ...
			this._tools.push(arg.tools[i]);
			// ... and as child of the bar ...
			arg.tools[i].parent(this);
			// ... if the tool could be linked to an action item ...
			if (this.actionList && arg.tools[i].setAction) {
			 // ... then try to do this
				arg.tools[i].setAction(this.actionList);
			}
		}

		// add a single line under the toolbar
		this.border(new SUI.Border(0, 0, this.TOOLBAR_BORDER_BOTTOM_WIDTH, 0));
		this.padding(new SUI.Padding(this.BUTTON_PADDING));

		// a toolbar has have a button that shows a popup menu that is shown
		// when space is too little for all the other buttons
		var that = this;
		this.menuButton = new SUI.ToolbarButton({
			title: "",
			icon: SUI.resource.tbMenu,
			handler: function() { that._handleSubMenu(); }
		});
		this.menuButton.parent(this);

		// add the toolbar CSS class
		this.addClass("sui-tb-toolbar");
	},

	/**
	 * Padding of the buttons on the toolbar
	 */
	BUTTON_PADDING: 2,

	/**
	 * Width of the border under the toolbar
	 */
	TOOLBAR_BORDER_BOTTOM_WIDTH: 1,

	/**
	 * Height of the toolbar (including the border)
	 */
	TOOLBAR_HEIGHT: 31,

	/**
	 * Display the toolbar control. Set the CSS size and position of the
	 * of the bar and it's tools.
	 */
	display: function() {
	 // set the CSS size and position of the bar
		this.setDim();

		// set the CSS size and position of the (visible) tools
		for (var i=0; i < this._menuStart && i < this._tools.length; i++) {
			this._tools[i].display();
		}
		// set the CSS size and position of the sub menu buttom
		this.menuButton.setDim();
	},

	/**
	 * Lay out the the toolbar. Calculate the sizes and positions of all
	 * the toolbar and it's tools. Create a sub menu if necessary.
	 */
	layOut: function() {

	 // the menu button is not shown by default
		this.menuButton.el().style.display = "none";

		// start at the left padding distance ...
		var left = 0;
		// ... and loop through the tools, ...
		for (var i=0; i<this._tools.length; i++) {
		 // ... set the tool's postion ...
			this._tools[i].left(left);
			// ... layout the tool ...
			this._tools[i].layOut();
			// ... and show it ...
			this._tools[i].el().style.display = "block";
			// increase current left with the with of the button and the
			// toolbar button
			left += this._tools[i].width() + this.BUTTON_PADDING;
		}

		// find offscreen buttons
		this._menuStart = this._tools.length;
		// is the total tool's width larger than the toobar itself ?
		if (left > this.width()) {
		 // yes, then walk down ...
			for (i=this._tools.length-1; i>0; i--) {
			 // ... and decrease the left ...
				left -= this._tools[i].width() + this.BUTTON_PADDING;
				// ... until there is space for our sub menu button
				if (left < this.width() - this.menuButton.width()) {
					break;
				}
			}

			// save the index of the first offscreen tool ...
			this._menuStart = i;
			// ...and hide the offscreen tools
			for (; i < this._tools.length; i++) {
				this._tools[i].el().style.display = "none";
			}

			// set the position of the sub menu button ...
			this.menuButton.left(this.clientWidth() - this.menuButton.width());
			// ... and display it
			this.menuButton.el().style.display = "block";
		}

	},

	// index of first offscreen item to add the the sub menu
	_menuStart: 0,

	// reference to the submenu (if it's active)
	_subMenu: null,

	// the tools array
	_tools: null,

	/* Create a sub menu form the currently ofscreen items, or remove it
	 * if was already created.
	 */
	_handleSubMenu: function() {

		// if there was a sub menu created already ...
	 if (this._subMenu) {

	   // ... remove it ...
	   this._subMenu.removeMenu();
	   this._subMenu = null;

	 } else {

	   // ... else create it, set the button to pressed first, ...
			this.menuButton.select(true);

			// ... create an array with menu item information from the
			// undisplayed buttons ...
			var items = [];
			for (var i=this._menuStart; i<this._tools.length; i++) {
				if (this._tools[i].menuItemData) {
					var item = this._tools[i].menuItemData();
					items.push(item);
				}
			}

			// ... and create the sub menu
			this._subMenu = new SUI.PopupMenu({
				actionlist: this.actionList,
			 items: items
			});

			// clear our reference to the menu if the menu is removed by
			// an other UI action and 'un-press' the button
			var that = this;
			this._subMenu.addListener("onRemoveMenu",
				function() {
			   that._subMenu = null;
				 that.menuButton.select(false);
				}
			);

			// now show the menu right under the button
			var p = this.menuButton.absPos();
			this._subMenu.showMenu(p.t+this.menuButton.height() -1, p.l -1);
	 }
	}

});
