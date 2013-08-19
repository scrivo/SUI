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
 * $Id: TextBox.js 786 2013-08-09 13:26:51Z geert $
 */

"use strict";

SUI.TextBox = SUI.defineClass(
	/** @lends SUI.TextBox.prototype */{

	/** @ignore */ baseClass: SUI.Box,

	/**
	 * @class
	 * SUI.TextBox is a simple SUI.Box component displaying some (HTML) text.
	 *
	 * @augments SUI.Box
	 *
	 * @description
	 * Initialize a SUI.TextBox component.
	 *
	 * @constructs
	 * @param see base class
	 * @param {String} arg.text The text to display in the text box
	 */
	initializer: function(arg) {

		SUI.TextBox.initializeBase(this, arg);

		this.el().innerHTML = arg.text || "";

	},

	/**
	 * Set or get the text of the text box.
	 * @param {String} text the new text box text
	 * @return {String} the text box text
	 */
	text: function(text) {
		if (text === undefined) {
			return this.el().innerHTML;
		}
		this.el().innerHTML = text;
		return null;
	}

});
