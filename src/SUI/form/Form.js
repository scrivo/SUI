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
 * $Id: Form.js 786 2013-08-09 13:26:51Z geert $
 */

"use strict";

SUI.form.Form = SUI.defineClass(
	/** @lends SUI.form.Form.prototype */{

	/** @ignore */ baseClass: SUI.AnchorLayout,

	/**
	 * @class
	 * SUI.form.Form is a simple box component to create an HTML form.
	 *
	 * @augments SUI.AnchorLayout
	 *
	 * @description
	 * Create a form.
	 *
	 * @constructs
	 * @param see base class
	 * @param {boolean} arg.upload Set the enctype of the form to
	 *     multipart/form-data
	 * @param {String} arg.action The form's action url
	 * @param {String} arg.target The form's target
	 */
	initializer: function(arg) {

		arg.tag = "FORM";
		arg.elemAttr = {
			method: "post",
			// make it an file upload form if requested
			enctype: arg.upload ? "multipart/form-data" : null,
			// IE 7: better believe it :(
			encoding: arg.upload ? "multipart/form-data" : null,
		// set the form's action if given
			action: arg.action || null,
		// set the form's target if given
			target: arg.target || null
		};

		SUI.form.Form.initializeBase(this, arg);
	}
});
