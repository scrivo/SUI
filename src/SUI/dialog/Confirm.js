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
 * $Id: Confirm.js 786 2013-08-09 13:26:51Z geert $
 */

"use strict";

SUI.dialog.Confirm = SUI.defineClass(
	/** @lends SUI.dialog.Confirm.prototype */{

	/** @ignore */ baseClass: SUI.dialog.OKCancelDialog,

	/**
	 * @class
	 * SUI.Confirm is a class to display a modal confirmation (ok/cancel)
	 * message box.
	 *
	 * @augments SUI.dialog.OKCancelDialog
	 *
	 * @description
	 * Show a modal dialog with user defined text and an OK and Cancel
	 * button.
	 *
	 * @constructs
	 * @param see base class
	 * @param {String} arg.caption Window caption of the message box.
	 * @param {String} arg.text Text to display in the message box.
	 */
	initializer: function(arg) {

		SUI.dialog.Confirm.initializeBase(this, arg);

		// set the initial size of the client area to that of the icon
		this.setClientHeight(this.ICON_SIZE + 2*this.ICON_PADDING);

		// create a box for the text
		this.text = new SUI.TextBox({
			left: this.ICON_SIZE + 2*this.TEXT_PADDING,
			right: this.TEXT_PADDING,
		 bottom: this.TEXT_PADDING,
			top: this.TEXT_PADDING,
			anchor: { right: true, left: true, top: true, bottom: true },
			text: arg.text || SUI.i18n.dlgConfirm
		});
		// and add it to the panel
		this.clientPanel.add(this.text);

		// set the window caption
		this.caption(arg.caption || SUI.i18n.dlgCaptConfirm);

		// add the icon
		this._createImage(SUI.imgDir+"/"+SUI.resource.mbQuestion);
	},

	/**
	 * Size (left/width) of the icon.
	 */
	ICON_SIZE: 32,

	/**
	 * Padding if the icon on the client area.
	 */
	ICON_PADDING: 4,

	/**
	 * Padding of the text on the client area.
	 */
	TEXT_PADDING: 10,

	/**
	 * Reference to the icon image of the message box.
	 */
	image: null,

	/**
	 * Show the dialog box centered on the screen.
	 */
	show: function() {
	 // show the window
	 SUI.dialog.Confirm.parentMethod(this, "show");
	 // set height to display currently overflow text
		this._calcHeight();
		// re-draw the window
		this.draw();
		// focus the ok button
		this.okButton.el().focus();
	},

	// Make the dialog larger (higher) in order to show all the text.
	_calcHeight: function() {
	 // add the scroll height of the text box to the dialog window height
		this.text.el().style.overflow = "hidden";
		// only make the dialog larger (keep a larger manual setting of the
		// height)
		if (this.text.el().scrollHeight > this.text.height()) {
		this.height(this.height() +
		 (this.text.el().scrollHeight - this.text.height()));
		}
		// and center the window
		this.center();
	},

	// Create an HTML img element and append that to the client area.
	_createImage: function(src) {
	 // create the image
	 this.image = SUI.browser.createElement("IMG");
	 this.image.style.top = this.ICON_PADDING+"px";
	 this.image.style.left = this.ICON_PADDING+"px";
		this.image.src = src;
		// add it to the client area
		this.clientPanel.clientBox().el().appendChild(this.image);
	}

});
