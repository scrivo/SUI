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
 * $Id: PopupMenu.js 786 2013-08-09 13:26:51Z geert $
 */

"use strict";

SUI.PopupMenu = SUI.defineClass(
	/** @lends SUI.PopupMenu.prototype */{

	/** @ignore */ baseClass: SUI.Box,

	/**
	 * @class
	 * SUI.PopupMenu is a popupmenu as typically can be seen as context menu,
	 * or as drop down menu on a main menu bar. The items in the menu are
	 * linked to action handlers or to another (sub)menu.
	 *
	 * @augments SUI.Box
	 *
	 * @description
	 * Construct a popup menu. A large number of variables can be set
	 * to customize the listview to your specific needs.
	 *
	 * @constructs
	 * @param see base class
	 * @param {SUI.ActionList} arg.actionlist (optional) an action list with
	 *     the definition of the actions
	 * @param {object[]} arg.cols The menu item definition: an array with
	 *     objects which can contain the following fields:
	 * @param {boolean} arg.cols[].separator Is the item a separator
	 * @param {String} arg.cols[].icon The location of the icon for the menu
	 *     item
	 * @param {boolean} arg.cols[].disabled The enabled state of the menu item
	 * @param {String} arg.cols[].title The menu item text
	 * @param {String} arg.cols[].actionId An action identifier if an action
	 *     defined in an action list
	 * @param {Function} arg.cols[].handler A callback to execute on menu
	 *     item selection
	 * @param {object[]} arg.cols[].arg.items The item of a submenu (follows
	 *     same definition)
	 */
	initializer: function(arg) {

		SUI.PopupMenu.initializeBase(this, arg);

		// are we creating a sub menu
		this._main = arg.sub !== true;

		// is this menu associated with and action list
		this._actionList = arg.actionlist || null;

		// start with an empty items array
		this.items = [];

		this._buildControl(arg.items);
	},

	/**
	 * Width of the outer border of the menu
	 */
	BORDER_WIDTH: 1,

	/**
	 * Size (width and height) of the menu's icons
	 */
	ICON_SIZE: 16,

	/**
	 * Width of the area where the icons are displayed
	 */
	ICONBAR_WIDTH: 23,

	/**
	 * Border width of a menu item
	 */
	ITEM_BORDER_WIDTH: 1,

	/**
	 * The height (inclusive border) of a menu item
	 */
	ITEM_HEIGHT: 22,

	/**
	 * Padding of the menu items
	 */
	ITEM_PADDING: 2,

	/**
	 * Padding of the menu (4 sides and not the item padding)
	 */
	MENU_PADDING: 1,

	/**
	 * The height of the menu separator line
	 */
	SEPARATOR_LINE_HEIGHT: 1,

	/**
	 * The height of a menu separator
	 */
	SEPARATOR_HEIGHT: 5,

	/**
	 * Display the popup menu. Set the CSS size and position of the menu
	 * and all the items.
	 */
	display: function() {

		// set the CSS dimensions of the menu
		this.setDim();
		this.iconbar.setDim();

		// set the CSS dimensions of the menu items
		for (var i=0; i<this.items.length; i++) {
			this.items[i].bar.setDim();
			if (!this.items[i].separator) {
				this.items[i].titlediv.setDim();
			}
		}
	},

	/**
	 * Lay out the popup menu. Calculate the size and position of the
	 * menu and its items.
	 */
	layOut: function() {

		// calculate height
		this.height(this.border().height + this.padding().height);

		for (var i=0; i<this.items.length; i++) {
			if (this.items[i].separator) {
				this.height(this.height() + this.SEPARATOR_HEIGHT);
			} else {
				this.height(this.height() + this.ITEM_HEIGHT);
			}
		}

		// if the menu will drop off the screen correct the top and or left
		// of the menu.
		if (this.top() + this.height() > SUI.browser.viewportHeight) {
			this.top(SUI.browser.viewportHeight - this.height());
		}
		if (this.left() + this.width() > SUI.browser.viewportWidth) {
			this.left(SUI.browser.viewportWidth - this.width());
		}

		// get the size and position of the icon bar
		this.iconbar.setRect(0, 0, this.ICONBAR_WIDTH,
			this.clientHeight() + this.padding().height);

		var l = 0;
		var t = 0;

		// get the size an positions of the items
		for (var i=0; i<this.items.length; i++) {

			if (this.items[i].separator) {

				// get separator size and position
				this.items[i].bar.setRect(t,
					l + this.ICONBAR_WIDTH
						+ this.SEPARATOR_HEIGHT,
					this.clientWidth() - this.ICONBAR_WIDTH -
						- 2 * this.SEPARATOR_HEIGHT,
					(this.SEPARATOR_HEIGHT / 2 | 0)
						+ this.SEPARATOR_LINE_HEIGHT);

				t += this.SEPARATOR_HEIGHT;

			} else {

				// get menu item size and position
				this.items[i].bar.setRect(t, l,
					this.clientWidth(), this.ITEM_HEIGHT);
				this.items[i].titlediv.setRect(0, this.ICONBAR_WIDTH,
					this.clientWidth() - this.ICONBAR_WIDTH, this.ITEM_HEIGHT);

				t += this.ITEM_HEIGHT;

				// It the menu was displayed before the item can still have
				// the selected CSS class, so clear it
				this.items[i].bar.removeClass("sui-popup-item-selected");

				// It the menu was disabled before the item can still have
				// the disabled CSS class, so clear it
				this.items[i].bar.removeClass("sui-popup-item-disabled");
				if (SUI.browser.isIE) {
					this.items[i].titlediv.removeClass(
						"sui-popup-item-disabled");
				}
				// if the item is not enabled set the disabled CSS style
				if (!this._isEnabled(this.items[i])) {
					this.items[i].bar.addClass("sui-popup-item-disabled");
					if (SUI.browser.isIE) {
						this.items[i].titlediv.addClass(
							"sui-popup-item-disabled");
					}
				}

			}
		}
	},

	/**
	 * Remove the currently active menu from the screen. Note that this
	 * function normally will be called from the framework and that there is
	 * no need to call it yourself. Note also that it removes the currently
	 * active menu, so not necessarily the one that you have created.
	 * @param {int} top Top position of the menu
	 * @param {int} left Left position of the menu
	 */
	removeMenu: function() {
		// if there is an active menu
		if (SUI.PopupMenu.activeMenu) {
			// remove it and ...
			SUI.PopupMenu.activeMenu._removeMenu();
			// ... call the onRemoveMenu changed event handler
			SUI.PopupMenu.activeMenu.callListener("onRemoveMenu");
			SUI.PopupMenu.activeMenu = null;
		}
	},

	/**
	 * Show the popup menu at the specified location.
	 * @param {int} top Top position of the menu
	 * @param {int} left Left position of the menu
	 */
	showMenu: function(top, left) {

		// if we're drawing the main(top) menu we'll need to take care of
		// some extra stuff to. We'll assign the menu to a static variable
		// because there only can be one menu active at the same time. So
		// if the static is already set, we'll remove the menu first.
		if (this._main) {
			// there can be only one popupmenu, remove the old one first
			this.removeMenu();
			// add a event listener on the document to catch the clicks next
			// to the menu and remove it
			var that = this;
			SUI.browser.addEventListener(document, "mousedown",
				function (e) {
					if (!that.removeMenu()) {
						SUI.browser.noPropagation(e);
					}
				}
			);
			// make this menu the active submenu
			SUI.PopupMenu.activeMenu = this;
		}

		// Add the menu to the document body ...
		// TODO: look for a better attachment point
		this.parent({el: function() { return document.body; }});

		// ... and draw the popup at the required position
		this.left(left);
		this.top(top);
		this.draw();
	},

	/**
	 * onRemoveMenu event handler: is executed when the the menu is removed.
	 */
	onRemoveMenu: function() {
	},

	_activeSubmenuItem: null,

	/* Set event handlers of a menu item:
	 * mousedown => _selectItem;
	 * mouseover => _highlightItem;
	 * mouseout => _restoreItem
	 */
	_addEventHandlers: function(item) {

		// 'that' and 'item' are two closure variables
		var that = this;

		// Do _selectItem on the mousedown event of a menu item.
		SUI.browser.addEventListener(item.bar.el(), "mousedown",
			function(e) {
				if (!that._selectItem(item)) {
					SUI.browser.noPropagation(e);
				}
			}
		);

		// Do _highlightItem on the mouseover event of a menu item.
		SUI.browser.addEventListener(item.bar.el(), "mouseover",
			function(e) {
				if (!that._highlightItem(item)) {
					SUI.browser.noPropagation(e);
				}
			}
		);

		// Do _restoreItem on the mouseout event of a menu item.
		SUI.browser.addEventListener(item.bar.el(), "mouseout",
			function(e) {
				if (!that._restoreItem(item)) {
					SUI.browser.noPropagation(e);
				}
			}
		);

	},

	/* Make all required boxes for the popup menu, set event handlers and
	 * target actions
	 */
	_buildControl: function(items) {

		// set the style for the control
		this.border(new SUI.Border(this.BORDER_WIDTH));
		this.padding(new SUI.Padding(this.MENU_PADDING));
		this.addClass("sui-popup");

		// create and area for the icons
		this.iconbar = new SUI.Box({parent: this});
		this.iconbar.addClass("sui-popup-iconbar");

		var hasSub = false;

		// loop through all the items
		for (var i=0; i<items.length; i++) {

			// create a default item profile
			var item = {
				separator: items[i].separator || false,
				icon: items[i].icon || null,
				enabled: !items[i].disabled || false,
				title: items[i].title || "Item "+i,
				sub: false
			};

			// is this item associated with an action in an action list ...
			if (items[i].actionId !== undefined && this._actionList) {

				// ... yes, get the data for the menu item from the action list
				var a = this._actionList.get(items[i].actionId);
				item.actionId = items[i].actionId;
				item.title = a.title;
				item.icon = a.icon;
				item.handler = a.handler;

			} else if (items[i].handler !== undefined) {

				// ... else if a handler was given use that one
				item.handler = items[i].handler;

			} else if (items[i].items !== undefined) {

				// ... else create a submenu if submenu data
				items[i].sub = true;
				item.submenu = new SUI.PopupMenu(items[i]);
				hasSub = true;

			}

			// add the item to the menu's item array
			this.items.push(this._createItem(item));
		}

		// set the width of the menu to the current width (width of the
		// longest text) plus additional elements.
		this.width(this.width() + this.ICONBAR_WIDTH
			+ 2 * (this.ITEM_PADDING + this.MENU_PADDING
			+ this.ITEM_BORDER_WIDTH + this.BORDER_WIDTH)
			+ (hasSub ? this.ICON_SIZE : 0));

	},

	/* Create the boxes for the popup menu item.
	 */
	_createItem: function(item) {

		if (item.separator) {

			// create a box for a separator line
			item.bar = new SUI.Box({parent: this});
			item.bar.border(new SUI.Border(0, 0, this.SEPARATOR_LINE_HEIGHT));
			item.bar.addClass("sui-popup-separator");

		} else {

			// create a box for the popup menu item
			item.bar = new SUI.Box({parent: this});
			item.bar.border(new SUI.Border(this.ITEM_BORDER_WIDTH));
			item.bar.addClass("sui-popup-item");

			// and a inner box for the menu item text
			item.titlediv = new SUI.Box({parent: item.bar});
			item.titlediv.padding(
				new SUI.Padding(this.ITEM_PADDING));
			item.titlediv.el().innerHTML = item.title;

			// if the items as a sub-menu set the sub-menu marker
			if (item.submenu) {
				item.titlediv.el().style.backgroundImage =
					"url("+SUI.imgDir+"/"+SUI.resource.pmSub+")";
			}

			// if the item has an icon add that to the menu
			if (item.icon) {
				var img = document.createElement("IMG");
				img.src = SUI.imgDir + "/" + item.icon;
				img.style.padding = this.ITEM_PADDING + "px";
				item.bar.el().appendChild(img);
			}

			// set the event handlers
			this._addEventHandlers(item);
		}

		// get the text width of the item text ...
		var iw = SUI.style.textLength(item.title);
		// ... and if it is wider that the current text ...
		if (iw > this.width()) {
			// ... use that width
			this.width(iw);
		}

		return item;
	},

	/* Highlight a menu item.
	 */
	_highlightItem: function(item) {

		// highlighting is only possible if an item is enabled
		if (this._isEnabled(item)) {

			// if there is a submenu shown and we want to highlight another
			// menu item ...
			if (this._activeSubmenuItem && this._activeSubmenuItem !== item) {
				// ... then remove it ...
				this._activeSubmenuItem.submenu._removeMenu();
				/// ... and clear the highlight
				this._activeSubmenuItem.bar.removeClass(
					"sui-popup-item-selected");
				this._activeSubmenuItem = null;
			}

			// add the highlight to the requested item
			item.bar.addClass("sui-popup-item-selected");

			// if the item as a submenu them show it
			if (item.submenu && !this._activeSubmenuItem) {
				var top = this.top() + item.bar.top() - this.BORDER_WIDTH;
				var left = this.left() + this.clientWidth();
				item.submenu.showMenu(top, left);
				this._activeSubmenuItem = item;
			}
		}

	},

	/* Is a menu item eabled.
	 */
	_isEnabled: function(item) {
		// if a action list was used then get the enabled state from the
		// action list, else use its local setting
		return item.actionId
			? this._actionList.get(item.actionId).enabled : item.enabled;
	},

	/* Remove the menu and it currently shown submenus.
	 */
	_removeMenu: function() {
		// if a submenu was shown ...
		if (this._activeSubmenuItem) {
			// ... recurse into the submenu
			this._activeSubmenuItem.submenu._removeMenu();
			this._activeSubmenuItem = null;
		}
		// remove the menu from the document tree
		this.removeBox();
	},

	/* Remove the highlight from the menu item.
	 */
	_restoreItem: function(item)  {
		// remove the highlight only if we move to another menu item and the
		// currently highlighted one is not a submenu (in that case we'll
		// remove the highlight not until we highlighting the new menu item)
		if (this._activeSubmenuItem !== item) {
			item.bar.removeClass("sui-popup-item-selected");
		}
	},

	/* Select an item, execute the handler if the item is not a submenu
	 * and remove the popup.
	 */
	_selectItem: function(item)  {
		// if the item is enabled and not a submenu ...
		if (this._isEnabled(item) && !item.submenu) {
			// ... execute the handler and remove the popup.
			this.removeMenu();
			item.handler(this);
		}
	}

});
