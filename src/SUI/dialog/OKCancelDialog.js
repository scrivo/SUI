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
 * $Id: OKCancelDialog.js 786 2013-08-09 13:26:51Z geert $
 */

"use strict";

SUI.dialog.OKCancelDialog = SUI.defineClass(
	/** @lends SUI.dialog.OKCancelDialog.prototype */{

	/** @ignore */ baseClass: SUI.Window,

	/**
	 * @class
	 * SUI.dialog.OKCancelDialog is an empty dialog box with an OK and cancel
	 * button. It can serve as a base for most of your standard dialogs. There
	 * is an optional third button that can be activated.
	 *
	 * @augments SUI.Window
	 *
	 * @description
	 * Create an OK/Cancel dialog.
	 *
	 * @constructs
	 * @param see base class
	 * @param {int} arg.clientWidth Client width of the dialog window
	 * @param {int} arg.clientHeight Client height of the dialog window
	 * @param {Function} arg.onOK Event handler for the ok button
	 * @param {Function} arg.onCancel Event handler for the cancel button
	 */
	initializer: function(arg) {

		// set the size to requested values else set it to the default values
		arg.height = arg.height || this.HEIGHT;
		arg.width = arg.width || this.WIDTH;

		// dialog windows are not resizable by default
		arg.resizable = arg.resizable || false;

		SUI.dialog.OKCancelDialog.initializeBase(this, arg);

		// create split layout to split the panel in a client section and
		// a button bar on the south side
		this.splitLayout = new SUI.SplitLayout({
			south: {
				height: this.BUTTON_BAR_HEIGHT
			}
		});

		// create the client panel for the dialog contents.
		this.clientPanel = new SUI.Panel({
			minHeight: 20,
			minWidth: 100,
			// give it some extra padding to make the dialog border look
			// biggger
			padding: new SUI.Padding(this.EXTRA_WINDOW_BORDER),
			innerBorder: new SUI.Border(this.PANEL_BORDER)
		});

		// create a container for the buttons
		this.buttonPanel = new SUI.AnchorLayout({});

		// create a cancel button in the bottom right corner
		this.cancelButton = new SUI.form.Button({
			top: this.EXTRA_WINDOW_BORDER,
			right: this.EXTRA_WINDOW_BORDER,
			width: 100,
			anchor: { right: true },
			title: SUI.i18n.cancel
		});

		// create an ok button left next to the cancel button
		this.okButton = new SUI.form.Button({
			top: this.EXTRA_WINDOW_BORDER,
			right: 112,
			width: 100,
			anchor: { right: true },
			title: SUI.i18n.ok
		});

		// create an extra button left next to the ok button
		this.extraButton = new SUI.form.Button({
			top: this.EXTRA_WINDOW_BORDER,
			right: 220,
			width: 100,
			anchor: { right: true },
			title: ""
		});
		// and hide it for now
		this.extraButton.el().style.display = "none";

		// add the split layout to the cient area
		this.add(this.splitLayout);

		// add the clientPanel and button panel to the split layout
		this.splitLayout.add(this.clientPanel, "center");
		this.splitLayout.add(this.buttonPanel, "south");

		// add the butts to the button panel
		this.buttonPanel.add(this.extraButton);
		this.buttonPanel.add(this.okButton);
		this.buttonPanel.add(this.cancelButton);

		// if the client width or height was given in the arguments, set it
		if (arg.clientWidth) {
		 this.setClientWidth(arg.clientWidth);
		}
		if (arg.clientHeight) {
		 this.setClientHeight(arg.clientHeight);
		}

		var that = this;

		// if the ok or cancel listeners were given in the arguments, set them
		if (arg.onOK) {
			this.addListener("onOK", arg.onOK);
		}
		if (arg.onCancel) {
			this.addListener("onCancel", arg.onCancel);
		}
		if (arg.onDataSaved) {
			this.addListener("onDataSaved", arg.onDataSaved);
		}

		// execute _handleOK on Enter key
		this.onEnter = function() {
			that._handleOK();
		};

		// attach _handleOK to the onclick even of the ok button
		SUI.browser.addEventListener(this.okButton.el(), "click",
		 function(e) {
				if (!that._handleOK()) {
					SUI.browser.noPropagation(e);
				}
			}
		);

		// execute _handleCancel on Esc key
		this.onEsc = function() {
			that._handleCancel();
		};

		// attach _handleCancel to the onclick even of the cancel button
		SUI.browser.addEventListener(this.cancelButton.el(), "click",
		 function(e) {
				if (!that._handleCancel()) {
					SUI.browser.noPropagation(e);
				}
			}
		);

		// execute the dialog's onCancel routine when the user clicks on
		// the close button
		this.addListener("onClose",
			function() {
				this.callListener("onCancel");
			}
		);

	},

	/**
	 * Add some extra space to the border
	 */
	EXTRA_WINDOW_BORDER: 4,

	/**
	 * Thin line of the panel border
	 */
	PANEL_BORDER: 1,

	/**
	 * The height of the button bar
	 */
	BUTTON_BAR_HEIGHT: 34,

	/**
	 * Default dialog height
	 */
	HEIGHT: 117,

	/**
	 * Default dialog width
	 */
	WIDTH: 340,

	/**
	 * Show an extra button on the button bar.
	 * @param {String} title The text on the button
	 * @param {Function} handler The function to execute on the onclick event
	 *    of the button
	 */
	addExtraButton: function(title, handler) {

	 // set the title and show the button
	 this.extraButton.el().innerHTML = title;
		this.extraButton.el().style.display = "block";

	 // add the function the to onclick event
		SUI.browser.addEventListener(this.extraButton.el(), "click",
			function(e) {
				if (!handler(new SUI.Event(this, e))) {
					SUI.browser.noPropagation(e);
				}
			}
		);
	},

	/**
	 * Function that is called by the dialog when the data needs to be
	 * harvested. Override this function with your own and the object
	 * that will be return is the argument for the onOK event listener.
	 * @return {Object} An object with form data.
	 */
	formToData: function() {
		this.close();
		return null;
	},

	/**
	 * onOK event handler: is executed when the user clicks on the OK button
	 * @param {Object} data The from data represented as an object
	 */
	onOK: function(data) {
	},

	/**
	 * onCancel event handler: is executed when the user clicks on the Cancel
	 * button
	 */
	onCancel: function() {
	},

	/**
	 * Set the client area width of the dialog window to the specified
	 * width. Normally you're not really interested in the outer size
	 * if the dialog window, but in the space where your are adding your
	 * boxes. This way you can conveniently size the dialog window to fit
	 * your contents.
	 * @param {int} w New client width of the dialog
	 */
	setClientWidth: function(w) {
	 // get the widths of the area outside of the client area ...
		var wb = this.clientAreaPosition();
		// ... add these, the extra padding and border to the requested width
		this.width(w + wb.left + wb.right
		 + 2 * (this.EXTRA_WINDOW_BORDER + this.PANEL_BORDER));
		this.center();
	},

	/**
	 * Set the client area height of the dialog window to the specified
	 * height. Normally you're not really interested in the outer size
	 * if the dialog window, but in the space where your are adding your
	 * boxes. This way you can conveniently size the dialog window to fit
	 * your contents.
	 * @param {int} h New client height of the dialog
	 */
	setClientHeight: function(h) {
	 // get the height of the area outside of the client area ...
		var wb = this.clientAreaPosition();
		// ... add these, the extra padding and border to the requested height
		this.height(h + wb.top + wb.bottom
			+ 2 * (this.EXTRA_WINDOW_BORDER + this.PANEL_BORDER)
		 + this.BUTTON_BAR_HEIGHT);
		this.center();
	},
	
	/**
	 * Close the dialog and notfiy the interface that data was saved.
	 */
	dataSaved: function() {
		this.callListener("onDataSaved");
		this.close();
	},

	/**
	 * Flag to prevent double actions on double clicking of the ok button
	 * @private
	 */
	_okClicked: false,

	/* Cancel was pressed: close the dialog and call the listener
	 */
	_handleCancel: function() {
		this.callListener("onCancel");
		this.close();
	},

	/* OK was pressed: save the data, close the dialog and call the listener
	 */
	_handleOK: function() {
		if (!this._okClicked && !this.okButton.el().disabled) {
			this._okClicked = true;
			var that = this;
			setTimeout(function() { that._okClicked = false; }, 2000);
			var val = this.formToData();
			this.callListener("onOK", val);
		}
	}

});
