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
 * $Id: HTMLEditControl.js 786 2013-08-09 13:26:51Z geert $
 */

"use strict";

SUI.control.HTMLEditControl = SUI.defineClass(
	/** @lends SUI.control.HTMLEditControl.prototype */{

	/** @ignore */ baseClass: SUI.control.BaseHTMLEditControl,

	/**
	 * @class
	 * SUI.control.HTMLEditControl implements a WYSIWIG/HTML edit control. It
	 * should provide a standardized interface to the different implementations
	 * of contenteditable in various browsers. Because of code size of the
	 * class it is splitted in two parts: This class is extended from
	 * BaseHTMLEditControl which implements all of the technical structure.
	 * This part implements the actions that can be performed on the content.
	 *
	 * @augments SUI.control.BaseHTMLEditControl
	 *
	 * @description
	 * SUI.control.HTMLEditControl constructor
	 *
	 * @constructs
	 * 
	 * @param {inherit} arg 
	 * @param {Function} arg.onContextMenu event handler, see onContextMenu()
	 * @param {Function} arg.onKeyDown event handler, see onKeyDown()
	 * @param {Function} arg.onLoad event handler, see onLoad()
	 * @param {Function} arg.onSelectionChange event handler, see
	 *     onSelectionChange()
	 */
	initializer: function(arg) {
		SUI.control.HTMLEditControl.initializeBase(this, arg);
	},

	/**
	 * Return an object containing the command that are enabled given the
	 * current cursor position/selection in the editor. the following command
	 * are supported: cut, copy, paste, undo, redo, link, image, anchor,
	 * pageBreak, removeFormatting, orderedList, unorderedList, indent,
	 * deIndent.
	 * @return {Object} an object with the enabled state of all supported
	 *     commands
	 */
	commandsEnabled: function() {

		var cut = false, copy = false, paste = false;

		if (SUI.browser.isWebKit) {
			// WebKit does not support these so this is an alternative
			var sel = this._getSelection();
			cut = copy = !sel.isCollapsed;
			paste = true;
		} else {
			// normal method for other browsers
			cut = this._editDoc.queryCommandEnabled("Cut");
			copy = this._editDoc.queryCommandEnabled("Copy");
			// This also triggers onbeforepaste event
			this._ieDoBeforePaste = false;
			paste = this._editDoc.queryCommandEnabled("Paste");
			this._ieDoBeforePaste = true;
		}

		return {
			cut: cut,
			copy: copy,
			paste: paste,
			undo: this._editDoc.queryCommandEnabled("Undo"),
			redo: this._editDoc.queryCommandEnabled("Redo"),
			link: this._editDoc.queryCommandEnabled("createlink"),
			image: this._editDoc.queryCommandEnabled("insertimage"),
			anchor: this._editDoc.queryCommandEnabled("createlink"),
			pageBreak:
				this._editDoc.queryCommandEnabled("inserthorizontalrule"),
			removeFormatting:
				this._editDoc.queryCommandEnabled("removeformat"),
			orderedList:
				this._editDoc.queryCommandEnabled("insertorderedlist"),
			unorderedList:
				this._editDoc.queryCommandEnabled("insertunorderedlist"),
			indent: this._editDoc.queryCommandEnabled("indent"),
			deIndent: this._editDoc.queryCommandEnabled("outdent")
		};
	},

	/**
	 * Return an object containing the command state of the commands
	 * applicable at the current cursor position/selection in the editor.
	 * the following commands are supported: bold, underline, italic,
	 * justifyleft, justifyCenter, justifyRight.
	 * @return {Object} an object with the state of all supported commands
	 */
	commandStates: function() {
		return {
			bold: this._editDoc.queryCommandState("Bold"),
			underline: this._editDoc.queryCommandState("Underline"),
			italic: this._editDoc.queryCommandState("Italic"),
			alignLeft: this._editDoc.queryCommandState("justifyleft"),
			alignCenter: this._editDoc.queryCommandState("justifyCenter"),
			alignRight: this._editDoc.queryCommandState("justifyRight"),
			insertUnorderedList:
				this._editDoc.queryCommandState("insertUnorderedList"),
			insertOrderedList:
				this._editDoc.queryCommandState("insertOrderedList")
		};
	},

	/**
	 * Set the background color of the current editor selection.
	 * This command transfers the focus to the editor.
	 * @param {String} col CSS color to set the background to
	 */
	doBackColor: function(col) {
		if (SUI.browser.isIE) {
			// In IE we do a setTimeout to settle the focus (r.select creates
			// an application error)
			var that = this;
			setTimeout(function() {
				that._execCommand("BackColor", col);
				that._onCommandExecuted();
			}, 10);
		} else {
			this._selectWord();
			this._execCommand("styleWithCSS", true);
			this._execCommand("HiliteColor", col);
			this._execCommand("styleWithCSS", false);
			this._onCommandExecuted();
		}
	},

	/**
	 * Toggle the bold state of the current editor selection.
	 * This command transfers the focus to the editor.
	 */
	doBold: function() {
		this._selectWord();
		this._execCommand("Bold");
		this._onCommandExecuted();
	},

	/**
	 * Find text in the editor. Gecko ignores the wholeWord parameter.
	 * @param {String} what text to search
	 * @param {boolean} caseSensitive case sensitive search
	 * @param {boolean} backward search directions
	 * @param {boolean} wholeWord search on whole words only (not Gecko)
	 * @return {boolean} true if the text was found
	 */
	doFind: function(what, caseSensitive, backward, wholeWord) {

		this.focus();

		// normalize parameter values (false i.o. null)
		caseSensitive =    caseSensitive ? true : false;
		backward = backward ? true : false;
		wholeWord = wholeWord ? true : false;

		// find the text in the editor
		var strFound = SUI.browser.isIE
			? this._ieFind(what, caseSensitive, backward, wholeWord)
			: this._editWin.find(what, caseSensitive, backward, false,
				wholeWord, false, false);

		this._onCommandExecuted();
		// return if the search was successful
		return strFound ? true : false;
	},

	/**
	 * Set the font of the current editor selection.
	 * This command transfers the focus to the editor.
	 * @param {String} val The font name (prefixed by "f_")
	 */
	doFontName: function(val) {
		this._selectWord();
		if (SUI.browser.isIE) {
			// Note: prefix the font name with "f_" (so "f_arial" instead of
			// "arial"). This will cause the font tags to be replaced by span
			// tags (IE). Browsers that support a span instead of a font tag
			// will use that.
			this._execCommand("FontName", "f_" + val);
			this._fontFix();
		} else {
			this._execCommand("styleWithCSS", true);
		this._execCommand("FontName", val);
			this._execCommand("styleWithCSS", false);
		}
		this._onCommandExecuted();
	},

	/**
	 * Set the font size of the current editor selection.
	 * This command transfers the focus to the editor.
	 * @param {String} val The font size (prefixed by "s_")
	 */
	doFontSize: function(val) {
		this._selectWord();
		// Prefix the font name with "s_" (so "s_200P" instead of "200%").
		// This will cause the font tags to be replaced by span tags (IE).
		// Browsers that support a span instead of a font tag will use that.
		// Unfortunately execCommand fontsize can't be used: no browser
		// supports it well.
		val = "s_" + val.replace("%", "P");
		if (SUI.browser.isIE) {
			this._execCommand("FontName", val);
		this._fontFix();
		} else {
			this._execCommand("styleWithCSS", true);
			this._execCommand("FontName", val);
			this._execCommand("styleWithCSS", false);
			this._spanFix();
		}
		this._onCommandExecuted();
	},

	/**
	 * Set the foreground color of the current editor selection.
	 * This command transfers the focus to the editor.
	 * @param {String} col CSS color to set the background to
	 */
	doForeColor: function(col) {
		this._selectWord();
		if (SUI.browser.isIE) {
			// In IE we do a setTimeout to settle the focus (r.select creates
			// an application error)
			var that = this;
			setTimeout(function() {
				that._execCommand("ForeColor", col);
				that._fontFix();
				that._onCommandExecuted();
			}, 10);
		} else {
			this._execCommand("styleWithCSS", true);
			this._execCommand("ForeColor", col);
			this._execCommand("styleWithCSS", false);
			this._onCommandExecuted();
		}
	},

	/**
	 * Format the block that is currently selected (ie. P, H1, H2 etc)
	 * This command transfers the focus to the editor.
	 * @param {String} val the block format tag name
	 */
	doFormatBlock: function(val) {
		this._execCommand("FormatBlock", "<"+val+">");
		this._onCommandExecuted();
	},

	/**
	 * Get the acronym node that is parent to the current editor selection.
	 * @return {HTMLElementNode} the parent acronym node or null if there is
	 *     none
	 */
	doGetAbbr: function() {
		var e = this.getSelectedElement();
		// traverse up the dom tree until the root only checking element nodes
		while (e != null && e.nodeType != 9) {
			if (e.nodeType == 1 && e.tagName=="ACRONYM") {
				return e;
			} else {
				e = e.parentNode;
			}
		}
		return null;
	},

	/**
	 * Get the span:lang node that is parent to the current editor selection.
	 * @return {HTMLElementNode} the parent span:lang node or null if there is
	 *     none
	 */
	doGetLang: function() {
		var e = this.getSelectedElement();
		// traverse up the dom tree until the root only checking element nodes
		while (e != null && e.nodeType != 9) {
			if (e.nodeType == 1 && e.tagName=="SPAN") {
				if (e.lang != "" && e.lang != null) {
					return e;
				}
			}
			e = e.parentNode;
		}
		return null;
	},

	/**
	 * Get the a node that is parent to the current editor selection.
	 * @return {HTMLElementNode} the parent a node or null if there is none
	 */
	doGetLink: function() {
		var e = this.getSelectedElement();
		// traverse up the dom tree until the root only checking element nodes
		while (e!=null && e.nodeType != 9) {
			if (e.nodeType == 1 && e.tagName=="A") {
				return e;
			} else {
				e=e.parentNode;
			}
		}
		return null;
	},

	/**
	 * Get the selected image is selected in the editor. Note: for IE we
	 * return a reference to the img node, for other browsers we create
	 * a copy.
	 * @return {HTMLElementNode} an img node or null if there is none
	 */
	doGetImg: function() {

		var img = null;

		if (SUI.browser.isIE) {

			var s = this._getSelection();
			// it is proven code but I'm not sure about this (why not
			// s.type == "Control" ?)
			if (s.type != "None" && s.type != "Text") {
				img = s.createRange().item(0);
				// and then this loop up the dom tree ???
				while (img != null && img.tagName != "IMG"){
					img = img.parentNode;
				}
			}

		} else {

			var r = this._getCurrentRange();
			// create a copy: overwrite later
			var fr = r.cloneContents();
			// find the first image in the selected range
			for (var i=0; i<fr.childNodes.length; i++) {
				var n = fr.childNodes[i];
				if (n.nodeType==1 && n.tagName=="IMG") {
					img = n;
					break;
				}
			}

		}

		return img;
	},

	/**
	 * Indent the current paragraph or create a deeper level in a list.
	 * This command transfers the focus to the editor.
	 */
	doIndent: function() {
		this._execCommand("Indent");
		this._onCommandExecuted();
	},

	/**
	 * Insert a acronym node into the editor content. Unfortunately no abbr
	 * because IE does not support this. The acronym gets the 'sys_abbr'
	 *  system style.
	 * This command transfers the focus to the editor.
	 * @param {String} fullText the full text for the abbreviation
	 */
	doInsertAbbr: function(fullText) {
		this.doInsertInlineElement("ACRONYM",
			{"class": "sys_abbr", title: fullText});
	},

	/**
	 * Insert an anchor node into the editor content. The anchor gets the
	 * 'sys_anchor' system style.
	 * This command transfers the focus to the editor.
	 * @param {String} name the name for the anchor
	 */
	doInsertAnchor: function(name) {
		name=name.replace(/[\s]+/g,"_");
		this.doInsertInlineElement("A", {name: name, "class": "sys_anchor"});
	},

	/**
	 * Insert a horizontal ruler into the editor content.
	 * This command transfers the focus to the editor.
	 */
	doInsertHorizontalRule: function() {
		this._execCommand("InsertHorizontalRule");
		this._onCommandExecuted();
	},

	/**
	 * Insert any html you like into the editor content.
	 * This command transfers the focus to the editor.
	 * @param {String} html the HTML code to insert
	 */
	doInsertHTML: function(html) {
		if (SUI.browser.isIE) {
			var that = this;
			setTimeout(function() {
				that.focus();
				var r = that._getCurrentRange();
				r.collapse(true);
				r.select();
				r.pasteHTML(html);
				that._onCommandExecuted();
			}, 10);
		} else {
			this._execCommand("inserthtml", html);
			this._onCommandExecuted();
		}
	},

	/**
	 * Insert an image into the editor content.
	 * This command transfers the focus to the editor.
	 * @param {HTMLElementNode} img an HTML image node to insert
	 */
	doInsertImg: function(img) {

		if (SUI.browser.isIE) {
			// In IE we do a setTimeout to settle the focus (r.select creates
			// an application error)
			var that = this;
			setTimeout(function() {
				that.focus();
				// why not doInsertHTML ??
				var r = that._getCurrentRange();
				r.pasteHTML(img.outerHTML);
				r.select();
				that._onCommandExecuted();
			}, 10);
		} else {
			this.focus();
			// doUpdateImg does an insert
			this.doUpdateImg(img);
			// make it possible to select the image in WebKit
			this._webKitImgFix();
			this._onCommandExecuted();
		}
	},

	/**
	 * Insert an inline element into the editor content.
	 * This command transfers the focus to the editor.
	 * @param {String} tag The html tag name of the element
	 * @param {Object} attr an object with name-values pairs
	 */
	doInsertInlineElement: function(tag, attr) {

		if (SUI.browser.isIE) {

			// In IE we do a setTimeout to settle the focus (r.select creates
			// an application error)
			var that = this;
			setTimeout(function() {

			that.focus();

			var elem = that._editDoc.createElement(tag);
			SUI.browser.setAttributes(elem, attr);

			var s = that._getSelection();
			var r = that._getCurrentRange(s);

			// if necessary expand a collapsed range to single word selection
			if (s.type == "None") {
				// if necessary expand collapsed range to single word selection
					that._rangeSelectWord(r);
				r.select();
			}

			// if the previous step failed and range is still collapsed ...
			if (r.text == "" || s.type == "None") {
				// ... then there is nothing to do
				return;
			}

			if (s.type == "Text") {

				// if there is a text selection overwrite it with the html
				elem.innerHTML = r.htmlText;
				r.pasteHTML(elem.outerHTML);

			} else {

					// if the selection was element then replace that element
				// with ours and then append it to ours
				//el = r.commonParentElement();
				//el.parentElement.replaceChild(elem, el);
				//elem.appendChild(el);
					// TODO: No create a childnode instead, but that is also not
				// fully correct (common parent can be more that the selection)
				el = SUI.browser.version < 9
					? r.commonParentElement() : r.item(0);
				elem.innerHTML = el.innerHTML;
				r.pasteHTML(elem.outerHTML);

			}

				that._onCommandExecuted();

			}, 10);

		} else {

			this.focus();

			var elem = this._editDoc.createElement(tag);
			SUI.browser.setAttributes(elem, attr);

			var s = this._getSelection();
			var r = this._getCurrentRange(s);

			if (r.collapsed) {
				// if necessary expand collapsed range to single word selection
				this._rangeSelectWord(r);
			}

			// if the previous step failed and range is still collapsed ...
			if (r.collapsed) {
				// ... then there is nothing to do
				return;
			}

			// set the innerHTML of our element to the selected html fragment
			elem.innerHTML = this._outerHTML(r.cloneContents());
			var html = this._outerHTML(elem);

			// add the range to the selection
			s.removeAllRanges();
			s.addRange(r);

			// and paste the new html over it
			this._execCommand("inserthtml", html);

			this._onCommandExecuted();
		}

	},

	/**
	 * Insert a language mark into the editor content. The language mark gets
	 * the 'sys_anchor' system style.
	 * This command transfers the focus to the editor.
	 * @param {String} language a language code
	 */
	doInsertLang: function(language) {
		this.doInsertInlineElement("SPAN",
			{"class": "sys_language", lang: language});
	},

	/**
	 * Insert a hyperlink into the editor content.
	 * This command transfers the focus to the editor.
	 * @param {Object} attr the attributes of the link
	 */
	doInsertLink: function(attr) {

		if (SUI.browser.isIE) {

			// In IE we do a setTimeout to settle the focus (r.select creates
			// an application error)
			var that = this;
			setTimeout(function() {

			that.focus();

			// don't use doInsertInlineElement because we can use execCommand
				var s = that._editDoc.selection;
				var r = that._getCurrentRange(s);

			// if necessary expand a collapsed range to single word selection
			if (s.type == "None") {
				// if necessary expand collapsed range to single word selection
					that._rangeSelectWord(r);
				r.select();
			}

			// if the previous step failed and range is still collapsed ...
			if (r.text == "" || s.type == "None") {
				// ... then there is nothing to do
				return;
			}

				if (s.type == "Text" || s.type == "None") {

				// craete the link with execCommand
					that._execCommand("CreateLink", attr.href);

				// an try to find it in the editor content
				var anA = r.parentElement();
				if (anA.tagName != "A") {
					anA = anA.firstChild;
				}

				// if we found it then set the other attributes
				if (anA.tagName == "A") {
					SUI.browser.setAttributes(anA, attr);
					r.collapse(false);
				}
			} else {

				var anAnchor = that._editDoc.createElement("A");
				SUI.browser.setAttributes(anAnchor, attr);
				// if the selection was element then replace this element
				// with ours and then append it to ours
				el = SUI.browser.version < 9
					? r.commonParentElement() : r.item(0);
				el.parentElement.replaceChild(anAnchor, el);
				anAnchor.appendChild(el);

			}
				that._onCommandExecuted();

			}, 10);

		} else {

			this.focus();
			this.doInsertInlineElement("A", attr);

		}
	},

	/**
	 * Insert an node into the editor content. Unlike doInsertInlineElement
	 * this command overwrites the current selection.
	 * This command transfers the focus to the editor.
	 * @param {HTMLElementNode} node The node to insert
	 */
	doInsertNode: function(node) {
		this.doInsertHTML(this._outerHTML(node));
		this._onCommandExecuted();
	},

	/**
	 * Change a paragraph into the first element of (or a couple of
	 * paragraphs into) an ordered list.
	 * This command transfers the focus to the editor.
	 */
	doInsertOrderedList: function() {
		this._execCommand("InsertOrderedList");
		this._onCommandExecuted();
	},

	/**
	 * Change a paragraph into the first element of (or a couple of
	 * paragraphs into) an unordered list.
	 * This command transfers the focus to the editor.
	 */
	doInsertUnorderedList: function() {
		this._execCommand("InsertUnorderedList");
		this._onCommandExecuted();
	},

	/**
	 * Toggle the italic state of the current editor selection.
	 * This command transfers the focus to the editor.
	 */
	doItalic: function() {
		this._selectWord();
		this._execCommand("Italic");
		this._onCommandExecuted();
	},

	/**
	 * Justify current editor paragraph or paragraphs in a selection
	 * to the Center.
	 * This command transfers the focus to the editor.
	 */
	doJustifyCenter: function() {
		this._execCommand("JustifyCenter");
		this._onCommandExecuted();
	},

	/**
	 * Justify current editor paragraph or paragraphs in a selection
	 * to the Left.
	 * This command transfers the focus to the editor.
	 */
	doJustifyLeft: function() {
		this._execCommand("JustifyLeft");
		this._onCommandExecuted();
	},

	/**
	 * Justify current editor paragraph or paragraphs in a selection
	 * to the Right.
	 * This command transfers the focus to the editor.
	 */
	doJustifyRight: function() {
		this._execCommand("JustifyRight");
		this._onCommandExecuted();
	},

	/**
	 * De-indent the current paragraph or move a list item to a higher level
	 * in a list.
	 * This command transfers the focus to the editor.
	 */
	doOutdent: function() {
		this._execCommand("Outdent");
		this._onCommandExecuted();
	},

	/**
	 * Move up on the editor's undo stack.
	 * This command transfers the focus to the editor.
	 */
	doRedo: function() {
		this._execCommand("Redo");
		this._onCommandExecuted();
	},

	/**
	 * Remove an anchor from the editor content.
	 * This command transfers the focus to the editor.
	 * @param {HTMLElementNode} link reference to the anchor element to remove
	 */
	doRemoveAnchor: function(link) {
		if (link.href) {
			// if the anchor a href too only remove the name and class
			this.doUpdateInlineElement(link, {name: null, "class": ""});
		} else {
			this.doRemoveNode(link);
		}
	},

	/**
	 * Remove all formatting from the current editor selection.
	 * This command transfers the focus to the editor.
	 */
	doRemoveFormat: function() {

		if (SUI.browser.isIE) {

			this._execCommand("RemoveFormat");

			// And do some more work to remove the style attributes in
			// the current selection too
			var sel = this._editDoc.selection.createRange();
			var oRng1 = this._editDoc.body.createTextRange();

			var l = this._editDoc.body.getElementsByTagName("*");
			for (var i=l.length-1; i>=0; i--) {
				oRng1.moveToElementText(l[i]);
				if (1 == oRng1.compareEndPoints("StartToStart", sel)
						&& -1 == oRng1.compareEndPoints("StartToEnd", sel)) {
					l[i].removeAttribute("style");
				}
			}

		} else {

			this._execCommand("RemoveFormat");

		}
		this._onCommandExecuted();
	},

	/**
	 * Remove all formatting from the current editor selection.
	 * @param {HTMLElementNode} link reference to the anchor element to remove
	 */
	doRemoveLink: function(link) {
		this.doRemoveNode(link);
		// if the link also was an anchor reappend the anchor
		if (link.name) {
			this.doInsertAnchor(link.name);
		}
	},

	/**
	 * Remove node from the editor but keep its contents.
	 * @param {HTMLElementNode} el reference to the node to remove
	 */
	doRemoveNode: function(el) {

		if (SUI.browser.isIE) {

			// can't use execCommand, this breaks the undo stack
			el.removeNode(false);

		} else {

			// select node
			var r = this._getCurrentRange();
			r.selectNode(el);
			var s = this._getSelection();
			s.removeAllRanges();
			s.addRange(r);
			// remove it
			this._execCommand("delete", false);
			// and paste the contents
			this._execCommand("inserthtml", el.innerHTML);
		}

		this._onCommandExecuted();
	},

	/**
	 * Replace selected text in the editor (think search and replace). There
	 * needs to be selected text, this is not a text insert function.
	 * @param {String} text text to replace the selected text
	 */
	doReplace: function(text) {

		if (SUI.browser.isIE) {

			this.focus();
			// get the current range
			var rng = this._getCurrentRange();
			// check if there is data to replace, then replace
			if (rng.text != "") {
				rng.text = text;
			}

		} else {

			// get the current range
			var r = this._getCurrentRange();
			// check if there is data to replace, then replace
			if (r.toString() != "") {
				this._execCommand("inserthtml", text);
			}

		}

		this._onCommandExecuted();
	},

	/**
	 * Replace all occurances of a text in the editor. The search direction
	 * is ignored: replaceAll from current cursor position might be
	 * implemented in the future. Gecko ignores the wholeWord parameter.
	 * @param {String} what text to search and replace
	 * @param {String} text new text
	 * @param {boolean} caseSensitive case sensitive search
	 * @param {boolean} backward search direction, ignored: always foreward
	 * @param {boolean} wholeWord search on whole words only
	 * @return {boolean} the number of replacements made
	 */
	doReplaceAll: function(what, text, caseSensitive, backward, wholeWord) {

		var cnt = 0;
		this.focus();

		// normalize parameter values (false i.o. null)
		caseSensitive =    caseSensitive ? true : false;
		backward = false;
		wholeWord = wholeWord ? true : false;

		if (SUI.browser.isIE) {

			// set the current range to the beginning of the document
			var rng = this._getCurrentRange();
			rng.expand("textedit");
			rng.collapse(true);
			rng.select();

			// while found replace text
			while (this._ieFind(what, caseSensitive, backward, wholeWord)) {
				cnt++;
				this.doReplace(text);
			}

		} else {

			// set the current selection to the beginning of the document
			var s = this._getSelection();
			var rng = this._editDoc.createRange();
			rng.selectNode(this._editDoc.body);
			rng.collapse(true);
			s.removeAllRanges();
			s.addRange(rng);

			// while found replace text
			while (this._editWin.find(what, caseSensitive, backward,
					false, wholeWord, false, false)) {
				cnt++;
				this.doReplace(text);
			}

		}

		this._onCommandExecuted();

		return cnt;
	},

	/**
	 * Select the whole content of the editor.
	 * This command transfers the focus to the editor.
	 */
	doSelectAll: function() {
		this._execCommand("SelectAll");
		this._onCommandExecuted();
	},

	/**
	 * Toggle the underline state of the current editor selection.
	 * This command transfers the focus to the editor.
	 */
	doUnderline: function() {
		this._selectWord();
		this._execCommand("Underline");
		this._onCommandExecuted();
	},

	/**
	 * Move down on the editor's undo stack.
	 * This command transfers the focus to the editor.
	 */
	doUndo: function() {
		this._execCommand("Undo");
		this._onCommandExecuted();
	},

	/**
	 * Update an abbreviation in the editor content.
	 * This command transfers the focus to the editor.
	 * @param {HTMLElementNode} el a reference to the abbreviation element to
	 *     update
	 * @param {String} fullText the new full text for the abbreviation
	 */
	doUpdateAbbr: function(el, fullText) {
		this.doUpdateInlineElement(el, {title: fullText});
	},

	/**
	 * Update an anchor element in the editor content.
	 * This command transfers the focus to the editor.
	 * @param {HTMLElementNode} link a reference to the anchor element to
	 *     update
	 * @param {String} name the new anchor name
	 */
	doUpdateAnchor: function(link, name) {
		name=name.replace(/[\s]+/g,"_");
		this.doUpdateInlineElement(link, {name: name, "class": "sys_anchor"});
	},

	/**
	 * Update an image element in the editor content.
	 * This command transfers the focus to the editor.
	 * @param {HTMLElementNode} img te new image node to replace the old one
	 */
	doUpdateImg: function(img) {

		if (SUI.browser.isIE) {
			this.focus();
			// done by setting properties
		} else {
			// overwrite the current selection with new img-html
			this._execCommand("inserthtml", this._outerHTML(img));
			this._webKitImgFix();
		}
		this._onCommandExecuted();
	},

	/**
	 * Update an inline element in the editor content.
	 * This command transfers the focus to the editor.
	 * @param {HTMLElementNode} el a reference to element to update
	 * @param {Object} attr the new attributes for the element
	 */
	doUpdateInlineElement: function(el, attr) {

		if (SUI.browser.isIE) {

			this.focus();
			SUI.browser.setAttributes(el, attr);

		} else {

			// place te node into a range
			var r = this._editDoc.createRange();
			r.selectNode(el);

			// clone that range an add attributes
			var c = r.cloneContents();
			SUI.browser.setAttributes(c.childNodes[0], attr);

			// select te range
			var s = this._getSelection();
			s.removeAllRanges();
			r.selectNode(el);
			s.addRange(r);

			// and overwrite with new html
			this._execCommand("inserthtml", this._outerHTML(c));
		}
		this._onCommandExecuted();
	},

	/**
	 * Update a language mark in the editor content.
	 * This command transfers the focus to the editor.
	 * @param {HTMLElementNode} el a reference to the language mark to update
	 * @param {String} language the new language code for the marker
	 */
	doUpdateLang: function(el, language) {
		this.doUpdateInlineElement(el, {lang: language});
	},

	/**
	 * Update a link in the editor content.
	 * This command transfers the focus to the editor.
	 * @param {HTMLElementNode} link a reference to the link to update
	 * @param {String} attr the new attributes for the link
	 */
	doUpdateLink: function(link, attr) {
		this.doUpdateInlineElement(link, attr);
	},

	_onCommandExecuted: function() {
		// update the undo state
		this._undoState = (this._editDoc.queryCommandEnabled("Undo") ? 1 : 0)
			+ (this._editDoc.queryCommandEnabled("Redo") ? 2 : 0);
		this.callListener("onCommandExecuted");
	}

});
