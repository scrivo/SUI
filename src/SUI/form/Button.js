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
 * $Id: Button.js 786 2013-08-09 13:26:51Z geert $
 */

"use strict";

SUI.form.Button = SUI.defineClass(
	/** @lends SUI.form.Button.prototype */{

	/** @ignore */ baseClass: SUI.Box,

	/**
	 * @class
	 * SUI.form.Button is a simple box component to create an HTML form button.
	 *
	 * @augments SUI.Box
	 *
	 * @description
	 * Create a button.
	 *
	 * @constructs
	 * @param see base class
	 * @param {String} arg.title The text on the button.
	 */
	initializer: function(arg) {

		// set the default width an height
		arg.height = arg.height || this.HEIGHT;
		arg.width = arg.width || this.WIDTH;
		arg.tag = "BUTTON";
		arg.elemAttr = { type: "button" };

		SUI.form.Button.initializeBase(this, arg);

		// use system borders
		this.border(null);

		// create an inner span for the button text
		this.span = SUI.browser.createElement("SPAN");
		this.span.style.position = "relative";
		this.span.innerHTML = arg.title || "";
		this.el().appendChild(this.span);

	},

	/**
	 * Default button width
	 */
	WIDTH: 100,

	/**
	 * Default button height
	 */
	HEIGHT: 26

});
