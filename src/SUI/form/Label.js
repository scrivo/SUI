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
 * $Id: Label.js 786 2013-08-09 13:26:51Z geert $
 */

"use strict";

SUI.form.Label = SUI.defineClass(
	/** @lends SUI.form.Label.prototype */{

	/** @ignore */ baseClass: SUI.Box,

	/**
	 * @class
	 * SUI.form.Label is a simple box component to create an HTML label.
	 *
	 * @augments SUI.Box
	 *
	 * @description
	 * Create a label.
	 *
	 * @constructs
	 * @param see base class
	 * @param {String} arg.title The text on the label.
	 * @param {SUI.Box} arg.forBox The box where this label's for.
	 */
	initializer: function(arg) {

		arg.tag = "LABEL";
		arg.height = arg.height || this.HEIGHT;

		SUI.form.Label.initializeBase(this, arg);

		this.forBox(arg.forBox || null);
		this.el().innerHTML = arg.title || "";

		this.el().style.overflow = "hidden";
		this.el().style.whiteSpace = "nowrap";

		var that = this;
		// but we do want to show the content if it is truncated
		// that and cell are the tow closure variables
		SUI.browser.addEventListener(this.el(), "mouseover",
			function(e) {
				if (!that._setTitleOnOverflow()) {
					SUI.browser.noPropagation(e);
				}
			}
		);

	},

	/**
	 * Default height of the label.
	 */
	HEIGHT: 20,

	/**
	 * Correction to add to the top of the label to vertically align the text
	 * with the control.
	 */
	TOP_PATCH: 2,

	/**
	 * Get or set the box where the label is for.
	 * @param {SUI.Box} f (optional) the new box where this label points to
	 * @return {SUI.Box} the box where this label points to  (null if method
	 *    was used as setter)
	 */
	forBox: function(f) {
		return f !== undefined ? (this._forBox = f) && null : this._forBox;
	},

	/**
	 * Display the label. Set the CSS size and postion.
	 */
	display: function() {
	 // do the normal lay out
		SUI.form.Label.parentMethod(this, "display");
		// and a little adjustment, note this only works because
		// parentMethod.display() sets this.el().style.top, thus there is
		// no chance of a 'growing' top margin when calling display multiple
		// times.
		this.el().style.top =
			(this.TOP_PATCH + parseInt(this.el().style.top,10)) + "px";
	},

	/**
	 * Lay out the label. Set it's size and position.
	 */
	layOut: function() {
	 // if the label points to a box ...
	 if (this._forBox) {
	   // ... set the for attribute of the box's element
		 this.el().setAttribute("for", this._forBox.el().id);
		}
		SUI.form.Label.parentMethod(this, "layOut");
	},

	// reference to the box where this label points to
	_forBox: null,

	// the top of the box (uncorrected)
	_lTop: 0,

	/* Set the label title if the contents of the label did overflow
	 */
	_setTitleOnOverflow: function() {
		var of = this.el().clientWidth - this.el().scrollWidth;
		this.el().title =
			of >= 0 ? "" : this.el().innerHTML .replace(/<[^>]+>/g,"");
	}

});
