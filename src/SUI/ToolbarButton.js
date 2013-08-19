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
 * $Id: ToolbarButton.js 786 2013-08-09 13:26:51Z geert $
 */

"use strict";

SUI.ToolbarButton = SUI.defineClass(
	/** @lends SUI.ToolbarButton.prototype */{

	/** @ignore */ baseClass: SUI.Box,

	/**
	 * @class
	 * A SUI.ToolbarButton is an icon-button component. Although designed for
	 * use on a toolbar it can be used stand-alone as well. By default it is
	 * a clickable button but you can set it 'pressed' state, and thereby
	 * making it behave like a push-button. The button data (title, icon,
	 * action, etc) can be set directly, but can by supplied through an action
	 * list as well.
	 *
	 * @augments SUI.Box
	 *
	 * @description
	 * Create a toolbar button.
	 *
	 * @constructs
	 * @param see base class
	 * @param {String} arg.actionId Action id if an action in a action list
	 * @param {Function} arg.handler Reference to a function to execute when
	 *     the button is pressed
	 * @param {String} arg.title Mouse over title of the button
	 * @param {String} arg.icon Location of the icon
	 * @param {boolean} arg.disabled The enabled state of the button (true
	 *     to disable)
	 */
	initializer: function(arg) {

		// set the default size for the button
		if (!arg.width) {
			arg.width = this.BUTTON_SIZE;
		}
		if (!arg.height) {
			arg.height = this.BUTTON_SIZE;
		}

		SUI.ToolbarButton.initializeBase(this, arg);

		// set values from arguments
		this._actionId = arg.actionId || null;
		this._handler = arg.handler || null;
		this._title = arg.title || null;
		this._icon = arg.icon || null;

		// set the button's border and padding
		this.border(new SUI.Border(this.BORDER_WIDTH));
		this.padding(new SUI.Padding(
		 (this.clientWidth() - this.ICON_SIZE) / 2 | 0));

		// create the icon and add it to the button
		var img = document.createElement("IMG");
		if (this._icon) {
			img.src = SUI.imgDir + "/" + this._icon;
		}
		this.el().appendChild(img);

		// set the button's title, CSS class and enabled state
		this.el().title = this._title || "";
		this.addClass("sui-tb-button");
		this.enable(arg.disabled ? false : true);

		// add the event listeners
		this._addEventListeners();
	},

	/**
	 * The width and height of the button.
	 */
	BUTTON_SIZE: 26,

	/**
	 * The size (width, height) of the button's icon.
	 */
	ICON_SIZE: 16,

	/**
	 * Border width of the button.
	 */
	BORDER_WIDTH: 1,

	/**
	 * Get the enabled state of the button.
	 * @return {boolean} a The button's enabled state.
	 */
	enabled: function(a) {
		return this._enabled;
	},

	/**
	 * set the enabled state of the button.
	 * @param {boolean} a The button's enabled state.
	 */
	enable: function(a) {
		this._enabled = a;
		if (this._enabled) {
			this.removeClass("sui-tb-button-disabled");
		} else {
			this.addClass("sui-tb-button-disabled");
		}
	},

	/**
	 * Get data from the button so that it can be used to create a menu item
	 * in a PopupMenu
	 * @return {Object} An object with button data.
	 */
	menuItemData: function() {
		return {
			icon: this._icon,
			title: this._title,
			actionId: this._actionId,
			handler: this._handler,
			disabled: !this._enabled
		};
	},

	/**
	 * Show the button in pressed or un-pressed state.
	 * @param {boolean} pr The button's pressed state.
	 */
	select: function(pr) {
	 // set the pressed state ...
		this._selected = pr;
		// ... and show the pressed state
		if (!this._selected) {
		 this._showUnpressed();
		} else {
		 this._showPressed();
		}
	},

	/**
	 * Set button parameters from an action list item if the button's actionId
	 * is an entry in the list.
	 * @param {SUI.ActionList} actionList An action list containing an action
	 *   entry that corresponds with this button's actionId
	 */
	setAction: function(actionList) {
	 // get the action from the list
	 var a = actionList.get(this._actionId);
		// if found ...
	 if (a) {
			// ... set the title from action list data if not title was set ...
			if (!this._title) {
			 this._title = a.title;
				this.el().title = this._title || "";
			}
			// ... set the icon from action list data if no icon was set ...
			if (!this._icon) {
			 this._icon = SUI.imgDir + "/" + a.icon;
				this.el().firstChild.src = this._icon;
			}
			// ... set the enabled state and action handler ...
			this.enable(a.enabled);
			this._handler = a.handler;
			// ... add the button to the list's listener array
			actionList.get(this._actionId).listeners.push(this);
		}
	},

	// the action id of an action list
	_actionId: null,

	// the button's action handler
	_handler: null,

	// the button's icon
	_icon: null,

	// pressed: used to keep the button in pressed state
	_selected: false,

	// the button's title (mouseover)
	_title: null,

	/* Set the event handlers of the button.
	 * On the row-div set:
	 *   onclick => _selectNode
	 *   onmouseover => _addHighlight
	 *   onmouseout => _removeHighlight
	 *   onmousedown => _showPressed
	 *   onmouseup => _showUnpressed
	 */
	_addEventListeners: function() {

		var that = this;

		// do _addHighlight on the mouseover event of a node-row.
		SUI.browser.addEventListener(this.el(), "mouseover",
			function(e) {
				if (!that._addHighlight()) {
					SUI.browser.noPropagation(e);
				}
			}
		);

		// do _removeHighlight on the mouseout event of a node-row.
		SUI.browser.addEventListener(this.el(), "mouseout",
			function(e) {
				if (!that._removeHighlight()) {
					SUI.browser.noPropagation(e);
				}
			}
		);

		// do _showPressed on the mousedown event of a node-row.
		SUI.browser.addEventListener(this.el(), "mousedown",
			function(e) {
			 if (!that._showPressed()) {
					SUI.browser.noPropagation(e);
				}
			}
		);

		// do _showUnpressed on the mouseup event of a node-row.
		SUI.browser.addEventListener(this.el(), "mouseup",
			function(e) {
		   if (!that._showUnpressed()) {
					SUI.browser.noPropagation(e);
				}
			}
		);

		// do _execute on the click event of a node-row.
		SUI.browser.addEventListener(this.el(), "click",
			function(e) {
				if (!that._execute()) {
					SUI.browser.noPropagation(e);
				}
			}
		);

	},

	/* Add the CCS class for highlighting to the button.
	 */
	_addHighlight: function() {
		this.addClass("sui-tb-button-highlight");
	},

	/* Execute the buttons action handler.
	 */
	_execute: function() {
	 // check the button's enabled state
		if (this._enabled) {
		 // 'unpress' the button
			this._selected = false;
			// execute the hander
			if (this._handler) {
			 this._handler();
			}
		}
	},

	/* Remove the CCS class for highlighting from the button.
	 */
	_removeHighlight: function(e) {
	 this.removeClass("sui-tb-button-highlight");
	 this._showUnpressed();
	},

	/* Show the button in pressed state
	 */
	_showPressed: function(e) {
	 this.addClass("sui-tb-button-pressed");
	},

	/* Show the button in normal un-pressed state if (unless its pressed state
	 * is on)
	 */
	_showUnpressed: function(e) {
		if (!this._selected) {
		 this.removeClass("sui-tb-button-pressed");
		}
	}

});
