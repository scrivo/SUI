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
 * $Id: PasteData.js 786 2013-08-09 13:26:51Z geert $
 */

"use strict";

SUI.control.PasteData = SUI.defineClass(
	/** @lends SUI.control.PasteData.prototype */{

	/**
	 * @private
	 *
	 * @class
	 * <p>The SUI.control.PasteData is a part of the HTML editor that deals
	 * with pasting data. We want to offer different ways of pasting text:
	 * plain text, filtered (just a limited set of tags and attributes) or
	 * with all markup.
	 * </p>
	 * <p>The latter case is obviously very simple: that is how normal pasting
	 * works, but is not what we prefer as standard actions. We want to remove
	 * all useless and interfering markup that editors as Word use.
	 * </p>
	 * <p>Since we're not allowed to access the paste buffer using JavaScript
	 * we fool the browser here. When pasting we direct the focus to an div
	 * element that we create for the purpose of intercepting the paste
	 * action. We use the 'onbeforepaste' (IE) and 'onpaste' (others) event
	 * handlers to do that.
	 * </p>
	 * <p>We also monitor the key strokes and if we discover that there is data
	 * to paste we finish the paste action by cleaning the pasted data using
	 * the requested method and inserting it into the content.
	 * </p>
	 *
	 * @description
	 * The SUI.control.PasteData implements the pasting logic for the HTML
	 * editor. It is a fundamental part of the HTML editor and therefore both
	 * are able to access each other's private data members.
	 *
	 * @constructs
	 * @param {SUI.control._HTMLEditControl} arg.editor A reference to an
	 *     instance of the SUI.control.HTMLEditControl.
	 */
	initializer: function(arg) {
		this._editor = arg.editor;
	},

	/**
	 * The listener method to use on the 'keyup' event handler of the HTML
	 * editor to finish an intercepted the paste actions. If it is detected
	 * that there is data to be pasted the data will we cleaned using the
	 * currently set paste method and inserted into the content.
	 */
	finishPaste: function() {

		// If we're currently intercepting then finish that
		if (this._intercepting) {
			// Make sure we're not executing this method twice
			if (!this._finishing) {
				this._finishing = true;

				/*if (SUI.browser.isGecko) {
					//this._finishPaste(); < generates exception FF ??
					this._div.blur();
				} else */ if (SUI.browser.isIE) {
					this._finishPasteIE();
				} else {
					this._finishPaste();
				}

				// free the locks
				this._finishing = this._intercepting = false;
			}
		}
	},

	/**
	 * The listener method to use on the 'onbeforepaste' (IE) and 'onpaste'
	 * (others) event handlers to intercept the paste actions. If the paste
	 * method was set to 'html' the method returns true so that pasting will
	 * continue as default. In the case of 'text' or 'filtered' the data
	 * will be pasted to an offscreen div to process it by finishPaste later.
	 */
	interceptPaste: function() {

		if (this._pasteMethod !== "html") {

			// make sure we're not executing while not have completed
			// _finishedPaste
			if (!this._intercepting) {
				this._intercepting = true;

				if (SUI.browser.isIE) {
					this._interceptPasteIE();
				} else {
					this._interceptPaste();
				}
			}

			// prevent event propagation
			return false;

		} else {

			// when used in scrivo event handling: true means propagate (i.e.
			// behave normally)
			return true;

		}

	},

	/**
	 * Get or set the paste method to use when pasting.
	 * @param {String} [p] The desired method for pasting text: 'text',
	 *    'filtered' or 'html' (or none to use this method as a getter).
	 * @return {String} The current paste method setting (or null if this
	 *    method was used as a setter).
	 */
	pasteMethod: function(p) {
		return p !== undefined
			? (this._pasteMethod = p) && null : this._pasteMethod;
	},

	/**
	 * The offscreen div to paste the data to.
	 * @type HTMLElementNode
	 * @private
	 */
	_div: null,

	/**
	 * A reference to the editor object.
	 * @type SUI.control._HTMLEditControl
	 * @private
	 */
	_editor: null,

	/**
	 * Flag to indicate that we're currently are busy with finishing a paste
	 * action.
	 * @type boolean
	 * @private
	 */
	_finishing: false,

	/**
	 * Flag to indicate that we're currently are busy with intercepting a paste
	 * action and that there is data ready to be inserted.
	 * @type boolean
	 * @private
	 */
	_intercepting: false,

	/**
	 * The paste method to use: 'text', 'filtered' or 'html'
	 * @type String
	 * @private
	 */
	_pasteMethod: "filtered",

	/**
	 * The stored range (or bookmark in IE) to be able to restore the cursor
	 * position after the editor focus was moved to the offscreen div.
	 * @type Object
	 * @private
	 */
	_saveRange: null,

	/**
	 * One of the scroll tops to save (and restore) if the document scroll
	 * offset changes when the helper div is created and removed.
	 * @type int
	 * @private
	 */
	_scrollTop1: 0,

	/**
	 * One of the scroll tops to save (and restore) if the document scroll
	 * offset changes when the helper div is created and removed.
	 * @type int
	 * @private
	 */
	_scrollTop2: 0,

	/**
	 * Set of allowed tags an allowed attributes for tag filtering.
	 * @type Object
	 * @private
	 */
	_tagFilter: {
		"P": [],
		"H1": [],
		"H2": [],
		"H3": [],
		"H4": [],
		"H5": [],
		"H6": [],
		"BR": [],
		"HR": [],
		"IMG": ["src", "align", "title", "alt"],
		"A": ["href", "title"],
		"B": [],
		"U": [],
		"I": [],
		"SPAN": ["lang"],
		"STRONG": [],
		"EM": [],
		"SMALL": [],
		"BIG": [],
		"CODE": [],
		"PRE": [],
		"TABLE": ["summary", "cellspacing"],
		"TD": ["id", "headers", "axis"],
		"TH": ["id", "headers", "axis"],
		"TR": [],
		"THEAD": [],
		"TBODY": [],
		"TFOOT": [],
		"CAPTION": [],
		"LI": [],
		"UL": [],
		"OL": [],
		"DD": [],
		"DT": [],
		"DL": []
	},

	/**
	 * Set of tag that should be terminated with a line break when converted
	 * to plain text.
	 * @type Object
	 * @private
	 */
	_blockTags: {
		"P": 1,
		"H1": 1,
		"H2": 1,
		"H3": 1,
		"H4": 1,
		"H5": 1,
		"H6": 1,
		"BR": 1,
		"HR": 1,
		"PRE": 1,
		"TABLE": 1,
		"TR": 1,
		"CAPTION": 1,
		"LI": 1,
		"DD": 1,
		"DT": 1
	},
	
	/**
	 * Create an offscreen div as target for the paste actions so that we can
	 * access and process the data.
	 * @private
	 */
	_createPasteDiv: function() {
		// create an offscreen contenteditable div
		this._div = SUI.browser.createElement();
		SUI.style.removeClass(this._div, "no-select");
		SUI.style.setRect(this._div, 10, -110, 100, 100);
		this._div.style.overflow = "hidden";
		// If you do something, always do it with style ;)
		this._div.style.backgroundColor = "#FFFFBB";
		this._div.contentEditable = true;
		//this._editor._editDoc.body.appendChild(this._div);
		this._editor._editWin.frames.parent.document.body.appendChild(this._div);
	},

	/**
	 * Filter all unwanted tags and attributes from an HTML text string.
	 * @private
	 */
	_filter: function(txt, method) {

		// Setup the filter DIV's ...
		var a = document.createElement("DIV");
		var b = document.createElement("DIV");
		a.innerHTML = txt;
		// ... and filter the tags.
		this._filterTags(a, b);
		
		// If "filtered" was selected, return the filtered result.
		if (method == "filtered") {
			return b.innerHTML;
		}
		
		// Else create plain text from the filtered HTML.
		var res = {res: ""};
		this._toText(b, res, false);
		var makePs = true;
		// Replace line end (with trailing line ends and spaces) ...
		var txt = res.res.replace(/[\r\n][\s\r\n]*/g, makePs ? "<P>" : "");
		// ... clean spaces around P tags ...
		txt = txt.replace(/\s*<P>\s*/g, makePs ? "<P>" : "");
		// ... remove double spaces.
		return txt.replace(/\s+/g, " ");
	},

	/**
	 * When filtering (actually transfering) CSS class names keep the
	 * scrivo system styles.
	 * @param {HTMLElementNode} nd The target node.
	 * @param {String} cls The class name to strip the non scrivo class
	 *     selectors from.
	 * @private
	 */
	_filterClass: function(nd, cls) {
		if (!cls) {
			return;
		}
		var c = cls.split(" ");
		for (var i=0; i<c.length; i++) {
			if (c[i]) {
				if (c[i].substr(0, 4) == "sys_"
						|| c[i].substr(0, 6) == "scrivo") {
					SUI.style.addClass(nd, c[i]);
				}
			}
		}
	},

	/**
	 * Copy an HTML DOM sub tree from a HTML element to an other empty
	 * element node. And while doing so forget all unwanted tags and
	 * attributes, thus in effect filter the tree.
	 * @param {HTMLElementNode} src An source node containing a an HTML
	 *     fragment to filter.
	 * @param {HTMLElementNode} dest An empty target node.
	 * @private
	 */
	_filterTags: function(src, dest) {
		
		var ignore = {"SCRIPT":true, "HEAD":true, "LINK":true, "STYLE":true,
			"META": true, "TITLE": true};

		// first check if src is not an element node ...
		if(src.nodeType != 1 /*Element*/) {
			// ... and if it is an text node ...
			if (src.nodeType == 3 /*Text*/) {
				// ... append the text to the destiny node.
				dest.appendChild(document.createTextNode(src.nodeValue));
			}
			// ... else we're done (only possibility are comment nodes here)
			return;
		}

		// ... node type is element node: get the tag name ...
		var tg = this._tagFilter[src.tagName];
		// ... and check if is allowed and copy it to dest ...
		if(tg) {

			/* TODO need to fix this, not very important, but a bug however
			if (src.tagName == 'TABLE') {
				replaceTableIds(edtWin.document, src);
			}
			*/

			if (src.tagName == 'A' && src.name != "")  {
				// anchor is a special case in IE ...
				if (SUI.browser.isIE && SUI.browser.version <= 8) {
					var nwnd =
						document.createElement("<A name='"+src.name+"'></A>");
				} else {
					var nwnd = document.createElement(src.tagName);
					nwnd.name = src.name;
				}
				SUI.style.addClass(nwnd, "sys_anchor");
			} else {
				// ... else just create the tag.
				var nwnd = document.createElement(src.tagName);
			}

			// now copy the attributes from the source to the destiny node
			for (var i=0; i<tg.length; i++) {
				var attr = src.getAttribute(tg[i]);
				if (attr && (attr != "" || tg[i] == "alt")) {
					nwnd.setAttribute(tg[i], attr);
				}
			}

			// now copy scrivo system styles to the destiny node
			this._filterClass(nwnd, src.className);

			// append the newly created node to the destiny tree
			if (nwnd.tagName == "IMG") {
				// TODO what was the need for this clause
				//if (nwnd.src.indexOf("baseUrl") != -1) {
				dest.appendChild(nwnd);
				dest = nwnd;
				//}
			} else {
				dest.appendChild(nwnd);
				dest = nwnd;
			}
		}

		// recurse into the tree for all child nodes
		for(var i=0; i<src.childNodes.length; i++) {
			if (ignore[src.childNodes[i].tagName]) {
				continue;
			}
			this._filterTags(src.childNodes[i], dest);
		}
	},

	/**
	 * Convert HTML that was filtered using the _filterTags method to plain
	 * text.
	 * @param {HTMLElementNode} src An source node containing a an HTML
	 *     fragment to filter.
	 * @param {object} dest An object containing a 'res' data member field.
	 * @param {bool} prev Value to indicate that the line break should be 
	 *   appended before the new text will be added.
	 * @private
	 */
	_toText: function(src, dest, prev) {
		
		if (prev) {
			dest.res += "\n";
		}		

		// first check if src is not an element node ...
		if(src.nodeType != 1 /*Element*/) {
			// ... and if it is an text node ...
			if (src.nodeType == 3 /*Text*/) {
				// ... append the text to the destiny node.
				dest.res += src.nodeValue.replace(/\r?\n/g, " ");
			}
			return;
		}

		// Recurse into the tree for all child nodes
		for(var i=0; i<src.childNodes.length; i++) {
			this._toText(src.childNodes[i], dest, 
				this._blockTags[src.childNodes[i].tagName]);
		}
	},

	/**
	 * Finish a pending pasting action: filter out unwanted tags from the
	 * pasted data, remove the helper div and insert the cleaned data in
	 * the correct location of the document in the editor.
	 * @private
	 */
	_finishPaste: function() {

		var html = this._filter(this._div.innerHTML, this._pasteMethod);

		// ... remove the helper div ...
//      this._div.contentEditable = false;
//      this._editor._editDoc.body.removeChild(this._div);
		this._editor._editWin.frames.parent.document.body.removeChild(this._div);
		this._div = null;

		if (SUI.browser.isGecko) {
			// set the editor back to contenteditable ...
			this._editor._editDoc.body.contentEditable = false;
			this._editor._editDoc.body.contentEditable = true;
		// ... and restore the selection
		var s = this._editor._getSelection();
		s.removeAllRanges();
		s.addRange(this._saveRange);
		this._saveRange = null;
		}

		// restore document scroll offsets
//		this._editor._editDoc.body.scrollTop = this._scrollTop1;
//		this._editor._editDoc.body.parentNode.scrollTop = this._scrollTop2;

		// Now we can try to insert the cleaned html
		try {
			this._editor._execCommand("insertHtml", html);
		} catch (e) {
			alert(e.message);
		}

		this._editor._editDoc.body.focus();
	},

	/**
	 * Finish a pending pasting action: filter out unwanted tags from the
	 * pasted data, remove the helper div and insert the cleaned data in
	 * the correct location of the document in the editor. This method is
	 * of course specific to IE.
	 * @private
	 */
   _finishPasteIE: function() {

		// ... get the data from the helper div using the selected
		// cleaning method ...
		var html = this._filter(this._div.innerHTML, this._pasteMethod);

		// ... remove the helper div ...
		//this._editor._editDoc.body.removeChild(this._div);
		this._editor._editWin.frames.parent.document.body.removeChild(this._div);
		this._div = null;

		// ... and restore the selection
		var rng = this._editor._ieRestoreBookmark(this._saveRange);
		this._saveRange = null;

		if (rng) {
			rng.pasteHTML(html);
		}

	},

	/**
	 * In order to manipulate the paste buffer we need to intercept the paste
	 * action. Therefore we create an offscreen contenteditable div that gets
	 * the focus over the editor's contenteditable. On a later moment we use
	 * 'finishPaste' to manipulate the pasted data and insert it into the
	 * editor.
	 * @private
	 */
	_interceptPaste: function() {

		// save document scroll offsets
//		this._scrollTop1 = this._editor._editDoc.body.scrollTop;
//		this._scrollTop2 = this._editor._editDoc.body.parentNode.scrollTop;

		// save the current selection
		this._saveRange = this._editor._getCurrentRange();
		this._saveRange =
			this._editor._editWin.getSelection().getRangeAt(0);

		// create an offscreen contenteditable div
		this._createPasteDiv();

		// this works on FF and chrome linux. On chrome window's I find that
		// not the div but the document body receives the paste event. So
		// for chrome you'll find an onpaste handler also.
		var that = this;
		SUI.browser.addEventListener(
			this._div, "paste",
			function () {
				setTimeout(
					function() {
						that.finishPaste();
					}
				);
			}
		);

		// ... and set the focus to the offscreen div, so that the data
		// will be pasted into this div
		this._div.focus();
		var range = this._editor._editWin.frames.parent.document.createRange();
		range.selectNode(this._div);

/*
		// We'll raise an blur event on the paste event. This way we schedule
		// the finishPaste excecution after the content was inserted into the
		// hidden div.
			var that = this;
			SUI.browser.addEventListener(this._div, "blur",
			function(e) {
				setTimeout(
					function() {
						///that.finishPaste();
		}
				);
			}
		);
*/
	},

	/**
	 * In order to manipulate the paste buffer we need to intercept the paste
	 * action. Therefore we create an offscreen contenteditable div that gets
	 * the focus over the editor's contenteditable. On a later moment we use
	 * 'finishPaste' to manipulate the pasted data and insert it into the
	 * editor. This method is of course specific to IE.
	 * @private
	 */
	_interceptPasteIE: function() {

		this._saveRange = this._editor._ieSaveBookmark();

		// create an offscreen contenteditable div
		this._createPasteDiv();
		var that = this;
		SUI.browser.addEventListener(this._div, "blur",
			function(e) {
				that.finishPaste();
			}
		);

		var that = this;
		SUI.browser.addEventListener(this._div, "paste",
			function(e) {
				setTimeout(
					function() {
						that._editor._editDoc.body.focus();
					}
				);
			}
		);


		// ... and set the focus to the offscreen div, so that the data
		// will be pasted into this div
		this._div.focus();
		//var r3 = this._editor._editDoc.body.createTextRange();
		var r3 = this._editor._editWin.frames.parent.document.body.createTextRange();
		r3.moveToElementText(this._div);
		r3.select();

	}

});
