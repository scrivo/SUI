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
 * $Id: SelectList.js 786 2013-08-09 13:26:51Z geert $
 */

"use strict";

SUI.form.SelectList = SUI.defineClass(
	/** @lends SUI.form.SelectList.prototype */{

	/** @ignore */ baseClass: SUI.Box,

	/**
	 * @class
	 * SUI.form.SelectList is a simple box component to create an HTML select
	 * list.
	 *
	 * @augments SUI.Box
	 *
	 * @description
	 * Create a select list.
	 *
	 * @constructs
	 * @param see base class
	 * @param {String} arg.title The text on the button.
	 * @param {object[]} arg.options Array with objects containing the
	 *     following members.
	 * @param {String} arg.options[].text The text for the select list option.
	 * @param {String} arg.options[].value The value of the select list option.
	 * @param {boolean} arg.options[].checked The selected state of the select
	 *     list option.
	 */
	initializer: function(arg) {

		arg.tag = "SELECT";

		// set the default width an height
		arg.height = arg.height || this.HEIGHT;
		arg.width = arg.width || this.WIDTH;

		SUI.form.SelectList.initializeBase(this, arg);

		// use system borders
		this.border(null);

		// the name attribute
		if (arg.name) {
			this.el().name = arg.name;
		}

		// set the options
		if (arg.options) {
			this.options(arg.options);
		}
	},

	/**
	 * Default height of the select list
	 */
	HEIGHT: 20,

	/**
	 * Default width of the select list
	 */
	WIDTH: 150,

	/**
	 * Set the options of the select list.
	 *  @param {object[]} opt Array with objects containing the following
	 *    members.
	 *  - {String} text The text for the select list option
	 *  - {String} value The value of the select list option
	 *  - {boolean} checked The selected state of the select list option
	 */
	options: function(opt) {
	 // clear the options array
		if (this.el().options.length) {
			this.el().options.length = 0;
		}
		// add the new options
		for (var i=0; i<opt.length; i++) {
		 // if no option value was defined use the index number
			var k = opt[i].value !== undefined ? opt[i].value : i;
			// create the option an add it to the elements option array
			this.el().options[this.el().options.length] = new Option(
			 opt[i].text, k, false, opt[i].checked || false);
		}
	}

});
