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
 * $Id: TreeView.js 786 2013-08-09 13:26:51Z geert $
 */

"use strict";

SUI.TreeView = SUI.defineClass(
	/** @lends SUI.TreeView.prototype */{

	/** @ignore */ baseClass: SUI.Box,

	/**
	 * @class
	 * SUI.TreeView is an asynchronious tree control. In a tree control a set
	 * of items is displayed in a hierarchical manner, allowing the user to
	 * expand sections to dig deeper into the hierarchy. This control is always
	 * loaded with server side data, so it will not work on your desktop alone.
	 *
	 * @augments SUI.Box
	 *
	 * @description
	 * Create a treeview contol. If you want to do your own xhr because of
	 * extra error handling f.i. you can pass in your own function.
	 *
	 * @constructs
	 * @param see base class
	 * @param {Function} arg.xhr User supplied xml http request function in the
	 *      form of function({String} url, {Function} fn) (optional)
	 * @param {String} arg.dataUrl Url to load the root node(s)
	 */
	initializer: function(arg) {

		if (!arg.anchor) {
			// anchor by default to all sides
			arg.anchor = { right:true,left:true,top:true,bottom:true };
		}

		SUI.TreeView.initializeBase(this, arg);

		// set user specific xhr function if given
		this._xhr = arg.xhr || this._xhr;

		this._dataUrl = arg.dataUrl || null;

		// allow scroll bars in the main div and set the style
		this.el().style.overflow = "auto";
		this.addClass("sui-tv");

		// array of open nodes with indices the ids of the data (not DOM ids)
		this._openNodes = [];
	},

	/**
	 * Height of a node row (CSS, thus including borders and padding)
	 */
	ROW_HEIGHT: 19,

	/**
	 * Height of a node row (CSS, thus including borders)
	 */
	ROW_PADDING_TOP: 1,

	/**
	 * Top and bottom border row width of a node
	 */
	ROW_BORDER_WIDTH: 1,

	/**
	 * Left padding of the text in a node row
	 */
	TEXT_PADDING_LEFT: 2,

	/**
	 * Right padding of the text in a node row
	 */
	TEXT_PADDING_RIGHT: 4,

	/**
	 * Size of the icon (and the indent)
	 */
	ICONS_SIZE: 16,

	/**
	 * Return the data that was selected at the last context menu selection.
	 * Note that this data persist after the context menu is removed and
	 * stays there till the next context menu is requested.
	 * @return {Object} a An object with the current node data (a node
	 *    from the xhr request)
	 */
	contextMenuData: function() {
		return this._contextData;
	},

	/**
	 * Set a custom function for the icons to uses. It operates on the type
	 * set in the data.
	 * @param {Function} fn An function that returns the location of the icon,
	 *     this function has one parameter indicating the icon's type.
	 */
	iconFunction: function(fn) {
		this._iconFunc = fn;
	},

	/**
	 * Load the data into the tree control
	 * @param {Object} arg Object in which the follow entries can be set
	 * - {int[]|string[]} openNodes An object array containing the (data) ids
	 *      of the nodes that are initially open
	 * - {String} dataUrl Url to load the initial node(s)
	 * - {int|string} selected (Data) id of the currently selected node
	 */
	loadData: function(arg) {

		// initially the parent is the main box
		arg.parent = this.el();

		// if there is already a tree rendered, remove it
		if (arg.parent.firstChild) {
			arg.parent.removeChild(arg.parent.firstChild);
		}

		// start at depth 0
		arg.depth = 0;

		// if given, choose the data url from the argument in favor of
		// the one given in the constructor
		arg.dataUrl = this._dataUrl || arg.dataUrl;

		// fill the open nodes array
		if (arg.openNodes) {
			for (var i=0; i<arg.openNodes.length; i++) {
				this._openNodes[arg.openNodes[i]] = true;
			}
		}

		// load the data
		this._loadData(arg);
	},

	/**
	 * onContextMenu event handler: is executed when the user uses the context
	 * menu click on a node.
	 * @param {int} x The x location of the click
	 * @param {int} y The y location of the click
	 */
	onContextMenu: function(x, y) {},

	/**
	 * onSelect event handler: is executed when the user uses selects a node.
	 * Use this to add an action to your selection.
	 */
	onSelect: function() {},

	/**
	 * onSelectionChange event handler: is executed when the selection changes
	 * to another node. Use this to update your GUI (like enabling buttons)
	 */
	onSelectionChange: function() {},

	/**
	 * Transfer the tree selection to the node that was selected by the
	 * context menu. This will also execute the onSelect handler.
	 */
	selectContextMenuNode: function() {
		this._selectNode(this._contextNode, this._contextData);
	},

	/**
	 * Return the data that is currently selected.
	 * @return {Object} a An object with the current node data (a node
	 *    from the xhr request)
	 */
	selectedData: function() {
		return this._selectedData;
	},

	// the currently selected node data
	_selectedData: null,

	// the currently selected HTML node element
	_selectedNode: null,

	// the last (current) selected node data by the context menu
	_contextData: null,

	// the last (current) selected HTML node element by the context menu
	_contextNode: null,

	/* Set the event handlers of a node row.
	 * On the row-div set:
	 *   onclick => _selectNode
	 *   onmouseover => _addHighlight
	 *   onmouseout => _removeHighlight
	 *   oncontextmenu => _handleContextMenu
	 * On the icon set:
	 *   onclick => _openCloseNode
	 * Disable the context menu event on child elements of the row
	 */
	_addEventListeners: function(div, exp, icon, span, arg, dat) {

		// that div, dat, arg are closure variables
		var that = this;

		// Do _selectNode on the click event of a node-row.
		SUI.browser.addEventListener(div, "click",
			function(e) {
				if (!that._selectNode(div, dat)) {
					SUI.browser.noPropagation(e);
				}
			}
		);

		// Do _addHighlight on the mouseover event of a node-row.
		SUI.browser.addEventListener(div, "mouseover",
			function(e) {
				if (!that._addHighlight(div)) {
					SUI.browser.noPropagation(e);
				}
			}
		);

		// Do _removeHighlight on the mouseout event of a node-row.
		SUI.browser.addEventListener(div, "mouseout",
			function(e) {
				if (!that._removeHighlight(div)) {
					SUI.browser.noPropagation(e);
				}
			}
		);

		// Do _handleContextMenu on the contextmenu event of a node-row.
		SUI.browser.addEventListener(div, "contextmenu",
			   function(e) {
				if (!that._handleContextMenu(
						new SUI.Event(this, e), div, dat)) {
					SUI.browser.noPropagation(e);
					that._preventDefault(e);
				}
			}
		);

		// Do _openCloseNode on the click event of the open/close icon.
		if (exp.className.indexOf("sui-tv-exp") !== -1) {
			SUI.browser.addEventListener(exp, "click",
				function(e) {
					if (!that._openCloseNode(div, arg, dat)) {
						SUI.browser.noPropagation(e);
					}
				}
			);
		}

		// Disable the contextmenu event on the two icons and node-row text.
		SUI.browser.addEventListener(exp, "contextmenu", function(e) {
			that._preventDefault(e);
		});
		SUI.browser.addEventListener(span, "contextmenu", function(e) {
			that._preventDefault(e);
		});
		SUI.browser.addEventListener(icon, "contextmenu", function(e) {
			that._preventDefault(e);
		});

	},

	/* Add the highlight to a tree node, except for the selected node
	 */
	_addHighlight: function(div) {
		if (div !== this._selectedNode) {
			// set the highlight + little patch
			SUI.style.addClass(div, "sui-tv-row-highlight");
			this._sizeToNodeContents(div);
		}
	},

	/* Create the list of node-rows for one level of the tree.
	 */
	_createNodeList: function(arg, dat) {
		// create a static UL and append it the the parent
		var ul = SUI.browser.createElement("UL");
		ul.style.position = "static";
		arg.parent.appendChild(ul);

		// if a least one node row as rendered ...
		if (arg.depth) {
			// ... replace the icon of the parent with a wait icon ...
			var ocIcn = arg.parent.firstChild.firstChild;
			ocIcn.nextSibling.src = SUI.imgDir+"/"+ this._iconFunc(arg.pType);
			ocIcn.nextSibling.style.backgroundImage = "none";
			// ... and set the open close node to open
			ocIcn.src = SUI.imgDir+"/"+SUI.resource.tvOpen;
		}

		// loop through all the nodes from the list
		for (var i=0; i<dat.length; i++) {

			// create a static LI
			var li = SUI.browser.createElement("LI");
			li.style.position = "static";

			// create a static DIV for the node row
			var div = SUI.browser.createElement("DIV");
			div.style.position = "static";
			div.style.height =
				(this.ROW_HEIGHT - 2*this.ROW_BORDER_WIDTH) + "px";
			div.style.borderTopWidth = div.style.borderBottomWidth =
				this.ROW_BORDER_WIDTH + "px";
			div.style.borderLeftWidth = div.style.borderRightWidth = "0px";
			div.style.paddingTop = this.ROW_PADDING_TOP + "px";
			div.style.paddingLeft = (arg.depth * this.ICONS_SIZE) + "px";
			SUI.style.addClass(div, "sui-tv-row");

			// create a static image of the icon
			var icon = SUI.browser.createElement("IMG");
			icon.style.position = "static";
			icon.src = SUI.imgDir+"/"+this._iconFunc(dat[i].type);

			// create a static for the open/close icon
			var exp = SUI.browser.createElement("IMG");
			exp.style.position = "static";
			if (dat[i].childListUrl && dat[i].childListUrl !== "") {
				if (this._openNodes[dat[i].id]) {
					exp.src = SUI.imgDir+"/"+SUI.resource.tvOpen;
				} else {
					exp.src = SUI.imgDir+"/"+SUI.resource.tvClosed;
				}
				SUI.style.addClass(exp, "sui-tv-exp");
			} else {
				exp.src = SUI.imgDir+"/"+SUI.resource.tvNone;
			}

			// create a static span for the text
			var span = SUI.browser.createElement("SPAN");
			// TODO refactor: ugly hack
			span.style.cssText = dat[i].style;
			span.style.position = "static";
			span.style.paddingLeft = this.TEXT_PADDING_LEFT + "px";
			span.style.paddingRight = this.TEXT_PADDING_RIGHT + "px";
			span.innerHTML = dat[i].title;

			// append all the items to the DOM UL list
			div.appendChild(exp);
			div.appendChild(icon);
			div.appendChild(span);
			li.appendChild(div);
			ul.appendChild(li);

			// if this is the selected node, select it
			if (dat[i].id == arg.selected) {

				SUI.style.addClass(div, "sui-tv-row-selected");
				this._selectedData = dat[i];

				// was the selection changed (or more likely in this case: on
				// the initial selection) call the onSelectionChange listener
				if (this._selectedNode !== div) {
					this.callListener("onSelectionChange");
				}

				this._selectedNode = div;
			}

			// add the event listers for the node row
			this._addEventListeners(div, exp, icon, span, arg, dat[i]);

			// if the current node is an open node ...
			if (this._openNodes[dat[i].id]) {
				// ... and the node has children ...
				if (dat[i].childListUrl && dat[i].childListUrl !== "") {
					// ... then load the children too
					this._loadData({
						parent: li,
						dataUrl: dat[i].childListUrl,
						pType: dat[i].type,
						depth: arg.depth + 1,
						selected: arg.selected
					});
				}
			}
		}
	},

	/* Store node data when the user uses the context menu and call the
	 * context menu handler.
	 */
	_handleContextMenu: function(e, div, dat)  {
		this._contextNode = div;
		this._contextData = dat;
		this.callListener("onContextMenu", SUI.browser.getX(e.event),
			SUI.browser.getY(e.event));
	},

	/* Default implementation of the icon function.
	 */
	_iconFunc: function(type) {
		return type == 1 ? SUI.resource.tvPage : SUI.resource.tvFolder;
	},

	/* Actual data loading function. Arguments is an object with the following
	 * menbers:
	 * - selected: data id of the selected node
	 * - parent: parent HTML element of the list to create
	 * - dataUrl: location the get the json data for the list
	 * - pType: type op the parent node
	 * - depth: depth of the list
	 */
	_loadData: function(arg) {

		// if there is a row renderd
		if (arg.parent.firstChild) {
			// get a reference to the icon ...
			var prnt = arg.parent.firstChild.firstChild.nextSibling;
			// TODO check this, seem like a bad bug fix
			//if (!prnt) return;
			// ... and set the loading image
			prnt.src = SUI.imgDir+"/"+SUI.resource.tvLoadingAni;
			prnt.style.backgroundImage =
				"url(" + SUI.imgDir + "/" + SUI.resource.tvLoadingBg + ")";
		}

		// load the data and render a list with it
		var that = this;
		this._xhr(arg.dataUrl,
			function(res) {
				that._createNodeList(arg, res.data);
			}
		);
	},

	/* Open or close a node: it is assumed that it has children.
	 */
	_openCloseNode: function(div, a, dat) {

		// if the node was not opened before
		if (!div.nextSibling) {

			// no: open the node: set it in the open nodes array ...
			this._openNodes[dat.id] = true;
			// ... and load the child data.
			this._loadData({
				parent: div.parentNode,
				dataUrl: dat.childListUrl,
				pType: dat.type,
				depth: a.depth + 1
			});

		} else {

			// yes, the node was opened before: toggle the display, icon and
			// entry in the open nodes array.
			if (div.nextSibling.style.display == "none") {

				div.nextSibling.style.display = "block";
				div.firstChild.src = SUI.imgDir+"/"+SUI.resource.tvOpen;
				this._openNodes[dat.id] = true;

			} else {

				div.nextSibling.style.display = "none";
				div.firstChild.src = SUI.imgDir+"/"+SUI.resource.tvClosed;
				this._openNodes[dat.id] = false;

			}
		}
	},

	/* Prevent the default event handling
	 */
	_preventDefault: function(e) {
		if (SUI.browser.isIE) {
			if (!e) {
				e = window.event;
			}
			e.returnValue = false;
		} else {
			e.preventDefault();
		}
	},

	/* Remove highlight to from a tree node
	 */
	_removeHighlight: function(div) {
		// Remove CSS class
		SUI.style.removeClass(div, "sui-tv-row-highlight");
	},

	/* Select a tree node, set highlights and the selected node, then call
	 * the listeners.
	 */
	_selectNode: function(div, dat) {

		// remove the highlight
		SUI.style.removeClass(div, "sui-tv-row-highlight");

		// if there was a previous selection, remove the selection highlight
		if (this._selectedNode) {
			SUI.style.removeClass(this._selectedNode,
				"sui-tv-row-selected");
		}

		// set the selection highlight + little patch
		SUI.style.addClass(div, "sui-tv-row-selected");
		this._sizeToNodeContents(div);

		// store the selection ...
		this._selectedData = dat;
		// ... call the onSelectionChange handler if the selection was changed
		if (div !== this._selectedNode) {
			this.callListener("onSelectionChange");
		}

		// store the selected HTML node and call the select handler
		this._selectedNode = div;
		this.callListener("onSelect");
	},

	/* Set the width of the node div to its content width. This is a patch to
	 * ensure that the background color if the selected node is set to the
	 * width of the div (the offsreen part of a background is often not
	 * rendered when there is a scroll bar).
	 */
	_sizeToNodeContents: function(div) {
		var p = parseInt(div.style.paddingLeft, 10);
		div.style.width = (this.el().scrollWidth -p) + "px";
	},

	/* Default xml-http-request function is the one of the library, but may be
	 * overwritten by a user supplied one
	 */
	_xhr: function(url, cb) {
		SUI.xhr.doGet(url, null, cb);
	}

});
