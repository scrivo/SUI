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
 * $Id: Alert.js 786 2013-08-09 13:26:51Z geert $
 */

"use strict";

SUI.dialog.Alert = SUI.defineClass(
	/** @lends SUI.dialog.Alert.prototype */{

	/** @ignore */ baseClass: SUI.dialog.Confirm,

	/**
	 * @class
	 * SUI.Confirm is a class to display a modal alert message box.
	 *
	 * @augments SUI.dialog.Confirm
	 *
	 * @description
	 * Show a modal dialog with user defined text and an OK button.
	 *
	 * @constructs
	 * @param see base class
	 * @param {String} arg.icon "ok", "error", or file name
	 */
	initializer: function(arg) {

		// get the dialog text to use
		arg.text = arg.text || SUI.i18n.dlgAlert;

	 SUI.dialog.Alert.initializeBase(this, arg);

	 // set window caption
		this.caption(arg.caption || SUI.i18n.captionAlert);

		// wipe out the cancel button ...
		this.cancelButton.el().style.display = "none";
		// ... move to ok button to the right
		this.okButton.right(this.EXTRA_WINDOW_BORDER);

		// get the icon location ...
		var src = SUI.imgDir+"/"+SUI.resource.mbAlert;
		if (arg.icon !== undefined) {
			src = arg.icon == "error"
				? SUI.imgDir+"/"+SUI.resource.mbError
				: arg.icon == "ok"
					? SUI.imgDir+"/"+SUI.resource.mbOK
					: arg.icon;
		}
		// ... and use that icon
		this.image.src = src;
	}

});
