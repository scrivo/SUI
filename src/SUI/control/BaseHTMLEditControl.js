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
 * $Id: BaseHTMLEditControl.js 786 2013-08-09 13:26:51Z geert $
 */

"use strict";

SUI.control.BaseHTMLEditControl = SUI.defineClass(
	/** @lends SUI.control.BaseHTMLEditControl.prototype */{

	/** @ignore */ baseClass: SUI.Box,

	/**
	 * @class
	 * SUI.control.BaseHTMLEditControl implements a WYSIWIG/HTML edit control. It
	 * should provide a standardized interface to the different implementations
	 * of contenteditable in various browsers. Because of code size of the
	 * class it is splitted in two parts: this is BaseHTMLEditControl and
	 * implements all of the technical structure, the other part
	 * HTMLEditControl only implements the actions that can be performed on
	 * the content.
	 *
	 * @augments SUI.Box
	 *
	 * @description
	 * SUI.control.BaseHTMLEditControl constructor. This base class was created
	 * to limit code size. You don't need this constructor HTMLEditControl is
	 * the one you need.
	 *
	 * @constructs
	 * 
	 * @param {inherit} arg
	 * @param {boolean} arg.ieStrictMode Whether strict mode should be used
	 *     in IE
	 * @param {Function} arg.onCommandExecuted event handler, see
	 *     onCommandExecuted()
	 * @param {Function} arg.onContextMenu event handler, see onContextMenu()
	 * @param {Function} arg.onFocus event handler, see onFocus()
	 * @param {Function} arg.onKeyDown event handler, see onKeyDown()
	 * @param {Function} arg.onLoad event handler, see onLoad()
	 * @param {Function} arg.onSelectionChange event handler, see
	 *         onSelectionChange()
	 *         
	 * @protected
	 */
	initializer: function(arg) {

		SUI.control.BaseHTMLEditControl.initializeBase(this, arg);
		var that = this;

		// if the editor document is in strict mode, default true
		if (arg.ieStrictMode !== undefined) {
			this._ieStrictMode = arg.ieStrictMode;
		}

		// Set the event handlers
		if (arg.onLoad) {
			this.addListener("onLoad", arg.onLoad);
		}
		if (arg.onCommandExecuted) {
			this.addListener("onCommandExecuted", arg.onCommandExecuted);
		}
		if (arg.onContextMenu) {
			this.addListener("onContextMenu", arg.onContextMenu);
		}
		if (arg.onFocus) {
			this.addListener("onFocus", arg.onFocus);
		}
		if (arg.onKeyDown) {
			this.addListener("onKeyDown", arg.onKeyDown);
		}
		if (arg.onSelectionChange) {
			this.addListener("onSelectionChange", arg.onSelectionChange);
		}

		// Create the iframe for the contenteditable
		this.iframe = SUI.browser.createElement("IFRAME");
		this.iframe.frameBorder = 0;
		//frameborder="0"

		// Set the onload handler on which we further initialize the
		// contenteditable
		SUI.browser.addEventListener(this.iframe, "load", function(e) {
			if (!that._onLoadIframe(new SUI.Event(this, e))) {
				SUI.browser.noPropagation(e);
			}
		});
		if (SUI.browser.isIE) {
			SUI.browser.addEventListener(this.iframe, "blur", function(e) {
				that.bmk = that.tmpBmk;
			});
		}

		// Add a SUI style class
		SUI.style.addClass(this.iframe, "sui-scrivo-he");

		// Set the initial content for the iframe: strict, UTF-8 and base
		var doctype =
			"<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.1 Strict//EN\">\n";
		// Don't use strict doctype in IE if requested
		if (SUI.browser.isIE && ! this._ieStrictMode) {
			doctype = "";
		}
		// Apparently IE 8 does not support setting the charset through the
		// meta tag when using https (navigation cancelled). Do this later.
		var charset = "<meta http-equiv=\"content-type\""
			+ " content=\"text/html; charset=UTF-8\">";
		if (SUI.browser.isIE && SUI.browser.version < 9) {
			charset = "";
		}
		this.iframe.src = "javascript: '" + doctype
			+ "<html>"
			+ "<head>" + charset
			+ "<base href=\""+SCRIVO_BASE_DIR+"/\">"
			+ "</head>"
			+ "<body spellcheck=\"false\">"
			+ "</body>"
			+ "</html>'";

		// And append the iframe to our SUI.Box container
		this.el().appendChild(this.iframe);

		// Initialize the object that manages the paste actions
		this._pasteData = new SUI.control.PasteData({ editor: this });
	},

	/**
	 * Set the focus to the editable region.
	 */
	focus: function() {
		if (this._canFocus && !this._pasteData._intercepting) {
			if (SUI.browser.isIE) {
				if (this._focussedElement) {
					this._focussedElement.focus();
				} else {
					this._editDoc.body.focus();
				}
				if (!this.focussed && this.bmk) {
					this.focussed = true;
					this._ieRestoreBookmark(this.bmk);
					this.bmk = null;
				}
			} else {
				this._editDoc.body.focus();
			}
		}
	},

	/**
	 * Get the block format at the current cursor position.
	 * @return {String} tag name of the block where the cursor is located
	 */
	getCurrentBlockFormat: function() {
		var bFmt = this._editDoc.queryCommandValue("FormatBlock");
		var fmt = this._blockFormats[bFmt];
		return (fmt === undefined) ? "" : fmt;
	},

	/**
	 * Get a reference to the document object of the page in the editor
	 * @return {HTMLElementNode} document element of the page being edited
	 */
	getDocument: function() {
		return this._editDoc;
	},

	/**
	 * Get the element that's currently selected in the editor
	 * @return {HTMLElementNode} the element node currently selected in the
	 *      editor
	 */
	getSelectedElement: function() {
		return this._getParentElementSelection(this._getSelection());
	},

	/**
	 * Get HTML content for the edit control.
	 * Throws {ReferenceError} if the editor was not fully loaded yet
	 * @return {String} HTML data fragment from editor (no a top container)
	 */
	getValue: function() {

		if (!this._editDoc) {
			throw new ReferenceError(
				"getValue failed because the editor was not fully loaded yet");
		}

		for (var i=0; i<this._editableElements.length; i++) {
			this._editableElements[i].contentEditable = false;
		}
		var data = this._editDoc.body.innerHTML;
		for (var i=0; i<this._editableElements.length; i++) {
			this._editableElements[i].contentEditable = true;
		}

		return data;
	},

	/**
	 * Is the editor document in strict mode. This value can only be false in
	 * IE, it returns always true (and also not affects) other browsers.
	 * @return {boolean} Whether the editor document is in strict mode.
	 */
	ieStrictMode: function() {
		return this._ieStrictMode;
	},

	/**
	 * Tell the HTML edit control which block formats you want to use
	 * @param {string[]} blockFormats array in which each element has a value
	 *      key containing a block tag (P, H1 ... H6)
	 */
	initBlockFormats: function(blockFormats) {

		// if already initialized
		if (this._blockFormats) {
			return;
		}

		this._blockFormats = {};

		if (SUI.browser.isIE) {

			// Find the block format names. IE returns internationalized
			// results on the queryCommandValue("FormatBlock") command
			// ('Kop 1' instead of 'Header 1' for example), so we need
			// these to map them back to HTML tags. Other browsers seem
			// to return just the tag name.

			this._blockFormats[""] = "";

			// create an offscreen tmp div
			var tmp = SUI.browser.createElement();
			tmp.unselectable = false;
			SUI.style.setRect(tmp, 10, -110, 100, 100);
			tmp.contentEditable= true;
			document.body.appendChild(tmp);

			// for all given block elements ...
			for (var i=1; i<blockFormats.length; i++) {
				// ... try to make a block element of that type ...
				try {
					var el = document.createElement(blockFormats[i].value);
					el.innerHTML = "dummy";
				} catch (e) { continue; }
				// ... add it to our tmp div ...
				tmp.appendChild(el);
				// ... and focus an select the block element, ...
				try {
					tmp.focus();
				} catch(e) {}
				document.execCommand("SelectAll", false, null);
				// ... now get the internationalized name and use that as key
				// in _blockFormats
				var bFmt = document.queryCommandValue("FormatBlock");
				this._blockFormats[bFmt] = blockFormats[i].value;
				// remove the dummy node
				tmp.removeChild(tmp.firstChild);
			}

			// we're done with the div
			document.body.removeChild(tmp);

		} else {

			// in other browsers we can use the tag name
			for (var i=1; i<blockFormats.length; i++) {
				this._blockFormats[blockFormats[i].value.toLowerCase()] =
					blockFormats[i].value;
			}

		}
	},

	/**
	 * SUI framework layOut method
	 */
	layOut: function() {

		// Size the host of the iframe (a SUI.Box)
		SUI.control.BaseHTMLEditControl.parentMethod(this, "layOut");

		// and size the contained iframe to the size of this box
		SUI.style.setRect(
			this.iframe, 0, 0, this.width(), this.height());

	},

	/**
	 * Fires after an editor command is executed (and content is changed), an
	 * important trigger for updating your user interface.
	 */
	onCommandExecuted: function() {
	},

	/**
	 * Fires when the user selects the wrong mouse button
	 * @param {int} x x-offset (downwards) of the mouse click
	 * @param {int} y y-offset of the mouse click
	 */
	onContextMenu: function(x, y) {
	},

	/**
	 * Fires when the document body in the editor window (iframe) receives
	 * the focus.
	 * @param {SUI.Event} evnt focus event
	 */
	onFocus: function(evnt) {
	},

	/**
	 * Fires when the user presses (the) any key
	 * @param {SUI.Event} evnt keydown event
	 */
	onKeyDown: function(evnt) {
	},

	/**
	 * Fires after the content is set into the editor with setValue
	 */
	onLoad: function() {
	},

	/**
	 * Fires when the user selects (moves it cursor) to an other element
	 * in the DOM tree, an important trigger for updating your user interface.
	 */
	onSelectionChange: function() {
	},

	/**
	 * Get or set the paste method to use wehn pasting.
	 * @param {string} [p] The desired method for pasting text: 'text',
	 *    'filtered' or 'html' (or none to use this method as a getter).
	 * @return {string} The current paste method setting (or null if this
	 *    method was used as a setter).
	 */
	pasteMethod: function(p) {
		return this._pasteData.pasteMethod(p);
	},

	/**
	 * Clear the contents of the control
	 */
	resetIframe: function() {
		// older FireFoxes need this very hard reset to empty the
		// contenteditable (and to keep working). Editor cursor is still
		// visible but editing is not possible. It is likely that this patch
		// is not necessary. As reported , bug 504268 occurs when
		// contenteditable elements are hidden and redisplayed. At this moment
		// the contenteditable elements are always rebuild and not reused.
		if (SUI.browser.isGekco) {
			this._editDoc = null;
			this.el().removeChild(this.iframe);
			this.el().appendChild(this.iframe);
		} else {
			if (this._editDoc) {
				this._editDoc.body.innerHTML = "";
			}
		}
	},

	/**
	 * Force an onload event to happen to (Gecko refuses to do an onload if
	 * the iframe in initially hidden, so you can use this)
	 */
	geckoForceOnloadEvent: function() {
		if (!this._loaded && SUI.browser.isGecko) {
			// Correct way:
			//   var onload = this._editDoc.createEvent("HTMLEvents");
			//   onload.initEvent("load", true, true);
			//   this.iframe.dispatchEvent(onload);
			// forces an event, but still the error occurs. A very blunt
			// approach seems to do the trick well.
			this.el().removeChild(this.iframe);
			this.el().appendChild(this.iframe);
		}
	},

	/**
	 * Supply CSS data for the edit control. The current CSS style code and 
	 * linked stylesheets are removed. First the external style sheets are 
	 * linked in the order they are provided, then the CSS code is appended.
	 * @param {String} styleDef CSS code
	 * @param {String} classNameBody A CSS class name for the document body.
	 * @param {string[]} styleSheets array of CSS stylesheet links
	 */
	setCSS: function(styleDef, classNameBody, styleSheets) {

		if (!this._editDoc) {

			// If the contenteditable iframe is not fully loaded store
			// arguments for later use
			this._tmpStoreStyleSheet = [];
			for (var i=0; i<arguments.length; i++) {
				this._tmpStoreStyleSheet.push(arguments[i]); 
			}
			for (; i<3; i++) {
				this._tmpStoreStyleSheet.push(null); 
			}

		} else {
			
			classNameBody = classNameBody || ""; 
			if (classNameBody != "") {
				// Set class attribute of editable body
				SUI.style.addClass(this._editDoc.body, classNameBody);
			}

			var head = this._editDoc.getElementsByTagName("head")[0];

			// Remove the old style sheets ...
			var l = head.getElementsByTagName("LINK");
			for (var i=0; i<l.length; i++) {
				head.removeChild(l[i]);
			}
			// ... and append the new ones
			if (styleSheets) {
				for (i=0; i<styleSheets.length; i++) {
					var l = this._editDoc.createElement("LINK");
					l.type = "text/css";
					l.rel = "stylesheet";
					l.href = styleSheets[i];
					head.appendChild(l);
				}
			}

			var id_scrivo_styles = "scrivo_styles";

			// If we've written CSS code earlier, remove it
			var st = this._editDoc.getElementById(id_scrivo_styles);
			if (st) {
				head.removeChild(st);
			}

			// Now create the CSS code (add scrivo system styles last) ...
			var cssText = (styleDef ? styleDef : "") + "\n"
				+ this._createSystemCSS();

			// ... create a style sheet ...
			var st = this._editDoc.createElement("STYLE");
			st.type = "text/css";
			st.id = id_scrivo_styles;
			if (SUI.browser.isIE) {
				st.styleSheet.cssText = cssText;
			} else { // w3c
				st.appendChild(this._editDoc.createTextNode(cssText));
			}

			// ... and add it to the editable document
			head.appendChild(st);
		}
	},

	/**
	 * TODO
	 * @param {int[]} ids The editable ids
	 */
	setEditableElementIds: function(ids) {
		this._editableElementIds = ids;
	},

	/**
	 * Set HTML content for the edit control. Calls the onload handler when
	 * the data is fully loaded.
	 * @param {String} val HTML data fragment (no need for a top container)
	 */
	setValue: function(val) {

		if (!this._editDoc) {

			// If the contenteditable iframe is not fully loaded store
			// arguments for later use
			this._tmpStore = val;

		} else {

			// Setting the contenteditable to false before assigning a value
			// prevents the action to be pushed onto the undo stack (as
			// seen on IE8)
			this._setContentEditable(false);
			this._editDoc.body.innerHTML = val;
			this._setContentEditable(true);

			// This patch was needed for FF 3.6: After loading the content
			// editor seemed partially locked: all delete functionality
			// like delete, backspace, execCommand('delete') but also
			// execCommand('insertHTML') did not work. In the later case the
			// content was inserted, but the current selection was not
			// deleted). Inserting content by for instance typing but also
			// after pasting HTML, corrected the situation.
			if (SUI.browser.isGecko) {
				this._initGecko();
			}

			// images are not very well selectable in WebKit, so fix that
			this._webKitImgFix();
			// now we're ready loading the content: call clients onload
			this.callListener("onLoad");

		}
	},

	// Holds a list of block formats with keys as
	// queryCommandValue("FormatBlock") returns
	_blockFormats: null,

	// Gecko has some layouting problems after using focus en execCommand in
	// init fase
	_canFocus: true,

	// an array with the id's of the editable elements (none defined -> the
	// document body will be editable.
	_editableElementIds: [],

	// an array containt references to the editable elements.
	_editableElements: [],

	// reference to the contenteditable iframe's document
	_editDoc: null,

	// reference to the contenteditable iframe's window
	_editWin: null,
	
	// the element that is focussed to set the focus back (IE when using 
	// multiple editable regions).
	_focussedElement: null,

	// queryCommandEnabled("paste") trigger onbeforepaste event what we want
	// to prevent
	_ieDoBeforePaste: true,

	// display documents in scrict mode in IE (always true for other browsers),
	// you'll encounter several problems if you do so: cursor problems when
	// navigating with error keys, collapsing document element and possibly
	// more
	_ieStrictMode: true,

	// We need to save some parameters to detect onselectionchange
	_lastSel: {
		cllps: null, //< trigger value, normally true/false
		elem: null,
		cnt: 0 //< problems with -> after bold
	},

	// To check if the onload has happend (FF has this bug with initially
	// hidden content divs)
	_loaded: false,

	// Utility object that helps us to intercept to user's paste actions
	// in order to clean the data before it is inserted in the content
	_pasteData: null,

	// location of scrivo library
	_scrivoDir: "scrivo",

	// Temporary storage for content while waiting for onload to finish
	_tmpStore: null,

	// Temporary storage for css data while while waiting for onload to finish
	_tmpStoreStyleSheet: null,

	// binary or: canUndo = 1, canRedo = 2
	_undoState: 0,

	/**
	 * Construct the system stylesheet. The system stylesheet gives the user
	 * visual feedback of 'invisible' things in the browser, like language
	 * marks, anchors, misspelled words etc.
	 */
	_createSystemCSS: function() {
		return (
			".sys_language {\n"
			+ "  border: solid gray 1px;\n"
			+ "  background-color: #FFFFEE;\n"
			+ "  padding-left: 18px;\n"
			+ "  padding-right: 2px;\n"
			+ "  background-image: url(\""
			/* + this._scrivoDir + "/sui/" */ + SUI.imgDir + "/"
			+ SUI.resource.ecLang + "\");\n"
			+ "  background-repeat: no-repeat;\n"
			+ "}\n"
			+ ".sys_abbr {\n"
			+ "  border: solid gray 1px;\n"
			+ "  background-color: #FFFFEE;\n"
			+ "  padding-left: 18px;\n"
			+ "  padding-right: 2px;\n"
			+ "  background-image: url(\""
			/* + this._scrivoDir + "/sui/" */ + SUI.imgDir + "/"
			+ SUI.resource.ecAbbr + "\");\n"
			+ "  background-repeat: no-repeat;\n"
			+ "}\n"
			+ ".sys_anchor {\n"
			+ "  border: solid gray 1px;\n"
			+ "  background-color: #FFFFEE;\n"
			+ "  padding-left: 18px;\n"
			+ "  padding-right: 2px;\n"
			+ "  background-image: url(\""
			/* + this._scrivoDir + "/sui/" */ + SUI.imgDir + "/"
			+ SUI.resource.ecAnchor+ "\");\n"
			+ "  background-repeat: no-repeat;\n"
			+ "}\n"
			+ "table tr .sys_table_head {\n"
			+ "  background-color: #DD0000;\n"
			+ "  color: #FFFF00;\n"
			+ "}\n"
			+ "table tr .sys_table_axis {\n"
			+ "  background-color: #00CC00;\n"
			+ "  color: #FFFF00;\n"
			+ "}\n"
			+ "table tr .sys_show_cell {\n"
			+ "  border-bottom: dashed #C0C0C0 1px;\n"
			+ "  border-right: dashed #C0C0C0 1px;\n"
			+ "}\n"
			+ ".sys_spell {"
			+ "  border-bottom: solid #D00000 2px;\n"
			+ "}\n"
			+ ".sys_spell_suggestions {\n"
			+ "  border-bottom: dashed #D00000 2px;\n"
			+ "}\n"
			+ ".sys_spell_compoundword {\n"
			+ "  border-bottom: dashed #00D000 2px;\n"
			+ "}\n");
	},

	/**
	 * Excecute standard contenteditable commands
	 */
	_execCommand: function(id, opt){

		// first set the focus back, it is likely that we lost it
		this.focus();

		if (SUI.browser.isIE) {
			// IE: if there is a selection run execCommand of the
			// selection else run execCommand of the document
			var sel = this._editDoc.selection.createRange();
			if (this._editDoc.selection.type == "None") {
				this._editDoc.execCommand(id, false, opt);
			} else {
				sel.execCommand(id, false, opt);
			}
		} else {
			this._editDoc.execCommand(id, false, opt);
		}
	},


	/**
	 * execCommand fontsize is not supported very well. Therefore we use
	 * fontname instead. Non IE browsers will insert a span and we search
	 * for these spans and set to font size with the value set in the
	 * font family field.
	 */
	_spanFix: function () {

		// Get all the font tags ...
		var l = this._editDoc.getElementsByTagName("SPAN");

		// ... and work your way downwards (upwards in the document)
		for (var i=l.length-1; i>=0; i--) {

			// Try to get the face attribute
			var fce = l[i].style.fontFamily;

			if (fce) {
				// Yes: first check the first two characters of the value
				// (allow for a quote)
				var of = (fce.charAt(0)=="'" || fce.charAt(0)=='"') ? 1 : 0;
				if (fce.substr(of, 2) == "s_") {
					l[i].style.fontSize =
						fce.replace("s_", "").replace("P", "%");
					l[i].style.fontFamily = "";
				}

			}
		}
	},

	/**
	 * The IE editor inserts font tags in the content. And since we like spans
	 * better we replace then. Note that we cripple the face attribute
	 * (f_Roman and s_100%). So we correct that too.
	 */
	_fontFix: function () {

		// Get all the font tags ...
		var l = this._editDoc.getElementsByTagName("FONT");

		// ... and work your way downwards (upwards in the document)
		for (var i=l.length-1; i>=0; i--) {

			// Try to get the face attribute
			var fce = l[i].getAttribute("face");

			if (fce) {

				// Yes: replace font or size with a span, first check the
				// first two characters of the value (allow for a quote)
				var of = (fce.charAt(0)=="'" || fce.charAt(0)=='"') ? 1 : 0;
				switch (fce.substr(of, 2)) {
					case "f_":
						var sp = this._editDoc.createElement("SPAN");
						sp.innerHTML = l[i].innerHTML;
						sp.style.fontFamily = fce.replace("f_", "");
						this._replaceNode(l[i], sp);
					break;
					case "s_":
						var sp = this._editDoc.createElement("SPAN");
						sp.innerHTML = l[i].innerHTML;
						sp.style.fontSize =
							fce.replace("s_", "").replace("P", "%");
						this._replaceNode(l[i], sp);
					break;
				}

			} else {

				// No: try to get the color attribute
				var fce = l[i].getAttribute("color");

				if (fce) {
					// replace with a colored span
					var sp = this._editDoc.createElement("SPAN");
					sp.innerHTML = l[i].innerHTML;
					sp.style.color = fce;
					this._replaceNode(l[i], sp);
				}

			}
		}
	},

	/**
	 * Get the current range object from the current selection in the editor
	 * (param sel is null) or a given selection.
	 */
	_getCurrentRange: function(sel) {
		if (!sel) {
			sel = this._getSelection();
		}
		if (sel) {
			if (SUI.browser.isIE) { // IE
				return sel.createRange();
			}
			if(sel.rangeCount && sel.getRangeAt) { // W3C
				return sel.getRangeAt(0);
			}
		}
		return null;
	},

	/**
	 * Get the parent element node (no text node) of a given selection.
	 * @param sel A selection
	 */
	_getParentElementSelection: function (sel) {

		// In IE when there's no selection in the editor the document needs
		// to have the focus to determine the parentElement.
		if (SUI.browser.isIE && sel.type=="None") {
			this.focus();
		}

		var r = this._getCurrentRange(sel);
		if (r) {
			if (SUI.browser.isIE) {
				if (sel.type=="Control") {
					return SUI.browser.version < 9
						? r.commonParentElement() : r.item(0);
				}
				return r.parentElement();
			} else {
				var n = r.commonAncestorContainer;
				while(n.nodeType != 1 && n.nodeType != 9){
					n = n.parentNode;
				}
				return n;
			}
		}
		return null;
	},

	/**
	 * Get the current selection in the editor
	 */
	_getSelection: function() {
		return this._editDoc.selection
			? this._editDoc.selection // IE
			: this._editWin.getSelection(); // W3C
	},

	/**
	 * In IE's case we don't want to get the event from the window object
	 * but the iframe's window object instead
	 */
	_ieEvent: function(e) {
		return SUI.browser.isIE && SUI.browser.version < 9
			? this._editWin.event : e;
	},

	/**
	 * Finding text in IE using their range object
	 */
	_ieFind: function(what, caseSensitive, backward, wholeWord) {

		// build the find flag value
		var flg = 0;
		if (backward) {
			flg += 1;
		}
		if (wholeWord) {
			flg += 2;
		}
		if (caseSensitive) {
			flg += 4;
		}

		// get a range object for searching
		var rng = this._editDoc.selection.createRange();
		// collapse in the search direction
		rng.collapse(backward);
		// and search the text
		var strFound = rng.findText(what, 10000000, flg);

		// select the text when found
		if (strFound) {
			rng.select();
		}

		return strFound;
	},

	_ieRestoreBookmark: function(bmk) {
		// ... and restore the selection
		var rng = null;
		if (bmk) {
			if (bmk.type === "Range") {
				rng = bmk.value;
			} else if (bmk.type === "Bookmark") {
				// Use IEs bookmark facility to restore the selection
				rng = this._editDoc.body.createTextRange();
				rng.moveToBookmark(bmk.value);
			} else {
				// Get the control range ...
				rng = this._editDoc.body.createControlRange();
				// ... and clear it ...
				while (rng.length) {
					rng.remove(0);
		}
				// ... add the stored value to the range and select it
				rng.add(bmk.value);
			}
		}
		if (rng) {
				rng.select();
			}
		return rng;
	},

	_ieSaveBookmark: function(useBookmark) {
		var bmk = null;
		var range = this._editDoc.selection.createRange();
		if (this._editDoc.selection.type === "Control") {
			// An element was selected
			bmk = { type: "Control", value: range.item(0) };
		} else {
			if (useBookmark) {
				// Use IEs bookmark facility to store the selection
				if (range.getBookmark) {
					bmk = { type: "Bookmark", value: range.getBookmark() };
				}
			} else {
				bmk = { type: "Range", value: range };
			}
		}
		return bmk;
	},

	/**
	 * Gecko specific initialization for the contenteditable iframe
	 */
	_initGecko: function() {

		// prevent Gecko layOut problems
		this._canFocus = false;

		this._execCommand("enableInlineTableEditing", false);
		this._execCommand("enableObjectResizing", false);
		this._execCommand("insertbronreturn", false);
		this._execCommand("styleWithCSS", false);

		this._canFocus = true;

		// remove '_moz_editor_bogus_node' br from editor content ...
		if (this._editDoc.body.firstChild
				&& this._editDoc.body.firstChild.nodeType == 1) {
			// ... however this seems not really necessary in our case (due
			// to the method of providing initial document?)
			if (this._editDoc.body.firstChild.getAttribute(
					"_moz_editor_bogus_node")) {
				this._editDoc.body.removeChild(this._editDoc.body.firstChild);
				if (this._editDoc.body.innerHTMLlength <= 1) {
					this._editDoc.body.innerHTML = "<p>&nbsp;</p>";
				}
			}
		}
	},

	/**
	 * IE specific initialization for the contenteditable iframe
	 */
	_initIE: function() {

		var that = this;

		// We only want execute _onSelectionChangeIE if the control is focussed
		this.focussed = null;

		if (SUI.browser.version < 9) {
			// IE onselectionchange, fired when we're selecting other DOM nodes in
			// the editor. Really usefull for enabling editor buttons for instance.
			// We're trying to mimic this behavior also on other browsers.
			SUI.browser.addEventListener(this._editDoc, "selectionchange",
				function(e) {
					if (that.focussed) {
						var e = that._ieEvent(e);
						if (!that._onSelectionChangeIE(
								new SUI.Event(this, e))) {
							SUI.browser.noPropagation(e);
						}
					}
				}
			);
		}

		// IE loses its editor selection if another element in the interface
		// is selected. So we need to save and restore the selection when we
		// lose the selection and restore it later. The blur and focus events
		// are the obvious events to use, but that did not work out well. the
		// IE specific events onbeforedeactivate and beforeactivate events
		// seem to do the job well.

		// Place to store the IE bookmark
		this.bmk = null;
		this.tmpBmk = null;

		// Store the current selection
		SUI.browser.addEventListener(this._editDoc.body, "beforedeactivate",
			function(e) {
				var e = that._ieEvent(e);
				if (!e.toElement) {
					// If there is no toElement we're moving out of this
					// document's body (i.e. to the userinterface). Now we
					// can set the focussed flag to false so that
					// our onselectionchange will not be triggered.
					// Note IE 9 uses the onselectionchange handling of real
					// browsers.
					if (SUI.browser.version < 9) {
						that.focussed = false;
					}
					// We want to save the bookmark when we're moving the 
					// focus out of the body, but after IE 9 the toElement 
					// was broken. Now we store it and let iframe.onblur take
					// it over.
					that.tmpBmk = that._ieSaveBookmark();
				}
			}
		);

		// Restore the current selection
		SUI.browser.addEventListener(this._editDoc.body, "beforeactivate",
			function() {
				that.focussed = true;
				that._ieRestoreBookmark(that.bmk);
					that.bmk = null;
				}
		);

		if (!this._editDoc.body.innerHTML) {
			this._editDoc.body.innerHTML = "<p></p>";
		}
	},

	/**
	 * WebKit specific initialization for the contenteditable iframe
	 */
	_initWebKit: function() {

		if (!this._editDoc.body.innerHTML) {
			this.setValue("<p><br></p>");
		}
	},

	/**
	 * Call host's onContexMenu and prevent the default context menu
	 */
	_onContextMenu: function(e) {
		this.callListener("onContextMenu",
			SUI.browser.getX(e.event), SUI.browser.getY(e.event));
		if (SUI.browser.isIE) {
			e.event.returnValue = false;
		} else {
			e.event.preventDefault();
		}
	},

	/**
	 * Call the onfocus listener
	 */
	_onFocus: function(e) {
		if (SUI.browser.isIE) {
			this._editDoc.selection.createRange().select();
		}
		this.callListener("onFocus", e);
	},

	/**
	 * Call host's onKeyDown
	 */
	_onKeyDown: function(e) {

		// TODO check paste

		// Patch webkit's behaviour for shift-enter (actually a Safari issue)
		if (SUI.browser.isWebKit && e.event.keyCode == 13 && e.event.shiftKey) {
			this._execCommand("insertLineBreak");
			e.event.preventDefault();
		}
		if (!SUI.browser.isIE && e.event.ctrlKey && e.event.keyCode === 86) {
			this._pasteData.interceptPaste();
		}
		this.callListener("onKeyDown", e);
		// IE 8 has it wrong when a control (f.i. image) selection in a
		// contenteditable region was made and the backspace key was pressed:
		// it does 'browser back' instead of deleting the control.
		if (SUI.browser.isIE && e.event.keyCode == 8) {
			// if a control was selected ..
			if (this._editDoc.selection.type === "Control") {
				// ... delete it and prevent IE's default action
				this._execCommand("delete");
				e.event.returnValue = false;
			}
		}
	},

	/**
	 * Some stuff going on onKeyUp. Here we can fix some stuff that WebKit
	 * does wrong, and finish a past action. It also triggers
	 * _onSelectionChange in certain cases.
	 */
	_onKeyUp: function(e) {

		// Replace div to p if WebKit inserts a div on enter
		if (SUI.browser.isWebKit && e.event.keyCode == 13) {
			this._webKitNoDivOnEnterFix();
		}

		// TODO check paste
		// If we were currently pasting finish that action
		//        this._pasteData.finishPaste();

		var x = (this._editDoc.queryCommandEnabled("Undo") ? 1 : 0)
			+ (this._editDoc.queryCommandEnabled("Redo") ? 2 : 0);
		if (this._undoState !== x) {
			this._undoState = x;
			this.callListener("onCommandExecuted");
		}

		// If some sort of control key was pressed do a _onSelectionChange
		if (e.event.ctrlKey == true || e.event.keyCode < 48
				|| e.event.keyCode > 90) {
			this._onSelectionChange(e);
		}
	},

	/**
	 * This onload handler is called when the initial generated empty
	 * document was inserted into the iframe. On this onload handler we
	 * further complete the initialization process and do some more
	 * interesting things like setting the contenteditable state,
	 * event handlers, set (if any) content, etc.
	 */
	_onLoadIframe: function() {

		var that = this;

		// reference to the iframe's window
		this._editWin = this.iframe.contentWindow;

		// reference to the docment element in the iframe, this is important:
		// it is referenced all over the place
		this._editDoc =
			(this.iframe.contentWindow || this.iframe.contentDocument);
		if (this._editDoc.document) {
			this._editDoc = this._editDoc.document;
		}

		// Set charset here for IE 8 and less (see construction of iframe).
		if (SUI.browser.isIE && SUI.browser.version < 9) {
			this._editDoc.charset = "UTF-8";
		}
		
		// Yes: we can go editing
		this._setContentEditable(true);

		// Browser specific initialization
		if (SUI.browser.isGecko) {
			this._initGecko();
		} else if (SUI.browser.isWebKit) {
			this._initWebKit();
		} else if (SUI.browser.isIE) {
			this._initIE();
		} else if (!this._editDoc.body.innerHTML) {
			this._editDoc.body.innerHTML = "<p>&nbsp;</p>";
		}

		// onMouseUp event of the editable document
		SUI.browser.addEventListener(this._editDoc, "mouseup", function(e) {
			e = that._ieEvent(e);
			if (!that._onMouseUp(new SUI.Event(this, e))) {
				SUI.browser.noPropagation(e);
			}
		});

		// onFocus event of the editable document
		SUI.browser.addEventListener(this._editWin, "focus", function(e) {
			e = that._ieEvent(e);
			if (!that._onFocus(new SUI.Event(this, e))) {
				SUI.browser.noPropagation(e);
			}
		});

		// onKeyDown event of the editable document
		SUI.browser.addEventListener(this._editDoc, "keydown", function(e) {
			e = that._ieEvent(e);
			if (!that._onKeyDown(new SUI.Event(this, e))) {
				SUI.browser.noPropagation(e);
			}
		});

		// onKeyUp event of the editable document
		SUI.browser.addEventListener(this._editDoc, "keyup", function(e) {
			e = that._ieEvent(e);
			if (!that._onKeyUp(new SUI.Event(this, e))) {
				SUI.browser.noPropagation(e);
			}
		});

		// onContextMenu event of the editable document
		SUI.browser.addEventListener(
				this._editDoc, "contextmenu", function(e) {
			e = that._ieEvent(e);
			if (!that._onContextMenu(new SUI.Event(this, e))) {
				SUI.browser.noPropagation(e);
			}
		});

		// onPaste event of the editable body
		/* _onPaste: two different strategies here. IE lets you access the
		 * clipboard so it is easy to get the data and do your own processing.
		 * Other browser are not that convenient, here we intercept the paste
		 * action by pasting into a hidden div. At a later moment the contents
		 * of that div is read and inserted into the editor (finishPaste)
		 */
		if (SUI.browser.isIE) {
			SUI.browser.addEventListener(
				this._editDoc.body, "beforepaste",
				function(e) {
					e = that._ieEvent(e);
					if (that._ieDoBeforePaste) {
						if (!that._pasteData.interceptPaste()) {
							SUI.browser.noPropagation(e);
						}
					}
				}
			);
		} else if (SUI.browser.isWebKit) {
			// TODO check paste
			SUI.browser.addEventListener(this._editDoc.body, "paste",
				function(e) {
					if (that._pasteData._div) {
						e = that._ieEvent(e);
						// check if the clipboard has HTML data
						if (e.clipboardData.items.length > 0) {
							var hasHtml = false;
							for (var i=0; i<e.clipboardData.types.length; i++) {
								if (e.clipboardData.types[i] === "text/html") {
									hasHtml = true;
								}
							}
							that._pasteData._div.innerHTML =
								e.clipboardData.getData(
									hasHtml?"text/html":"text/plain");
						}
						SUI.browser.noPropagation(e);
						e.preventDefault();
						that._pasteData.finishPaste();
					}
				}
			);
		}

		// Now the contenteditable is loaded an with everything in place we now
		// can load the stylesheets ...
		if (this._tmpStoreStyleSheet) {
			this.setCSS(
				this._tmpStoreStyleSheet[0], this._tmpStoreStyleSheet[1],
				this._tmpStoreStyleSheet[2]);
		}
		// ... and content into the control
		if (this._tmpStore) {
			this.setValue(this._tmpStore);
		} else {
			this.callListener("onLoad");
		}

		this._loaded = true;
	},

	/**
	 * On mouse-up: good chance that we've changed the selection
	 */
	_onMouseUp: function(e) {
		this._onSelectionChange(e);
	},

	/**
	 * Try of we can detect if the cursor or selection moved to another
	 * node in the DOM tree
	 */
	_onSelectionChange: function(e) {

		if (SUI.browser.isIE && SUI.browser.version < 9) {
			// IE has its own onselectionchange
			return;
		} else {

			var sel = this._getSelection();
			var elem = this._getParentElementSelection(sel);

			if (this._lastSel.cllps !== null
					&&  sel.isCollapsed == this._lastSel.cllps) {

				// if not first iteration (!== null) and collapsed state
				// is not changed then check if current node selection is
				// changed or if we're in the next iteration
				if (this._lastSel.cnt == 1 || elem != this._lastSel.elem) {

					if (elem != this._lastSel.elem) {
						this._lastSel.cnt = 0;
					}
					this._lastSel.elem = elem;
					this.callListener("onSelectionChange");

				}
				this._lastSel.cnt++;

			} else {

				// Collapsed state changed or first iteration
				this._lastSel.cnt = 0;
				this._lastSel.elem = elem;
				this.callListener("onSelectionChange");

			}

			this._lastSel.cllps = sel.isCollapsed;
		}
	},

	/**
	 * Don't try of we can detect if the cursor or selection moved to another
	 * node in the DOM tree: IE does it for us. This is now only for IE 8 and
	 * below.
	 */
	_onSelectionChangeIE: function(e) {
		this.callListener("onSelectionChange");
	},

	/**
	 * A browser independent implementation of outerHTML
	 */
	_outerHTML: function(n) {
		if (SUI.browser.isIE) {
			return n.outerHTML;
		} else {
			var n2 = document.createElement("DIV");
			n2.appendChild(n.cloneNode(true));
			var r = n2.innerHTML;
			return r;
		}
	},

	/**
	 * Select the word a the current range, but only if the range is
	 * collapsed. This is a creates a  range and is not yet added to
	 * a selection.
	 */
	_rangeSelectWord: function(r) {

		if (SUI.browser.isIE) {

			// only try to select a word if the range is collapsed
			if (r.text != "") {
				return;
			}

			// extend the range
			if (r.expand("word")) {

				if (r.text == "") {
					return;
				}

				// remove a trailing space from the selection, a common
				// nuisance
				if (r.text.indexOf(" ") != -1) {
					r.moveEnd("character", -1);
				}
			}

		} else {

			// only try to select a word if the range is collapsed
			if (!r.collapsed) {
				return;
			}

			var so = r.startOffset;

			// extend the range to the whitespace before the marker
			try {
				for (var i=so; i>=0; i--) {
					r.setStart(r.startContainer, i);
					var c = r.toString();
					if (c.match(/\s/)) {
						r.setStart(r.startContainer, i+1);
						break;
					}
				}
			} catch(e){}

			// extend the range to the whitespace after the marker
			try {
				for (var i=so; i<100; i++) {
					r.setEnd(r.startContainer, i);
					var c = r.toString();
					c = ""+c[c.length-1];
					if (c.match(/\s/)) {
						r.setEnd(r.startContainer, i-1);
						break;
					}
				}
			} catch(e){}

			// remove a trailing space from the selection, a common nuisance
			var rs = r.toString();
			try {
				if (rs.length > 0 && rs[rs.length-1].match(/\s/)) {
					r.setEnd(r.startContainer, r.startOffset+rs.length-1);
				}
			} catch(e){}
		}
	},

	/**
	 * Replace a node, use execCommand inserthtml if possible
	 */
	_replaceNode: function(oldn, newn) {

		if (SUI.browser.isIE) {

			// does not work in IE, so use DOM and break the undo stack
			oldn.parentNode.replaceChild(newn, oldn);

		} else {

			// select the node ...
			var r = this._getCurrentRange();
			r.selectNode(oldn);
			var s = this._getSelection();
			s.removeAllRanges();
			s.addRange(r);

			// ... and replace it
			this._execCommand("delete");
			this._execCommand("inserthtml", this._outerHTML(newn));

		}
	},

	/**
	 * Select the word a the current cursor position, but only if the range is
	 * collapsed. It is a non-IE method but it is the way IE usually behaves,
	 * so we don't need it for that.
	 */
	_selectWord: function() {

		if (SUI.browser.isIE) {
			return;
		}

		var s = this._getSelection();
		var r = this._getCurrentRange(s);

		if (r.collapsed) {

			this._rangeSelectWord(r);

			if (r.collapsed) {
				return;
			}
		}

		s.removeAllRanges();
		s.addRange(r);
	},

	/**
	 * Set contentEditable property of the body or otherwise sepecified
	 * elements
	 */
	_setContentEditable: function(editable) {

		var that = this;

		// Clear all contenteditables.
		for (var i=0; i<this._editableElements.length; i++) {
			this._editableElements[i].contentEditable = false;
		}
		this._editableElements = [];
		this._focussedElement = null;

		// If we need to set it.
		if (editable) {

			// Loop through all the ids of the elements that need to be
			// contentedtiable ...
			for (var i=0; i<this._editableElementIds.length; i++) {
				// ... get that element and ...
				var e = this._editDoc.getElementById(
					this._editableElementIds[i]);
				// ... if found set it and add the element to the internal list.
				if (e) {
					this._editableElements.push(e);
					e.contentEditable = true;
					if (SUI.browser.isIE) {
						SUI.browser.addEventListener(e, "focus", function(e) {
							that._focussedElement = this;
						});
					}
				}
			}

			// If there are no elements marked for contenteditable ...
			if (this._editableElements.length == 0) {
				// ... create our own marker.
				this._editableElements.push(this._editDoc.body);
				this._editDoc.body.contentEditable = true;
			}
		}
	},


	/**
	 * Fix images in WebKit: let the user select images by clicking on them
	 */
	_webKitImgFix: function(elem) {

		if (SUI.browser.isWebKit) {
			// if it is WebKit get all the images and add onclick handlers
			var imgs = this._editDoc.getElementsByTagName("IMG");
			for (var i=0; i<imgs.length; i++) {
				// it might be added before, so try to remove handler first
				SUI.browser.removeEventListener(imgs[i], "click",
						this._webKitImgFixOnClick);
				// add the onclick handler for images in WebKit
				SUI.browser.addEventListener(imgs[i], "click",
						this._webKitImgFixOnClick);
			}
		}

	},

	/**
	 * Onclick handler for WebKit images. WebKit fails to select image when
	 * user clicks it
	 */
	_webKitImgFixOnClick: function(e) {
		var r = this.ownerDocument.createRange();
		r.selectNode(this);
		var s = this.ownerDocument.getSelection();
		s.removeAllRanges();
		s.addRange(r);
	},

	/**
	 * Fix undesired behavior in WebKit: it inserts a DIV on an Enter in
	 * certain contexts (f.i. after a header or if there is no initial
	 * paragraph)
	 */
	_webKitNoDivOnEnterFix: function() {

		// what's the selections parent?
		var n = this.getSelectedElement();

		if (n.tagName == "DIV") {

			// it is a div: replace it with a p
			var p = this._editDoc.createElement("P");
			p.innerHTML = n.innerHTML;
			n.parentNode.insertBefore(p, n);
			n.parentNode.removeChild(n);

			// set the cursor at the beginning of the new p
			var range = this._editDoc.createRange();
			range.selectNodeContents(p);
			range.collapse(false);
			var s = this._getSelection();
			s.removeAllRanges();
			s.addRange(range);
		}
	}

});
