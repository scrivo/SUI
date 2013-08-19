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
 * $Id: TextArea.js 786 2013-08-09 13:26:51Z geert $
 */

"use strict";

SUI.form.TextArea = SUI.defineClass(
	/** @lends SUI.form.TextArea.prototype */{

	/** @ignore */ baseClass: SUI.Box,

	/**
	 * @class
	 * SUI.form.TextArea is a simple box component to create an HTML text area.
	 *
	 * @augments SUI.Box
	 *
	 * @description
	 * Create a text area.
	 *
	 * @constructs
	 * @param see base class
	 * @param {String} arg.name The name attribute of the text area.
	 */
	initializer: function(arg) {

		arg.tag = "TEXTAREA";

		// set the default width an height
		arg.height = arg.height || this.HEIGHT;
		arg.width = arg.width || this.WIDTH;

		SUI.form.TextArea.initializeBase(this, arg);

		// use system borders
		this.border(null);

		// the name attribute
		if (arg.name) {
			this.el().name = arg.name;
		}
	},

	/**
	 * Default height of the text area
	 */
	HEIGHT: 50,

	/**
	 * Default width of the text area
	 */
	WIDTH: 200,

	/**
	 * Set the CSS size and position of the input field
	 */
	display: function() {

	 // set the position
		this.setPos();

		// set the width an height, use the following to determine the padding:
		// offsetHeight/Width - clientHeight/Width = padding
		this.el().style.width = this.width() +
			(this.el().clientWidth - this.el().offsetWidth) + "px";
		this.el().style.height = this.height() +
			(this.el().clientHeight - this.el().offsetHeight) + "px";
	}

});
