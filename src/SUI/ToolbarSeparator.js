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
 * $Id: ToolbarSeparator.js 786 2013-08-09 13:26:51Z geert $
 */

"use strict";

SUI.ToolbarSeparator = SUI.defineClass(
	/** @lends SUI.ToolbarSeparator.prototype */{

	/** @ignore */ baseClass: SUI.Box,

	/**
	 * @class
	 * A SUI.ToolbarSeparator is a small component to create a separator bar
	 * on a toolbar.
	 *
	 * @augments SUI.Box
	 *
	 * @description
	 * Create a toolbar separator.
	 *
	 * @constructs
	 */
	initializer: function(arg) {

		SUI.Toolbar.initializeBase(this, arg);

		// set the dimensions of the separator
		this.width(this.SEPERATOR_WIDTH + 2*this.SEPARATOR_PADDING_H);
		this.height(this.SEPARATOR_HEIGHT);

		// create the separator line, set its border and class
		this.line = new SUI.Box({parent: this});
		this.line.border(new SUI.Border(0, this.SEPERATOR_WIDTH / 2 | 0));
		this.line.addClass("sui-tb-separator");
	},

	/**
	 * Height of the separator (including padding)
	 */
	SEPARATOR_HEIGHT: 26,

	/**
	 * Horizontal padding of the separator
	 */
	SEPARATOR_PADDING_H: 3,

	/**
	 * Vertical padding of the separator
	 */
	SEPARATOR_PADDING_V: 3,

	/**
	 * Width of the separator line
	 */
	SEPERATOR_WIDTH: 2,

	/**
	 * Display the separator control. Set the CSS size and position of the
	 * separator's elements.
	 */
	display: function() {
		this.setDim();
		this.line.setDim();
	},

	/**
	 * Layout the separator control. Calculate the size and position of the
	 * separator's elements.
	 */
	layOut: function() {
		this.line.setRect(this.SEPARATOR_PADDING_V,
			this.SEPARATOR_PADDING_H, this.SEPERATOR_WIDTH,
			this.SEPARATOR_HEIGHT - 2*this.SEPARATOR_PADDING_V);
	},

	/**
	 * Get data from the separator so that it can be used to create a menu
	 * item in a PopupMenu.
	 * @return {Object} An object with separator data.
	 */
	menuItemData: function() {
		return {
			separator: true
		};
	}

});
