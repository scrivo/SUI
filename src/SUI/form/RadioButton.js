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
 * $Id: RadioButton.js 786 2013-08-09 13:26:51Z geert $
 */

"use strict";

SUI.form.RadioButton = SUI.defineClass(
	/** @lends SUI.form.RadioButton.prototype */{

	/** @ignore */ baseClass: SUI.Box,

	/**
	 * @class
	 * SUI.form.RadioButton is a simple box component to create an HTML radio
	 * button.
	 *
	 * @augments SUI.Box
	 *
	 * @description
	 * Create a check box.
	 *
	 * @constructs
	 * @param see base class
	 * @param {String} arg.name The name attribute of the radio button
	 * @param {boolean} arg.checked The checked state of the radio button
	 */
	initializer: function(arg) {

		arg.tag = "INPUT";
		arg.elemAttr = {
			type: "radio",
			// the checked state
			checked: arg.checked || null,
			// the name attribute
			name: arg.name || null
		};

		SUI.form.RadioButton.initializeBase(this, arg);

	},

	/**
	 * Correction to add to the top of elment to vertically align it with
	 * other form elements
	 */
	TOP_PATCH: 2,

	/**
	 * Set the CSS position of the check box.
	 */
	display: function() {
	 // don't bother to set the width or height: that does not work well
		this.el().style.top = (this.TOP_PATCH + this.top()) + "px";
		this.el().style.left = this.left() + "px";
	}


});
