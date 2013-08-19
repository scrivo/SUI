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
 * $Id: Prompt.js 786 2013-08-09 13:26:51Z geert $
 */

"use strict";

SUI.dialog.Prompt = SUI.defineClass(
	/** @lends SUI.dialog.Prompt.prototype */{

	/** @ignore */ baseClass: SUI.dialog.Confirm,

	/**
	 * @class
	 * SUI.dialog.Prompt is a class to display a modal dialog box that prompts
	 * you to enter a value.
	 *
	 * @augments SUI.dialog.Confirm
	 *
	 * @description
	 * Show a modal dialog with user defined text, an input field and an
	 * ok and cancel button.
	 *
	 * @constructs
	 * @param see base class
	 * @param {String} arg.value The initial value of the input field.
	 */
	initializer: function(arg) {

		// get the dialog text to use
	 arg.text = arg.text || SUI.i18n.dlgPrompt;

	 SUI.dialog.Prompt.initializeBase(this, arg);

	 // set window caption
		this.caption(arg.caption || SUI.i18n.dlgCaptPrompt);

		// create an input element an anchor it to the bottom of the
		// client area
		this.inp = new SUI.form.Input({
			bottom: this.INPUT_MARGIN,
			left: this.INPUT_MARGIN,
		 right: this.INPUT_MARGIN,
			anchor: { right: true, left: true, bottom: true}
		});
		this.clientPanel.add(this.inp);

		// add the height of the input field to the dialog height
		this.height(this.height() +
		   this.inp.height() + (1.25*this.INPUT_MARGIN | 0));
		this.text.bottom(this.inp.height() + 2*this.INPUT_MARGIN);

		// set the initial value of the input field
		this.inp.el().value = arg.value || "";

		// disable the ok button if the input field contains no data
		this._enableOkButton();

		var that = this;
		// also on input ...
		SUI.browser.addEventListener(that.inp.el(), "input", function(e) {
		 // ... disable the ok button if the input field contains no data
			if (!that._enableOkButton()) {
				SUI.browser.noPropagation(e);
			}
		});
	},

	/**
	 * Margin of the input field on the client area.
	 */
	INPUT_MARGIN: 8,

	/**
	 * Return the input field's value on the dialog's transfer method.
	 */
	formToData: function() {
		this.close();
		return this.inp.el().value;
	},

	/**
	 * Show the dialog box centered on the screen.
	 */
	show: function() {
		SUI.dialog.Prompt.parentMethod(this, "show");
		this.inp.el().focus();
	},

	// Disable the ok button if the input field contains no data
	_enableOkButton: function() {
		this.okButton.el().disabled = SUI.trim(this.inp.el().value) == "";
	}

});
