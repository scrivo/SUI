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
 * $Id: ListView.js 786 2013-08-09 13:26:51Z geert $
 */

"use strict";

SUI.ListView = SUI.defineClass(
	/** @lends SUI.ListView.prototype */{

	/** @ignore */ baseClass: SUI.Box,

	/**
	 * @class
	 * SUI.ListView is a component to display data in a list with columns. The
	 * list can be used to select one multiple rows. To aid the user's
	 * selection the rows can be sorted per column.
	 *
	 * @augments SUI.Box
	 *
	 * @description
	 * Construct a SUI.ListView object. A large number of variables can be set
	 * to customize the listview to your specific needs.
	 *
	 * @constructs
	 * @param {Object} object in which the follow entries can be set
	 * @param see base class
	 * @param {boolean} arg.multiselect Enable multiple selection
	 * @param {object[]} arg.data The data array of objects in which each
	 *     object contains column (key) / values pairs
	 * @param {String} arg.sort The column key for which the data should be
	 *     sorted initially
	 * @param {int|int[]} arg.selected Array of indexes for the initial row
	 *     selection
	 * @param {int} arg.focussed Index of the row to focus initially
	 * @param {object[]} arg.cols The column definition: an array with objects
	 *     which can contain the following fields:
	 * @param {String} arg.cols[].title The header title
	 * @param {String} arg.cols[].key Key that corresponds with a key in the
	 *     data array
	 * @param {int} arg.cols[].width Width of the header
	 * @param {int} arg.cols[].minWidth Minimum width of the header
	 * @param {int} arg.cols[].maxWidth Maximum width of the header
	 * @param {String} arg.cols[].align Alignment of the header, options are
	 *     "left" (default), "center" and "right"
	 * @param {string|function} arg.cols[].icon false (default) if no icon is
	 *     needed or a location of an icon file or a function that returns one.
	 *     This function takes to parameters, the first is a reference to the
	 *     row and the second is key of the column to generate an icon
	 *     location for.
	 * @param {string|function} arg.cols[].sort a build in sort method or a
	 *     user defined one. "text" (default) and "number" are the build in
	 *     sort methods. The sort function take three parameters: the first
	 *     is a reference to the data array, the second is the key on which to
	 *     sort and the third is the search direction (1 or -1).
	 * @param {Function} arg.cols[].format_func A user defined format
	 *     function, this function takes to parameters, the first is a
	 *     reference to the row and the second is key of the column that
	 *     needs to be formatted.
	 */
	initializer: function(arg) {

		// by default anchor to all sides
		if (!arg.anchor) {
			arg.anchor = { right:true,left:true,top:true,bottom:true };
		}

		SUI.ListView.initializeBase(this, arg);

		// do the heavy stuff
		this._buildControl(arg);
	},

	/**
	 * Top padding of a cell
	 */
	CELL_PADDING_TOP: 1,

	/**
	 * Left and right padding of a cell
	 */
	CELL_PADDING_SIDES: 5,

	/**
	 * Header border (only below the header).
	 */
	HEADER_BORDER_BOTTOM_WIDTH: 1,

	/**
	 * Header height (including bottom border)
	 */
	HEADER_HEIGHT: 21,

	/**
	 * Padding top of the headers
	 */
	HEADER_PADDING_TOP: 2,

	/**
	 * Side padding for a header if a no direction indicator needs to be drawn
	 * at that side.
	 */
	HEADER_PADDING_SHORT: 2,

	/**
	 * Side padding for a header if a direction indicator needs to be drawn
	 * at that side.
	 */
	HEADER_PADDING_LONG: 16,

	/**
	 * Top margin of the sort direction indicator.
	 */
	HEADER_SORT_ICON_MARGIN_TOP: 2,

	/**
	 * Size (width/height) of the icon for the sort direction indicator.
	 */
	HEADER_SORT_ICON_SIZE: 16,

	/**
	 * The half-width of the spacer
	 */
	HEADER_SPACER_WIDTH: 3,

	/**
	 * Size (width/height) of the row icons.
	 */
	ICON_SIZE: 16,

	/**
	 * The vertical margin for the separator (determines the length of the
	 * separator).
	 */
	SEPARATOR_MARGIN_V: 3,

	/**
	 * Width of the separator on the spacer between the headers.
	 */
	SEPARATOR_WIDTH: 2,

	/**
	 * Row border width (top and bottom)
	 */
	ROW_BORDER_WIDTH: 1,

	/**
	 * Row height (including top and bottom border)
	 */
	ROW_HEIGHT: 20,

	/**
	 * Display the listview control. Set the CSS size and position of the list
	 * and all the headers. Then render the rows.
	 */
	display: function() {

		this.setDim();

		// set the CSS dimensions of the header
		this.headervpt.setDim();
		this.header.setDim();

		// set the CSS dimensions of the column headers
		for (var i=0; i<this.colums.length; i++) {
			this.colums[i].header.setDim();
			this.colums[i].headerTitle.setDim();
			this.colums[i].spacer.setDim();
			this.colums[i].separator.setDim();
		}

		// set the CSS of the list
		this.listvpt.setDim();
		this.list.setDim();

		// render the rows, only deal with the focussed row if the list was
		// not yet drawn
		if (this._firstDisplay && this._focussedRow) {
			if (!this._scrollIntoView(this._focussedRow)) {
				this._renderRows();
			}
		} else {
			this._renderRows();
		}
		this._firstDisplay = false;
	},

	/**
	 * Lay out the listview control. Calculate the size and position of the
	 * list and headers.
	 */
	layOut: function() {

		var hdrInnerH = this.HEADER_HEIGHT - this.HEADER_BORDER_BOTTOM_WIDTH;

		// set the size of the header viewport
		this.headervpt.setRect(0, 0, this.width(), this.HEADER_HEIGHT);
		// and create a very wide header bar (so we can set the scroll offset)
		this.header.setRect(0, 0, 10000, hdrInnerH);

		// current left position for the header
		var l = 0;
		// loop through all the columns
		for (var i=0; i<this.colums.length; i++) {

			// set the off the column to the current left
			this.colums[i].left = l;
			// get the width of an header
			var w = this.colums[i].width - this.HEADER_SPACER_WIDTH*2;

			// set the dimensions for the header
			this.colums[i].header.setRect(
				0, l+this.HEADER_SPACER_WIDTH, w, hdrInnerH);
			// set the dimensions for the spacer between the header
			this.colums[i].spacer.setRect(0, l+this.HEADER_SPACER_WIDTH+w,
				this.HEADER_SPACER_WIDTH*2, hdrInnerH);
			// set the dimensions for the separator line in the spacer
			this.colums[i].separator.setRect(this.SEPARATOR_MARGIN_V,
				this.HEADER_SPACER_WIDTH - this.SEPARATOR_WIDTH/2,
				this.SEPARATOR_WIDTH, hdrInnerH - 2*this.SEPARATOR_MARGIN_V);

			// move current left to the next column
			l += this.colums[i].width;

			var pl = 0, pr = 0;

			if (this.colums[i].align === "right") {

				// set the parameters for a right aligned header
				pl = this.HEADER_PADDING_LONG;
				pr = this.HEADER_PADDING_SHORT;
				this.colums[i].header.addClass("sui-lv-header-sort-left");
				this.colums[i].header.el().style.backgroundPosition = "0px " +
					this.HEADER_SORT_ICON_MARGIN_TOP + "px";

			} else {

				// set the parameters for a left aligned header
				pl = this.HEADER_PADDING_SHORT;
				pr = this.HEADER_PADDING_LONG;
				this.colums[i].header.addClass("sui-lv-header-sort-right");
				this.colums[i].header.el().style.backgroundPosition =
					(this.colums[i].width-this.HEADER_SORT_ICON_SIZE-
					this.HEADER_SPACER_WIDTH*2) + "px " +
					this.HEADER_SORT_ICON_MARGIN_TOP + "px";

			}

			// set the dimensions of the text in the header
			this.colums[i].headerTitle.setRect(this.HEADER_PADDING_TOP, pl,
				this.colums[i].header.width() - pr - pl,
				this.colums[i].header.height()-this.HEADER_PADDING_TOP);

		}

		// set the dimensions of the viewport
		this.listvpt.setRect(this.HEADER_HEIGHT, 0, this.width(),
			this.height() - this.HEADER_HEIGHT);
		// and the dimensions of the list
		this.list.setRect(0, 0, l, this.list.height());

		// we want to (re) draw all the rows, so set a new row drawing phase
		this._rowDraw++;
	},

	/**
	 * (Re)load data into the list view.
	 * @param {object[]} data The data array of objects in which each object
	 *     contains column (key) / values pairs
	 * @param {int/int[]} selected Array of indexes for the initial row
	 *     selection
	 * @param {int} focussed Index of the row to focus initially
	 */
	loadData: function(data, selected, focussed) {

		var w = this.list.width();
		// remove what's in the list (other data or loading image) ...
		this.list.removeBox();
		// and create a new box
		this.list = new SUI.Box({parent: this.listvpt});
		// we want the zebra pattern to continue further than the last column
		this.list.el().style.overflow = "visible";

		// remove the "loading" image
		this.listvpt.el().style.backgroundImage = "none";
		this.listvpt.removeClass("sui-lv-loading");

		// and set our data to the data given
		this.data = data ? data : [];

		// we keep the last width but the height setting may be different
		this.list.setRect(0, 0, w, this.data.length * this.ROW_HEIGHT);

		// create an entry for the data we need (references to the cells and
		// rows f.i.) in each data row.
		for (var r=0; r<this.data.length; r++) {
			this.data[r].rowPtr =
				{ "row": null, "drw" : 0, sel : false, "cells" : []};
		}

		// 'normalize' the selected parameter into tmpsel (undefined to [],
		// and int to [int] and [] to []
		var tmpsel = [];
		if (selected !== undefined) {
			if (selected) {
				if (this._multiselect) {
					tmpsel = selected;
				} else {
					tmpsel = [selected[0]];
				}
			}
		}

		// get the focussed row from the index
		var f = focussed !== undefined ? this.data[focussed] : null;
		this._focussedRow = null;

		// set the selected rows
		this.selectedRows = [];
		// the first selected row is always the focussed one
		if (f) {
			this.data[focussed].rowPtr.sel = true;
			this.selectedRows.push(this.data[focussed]);
		}
		// set selected rows (focussed row might be selected already)
		if (this._multiselect || this.selectedRows.length !== 1) {
			for (r=0; r<tmpsel.length; r++) {
				if (r !== focussed) {
					this.data[tmpsel[r]].rowPtr.sel = true;
					this.selectedRows.push(this.data[tmpsel[r]]);
				}
			}
		}

		// sort the data if required
		if (this._sortCol) {
			this._sort();
		}

		// and set the focussed row after sorting (leave it for the display
		// function)
		this._focussedRow = f;

	},

	/**
	 * onClick event handler: is executed when the user clicks on a row.
	 * @param {Object} row A reference to the selected row in the data table
	 */
	onClick: function(row) {
	},

	/**
	 * onDblClick event handler: is executed when the user double clicks on a
	 * row.
	 * @param {Object} row A reference to the selected row in the data table
	 */
	onDblClick: function(row) {
	},

	/**
	 * onContextMenu event handler: is executed when the user uses the context
	 * menu click on a row.
	 * @param {int} x The x location of the click
	 * @param {int} y The y location of the click
	 */
	onContextMenu: function(x, y) {
	},

	/**
	 * onSelectionChange event handler: is executed when the (set of) row
	 * selection(s) changes.
	 * TODO: this event handler is not called properly from the code (f.i.
	 * id not called when rows are deselected).
	 */
	onSelectionChange: function() {
	},

	/**
	 * Replace the listview contents with an "is loading" image. Recommended
	 * when data is loaded from an external resource.
	 */
	setIsLoadingImage: function() {

		// get the width and height of the current box
		var w = this.list.width();
		var h = this.list.height();

		// remove the data in the list ...
		this.list.removeBox();
		// ... and create a new box ...
		this.list = new SUI.Box({parent: this.listvpt});
		// .. and set the width an height to those of the old box
		this.list.setRect(0, 0, w, h);

		// now set the CSS for the loading image
		this.listvpt.addClass("sui-lv-loading");
		this.listvpt.el().style.backgroundImage =
			"url("+SUI.imgDir+"/"+SUI.resource.lvLoading+")";
	},

	// flag to indicate if the display functions was called for the first time
	_firstDisplay: true,

	// the row that has the focus
	_focussedRow: null,

	// is the list focussed or not
	_isFocussed: false,

	// allow multiple selection
	_multiselect: true,

	// first row of a multiple selection
	_multiSelStartRow: null,

	// indicate a row drawing phase: increment to redraw current rows (to
	// invalidate the currently drawn rows)
	_rowDraw: 0,

	// flag to prevent re-entrancy in the renderRows function
	_rowDrawing: false,

	// width of the system scrollbar (needed for size corrections)
	_scrollBarWidth: 0,

	// local storage for current left scroll offset of the list
	_scrollOffsetLeft: 0,

	// local storage for current top scroll offset of the list
	_scrollOffsetTop: 0,

	// column that is currently sorted
	_sortCol: null,

	// flag to indicate if we're sorting up or down
	_sortUp: true,

	/* Add the focus CSS class name to the focussed row
	 */
	_addFocusRectangle: function(e)  {
		this._isFocussed = true;
		if (this._focussedRow && this._focussedRow.rowPtr.row) {
			this._focussedRow.rowPtr.row.addClass("sui-lv-row-focus");
		}
	},

	/* Set event handlers of a header:
	 * click => _sortColumn;
	 * mousedown => _highlightHeader;
	 * mouseout, mouseup => _restoreHeader;
	 * mousedown (of a spacer) => _resizeColumn
	 */
	_addHeaderEventHandlers: function(column) {

		// 'that' and 'column' are two closure variables
		var that = this;

		// Do _sortColumn on the click event of a header.
		SUI.browser.addEventListener(column.header.el(), "click",
			function(e) {
				if (!that._sortColumn(column)) {
					SUI.browser.noPropagation(e);
				}
			}
		);

		// Do _highlightHeader on the mousedown event of a header.
		SUI.browser.addEventListener(column.header.el(), "mousedown",
			function(e) {
				if (!that._highlightHeader(column.header)) {
					SUI.browser.noPropagation(e);
				}
			}
		);

		// Do _resizeColumn on the onmousedown event of a header spacer.
		SUI.browser.addEventListener(column.spacer.el(), "mousedown",
			function(e) {
				if (!that._resizeColumn(new SUI.Event(this, e), column)) {
					SUI.browser.noPropagation(e);
				}
			}
		);

		// Do _restoreHeader on the mouseout event of a header.
		SUI.browser.addEventListener(column.header.el(), "mouseout",
			function(e) {
				if (!that._restoreHeader(column.header)) {
					SUI.browser.noPropagation(e);
				}
			}
		);

		// Do _restoreHeader on the mouseup event of a header.
		SUI.browser.addEventListener(column.header.el(), "mouseup",
			function(e) {
				if (!that._restoreHeader(column.header)) {
					SUI.browser.noPropagation(e);
				}
			}
		);
	},

	/* Set event handlers the list:
	 * focus => _addFocusRectangle;
	 * blur => _removeFocusRectangle;
	 * keydown/keypress => _handleKeyStroke;
	 * scroll => handleScroll
	 */
	_addListEventHandlers: function() {

		var that = this;

		SUI.browser.addEventListener(this.el(), "focus",
			function(e) {
				if (!that._addFocusRectangle(new SUI.Event(this, e))) {
					SUI.browser.noPropagation(e);
				}
			}
		);
		SUI.browser.addEventListener(this.el(), "blur",
			function(e) {
				if (!that._removeFocusRectangle(new SUI.Event(this, e))) {
					SUI.browser.noPropagation(e);
				}
			}
		);
		SUI.browser.addEventListener(this.el(), "keydown",
			function(e) {
				// problems with Gecko's keydown use so keypress for Gecko
				if (!SUI.browser.isGecko) {
					if (!that._handleKeyStroke(new SUI.Event(this, e))) {
					SUI.browser.noPropagation(e);
					}
				}
			}
		);
		SUI.browser.addEventListener(this.listvpt.el(), "keypress",
			function(e) {
				// problems with gecko's keydown use so keypress
				if (SUI.browser.isGecko) {
					if (!that._handleKeyStroke(new SUI.Event(this, e))) {
						SUI.browser.noPropagation(e);
					}
				}
			}
		);
		SUI.browser.addEventListener(this.listvpt.el(), "scroll",
			function(e) {
				if (!that._handleScroll(new SUI.Event(this, e))) {
					SUI.browser.noPropagation(e);
				}
			}
		);

	},

	/* Set event handlers of a row:
	 * click => _handleRowClick;
	 * contextmenu => _handleRowContextMenu;
	 * dblclick => _handleRowDblClick
	 */
	_addRowEventHandlers: function(row) {

		// 'that' and 'row' are two closure variables
		var that = this;

		// Do _handleRowClick on the click event of a row.
		SUI.browser.addEventListener(row.rowPtr.row.el(), "click",
			function(e) {
				if (!that._handleRowClick(new SUI.Event(this, e), row)) {
					SUI.browser.noPropagation(e);
				}
			}
		);

		// Do _handleRowContextMenu on the contextmenu event of a row.
		SUI.browser.addEventListener(row.rowPtr.row.el(), "contextmenu",
			function(e) {
				if (!that._handleRowContextMenu(new SUI.Event(this, e), row)) {
					SUI.browser.noPropagation(e);
				}
			}
		);

		// Do _handleRowDblClick on the dblclick event of a row.
		SUI.browser.addEventListener(row.rowPtr.row.el(), "dblclick",
			function(e) {
				if (!that._handleRowDblClick(new SUI.Event(this, e), row)) {
					SUI.browser.noPropagation(e);
				}
			}
		);

	},

	/* Create the columns for the listview
	 */
	_buildColumns: function(arg) {

		// get the profile for each column
		for (var i=0; i<arg.cols.length; i++) {
			// start with a default profile
			var def = {
				title: "Kolom "+i,
				key: i,
				width: 100,
				minWidth: 10,
				maxWidth: 1000,
				icon: false,
				align: "left",
				sort: "text",
				format_func: null
			};
			for (var prop in arg.cols[i]) {
				// and overwrite the default profile with the entries set
				// in the arguments
				if (arg.cols[i].hasOwnProperty(prop)) {
					def[prop] = arg.cols[i][prop];
				}
			}
			this.colums.push(def);
		}

		// loop through all the columns
		for (i=0; i<this.colums.length; i++) {

			// create the column header
			this.colums[i].header = new SUI.Box({parent: this.header});

			// and a box for the text in the header
			this.colums[i].headerTitle =
				new SUI.TextBox({parent: this.colums[i].header});
			this.colums[i].headerTitle.text(this.colums[i].title);
			this.colums[i].headerTitle.el().style.overflow = "hidden";
			this.colums[i].headerTitle.el().style.whiteSpace = "nowrap";
			this.colums[i].headerTitle.el().style.textAlign =
				this.colums[i].align;

			// end all headers with a spacer
			this.colums[i].spacer = new SUI.Box({parent: this.header});
			this.colums[i].spacer.addClass("sui-lv-header-spacer");
			this.colums[i].spacer.el().style.cursor = "col-resize";

			// each spacer also get a separator line
			this.colums[i].separator =
				new SUI.Box({parent: this.colums[i].spacer});
			this.colums[i].separator.border(
				new SUI.Border(0, this.SEPARATOR_WIDTH / 2 | 0));
			this.colums[i].separator.addClass("sui-lv-header-separator");

			// set the event handlers for the row
			this._addHeaderEventHandlers(this.colums[i]);

			// and if date is sorted ...
			if (arg.sort) {
				// ... set the sort direction indicator for the sorted column
				if (this.colums[i].key === arg.sort) {
					this._sortCol = this.colums[i];
					this.colums[i].header.el().style.backgroundImage =
						"url("+SUI.imgDir+"/"+this.ICON_SORT_UP+")";
				}
			}
		}

	},

	/* Make all required boxes for the control, set event handlers and load
	 * the data.
	 */
	_buildControl: function(arg) {

		// initialize the selectedRows array
		this.selectedRows = [];
		// get the width of the system scrollbar
		this._scrollBarWidth = SUI.style.scrollbarWidth();
		// initialize the columns array
		this.colums = [];

		// if multiselect was set multiple selection on
		if (arg.multiselect !== undefined) {
			this._multiselect = arg.multiselect;
		}

		// incorporate this the listview's main element in the tab flow
		this.el().tabIndex = 1;
		// but do not allow it to be focusable (one row will be focusable)
		this.addClass("no-focus");

		// create a viewport for the header: a box in which the header can
		// scroll to the left or right.
		this.headervpt = new SUI.Box({parent: this});
		this.headervpt.border(
			new SUI.Border(0, 0, this.HEADER_BORDER_BOTTOM_WIDTH, 0));
		this.headervpt.addClass("sui-lv-header");
		// don't want scroll bars, its scrolling is dependent on the scrolling
		// of the list
		this.headervpt.el().style.overflow = "hidden";

		// create the header box, fill it with headers later
		this.header = new SUI.Box({parent: this.headervpt});

		// create a viewport for the list: a box in which the list can
		// scroll to the left or right, or up or down.
		this.listvpt = new SUI.Box({parent: this});
		this.listvpt.addClass("no-focus");
		this.listvpt.addClass("sui-lv-viewport");
		// allow for scrolling in two dimensions
		this.listvpt.el().style.overflow = "auto";
		// take it out of the tab flow
		this.listvpt.el().tabIndex = -1;

		// create the list and add it to the viewport
		this.list = new SUI.Box({parent: this.listvpt});

		// add the general event handlers
		this._addListEventHandlers();

		// create the columns
		this._buildColumns(arg);

		// and load the data into the listview
		this.loadData(arg.data, arg.selected, arg.focussed);
	},

	/* Create a row cell
	 */
	_createCell: function(rowPtr, dataPtr, col, c) {

		// create the cell
		var cell = new SUI.TextBox({parent: rowPtr.row});

		// set the content for cell, using a format function if appropriate
		cell.text(col.format_func
			? col.format_func(dataPtr, col.key)
			: (dataPtr[col.key] ? dataPtr[col.key] : ""));
		// set the cell's alignment
		cell.el().style.textAlign = col.align;
		// we don't want overflow and warp on these cells
		cell.el().style.overflow = "hidden";
		cell.el().style.whiteSpace = "nowrap";

		var that = this;
		// but we do want to show the content if it is truncated
		// that and cell are the tow closure variables
		SUI.browser.addEventListener(cell.el(), "mouseover",
			function(e) {
				if (!that._setTitleOnOverflow(cell)) {
					SUI.browser.noPropagation(e);
				}
			}
		);

		// if there is an icon in this column ...
		if (col.icon) {

			// ... get the icon, using a function if appropriate
			var icn = col.icon instanceof Function
				? col.icon(dataPtr, col.key) : dataPtr[col.icon];
			// ... and set the icon as background image ...
			cell.el().style.backgroundImage = "url("+SUI.imgDir+"/"+icn+")";
			// ... now set the padding for the cell
			cell.padding(new SUI.Padding(
				this.CELL_PADDING_TOP,    this.CELL_PADDING_SIDES, 0,
			 (this.ICON_SIZE+this.CELL_PADDING_SIDES)));

		} else {
			// ... else set normal padding for the cell
			cell.padding(new SUI.Padding(
			 this.CELL_PADDING_TOP, this.CELL_PADDING_SIDES, 0));

		}

		// store a reference to the cell
		rowPtr.cells[c]=cell;
	},

	/* Deselect a given or all selected rows.
	 */
	_deSelectRows: function(dataPtr) {

		// if a row as argument was given ...
		if (dataPtr !== undefined) {

			// ... then deselect that row, remove the CSS classname ...
			if (dataPtr.rowPtr.row) {
				// ... if the row was rendered ...
				dataPtr.rowPtr.row.removeClass("sui-lv-row-selected");
			}
			// ... set its selection marker to false ...
			dataPtr.rowPtr.sel = false;
			// ... and remove it from the selectedRows array
			var i = this.selectedRows.indexOf(dataPtr);
			if(i!==-1) {
				this.selectedRows.splice(i, 1);
			}

		} else {

			// ... else deselect all selected rows ...
			for (i=0; i<this.selectedRows.length; i++) {
				// ... remove the CSS classname
				if (this.selectedRows[i].rowPtr.row) {
					// ... if the row was rendered ...
					this.selectedRows[i].rowPtr.row.removeClass(
						"sui-lv-row-selected");
				}
				// ... and set its selection marker to false
				this.selectedRows[i].rowPtr.sel = false;
			}

			// now clear the selectedRows array
			this.selectedRows = [];

		}
	},

	/* Handle a click on a row
	 */
	_handleRowClick: function(e, row)  {
		this._selectAndFocusRows(row, e.event.ctrlKey, e.event.shiftKey);
		this.callListener("onClick", row);
	},

	/* Handle a right-click (context menu request) on a row
	 */
	_handleRowContextMenu: function(e, row)  {
		if (this.selectedRows.indexOf(row) === -1) {
			this._selectAndFocusRows(row, e.event.ctrlKey, e.event.shiftKey);
		}
		this.callListener("onContextMenu", SUI.browser.getX(e.event),
			SUI.browser.getY(e.event));
	},

	/* Handle a double-click (context menu request) on a row
	 */
	_handleRowDblClick: function(e, row)  {
		this._selectAndFocusRows(row, e.event.ctrlKey, e.event.shiftKey);
		this.callListener("onDblClick", row);
	},

	/* Handle a scroll event: save the scroll offsets and render the rows
	 * in case of vertical scroll.
	 */
	_handleScroll: function(e) {

		// if scrolling in horizontal direction ...
		if (this._scrollOffsetLeft !== e.target.scrollLeft) {
			// ... store left scroll distance ...
			this._scrollOffsetLeft = e.target.scrollLeft;
			// ... and set the scroll offset for the header
			this.headervpt.el().scrollLeft = this._scrollOffsetLeft;
		}

		// if scrolling in vertical direction ...
		if (this._scrollOffsetTop !== e.target.scrollTop) {
			// ... store left scroll distance ...
			this._scrollOffsetTop = e.target.scrollTop;
			// ... and render the rows
			this._renderRows();
		}
	},

	/* End dragging of a columnheader: remove dragger and resize column.
	 */
	_endDrag: function(dragger, column) {
		// remove the dragger form the document tree
		dragger.removeBox();
		// calculate new column width
		column.width = dragger.left() - column.left + this.HEADER_SPACER_WIDTH;
		// and redraw the list view
		this.draw();
	},

	/* Set the currently focussed row
	 */
	_focusRow: function(dataPtr) {

		// Only if row focus changes
		if (this._focussedRow !== dataPtr) {

			// Remove CSS class name if the row was rendered ...
			if (this._focussedRow && this._focussedRow.rowPtr.row) {
				this._focussedRow.rowPtr.row.removeClass("sui-lv-row-focus");
			}
			// ... set the new focussed row ...
			this._focussedRow = dataPtr;
			// ... and ddd the CSS class name if the row was rendered
			if (this._focussedRow && this._focussedRow.rowPtr.row) {
				this._focussedRow.rowPtr.row.addClass("sui-lv-row-focus");
			}
		}
	},

	/* Find the next row if we're scrolling with page up or page down key
	 */
	_getRowIndexNextPage: function(keyCode) {

		// get the index of the current row
		var i = this.data.indexOf(this._focussedRow);
		// and calculate the page size in rows
		var ps = this.listvpt.height() / this.ROW_HEIGHT | 0;

		// if page down was pressed
		if (keyCode === 34) {
			// increase index with page size
			i += ps;
			// but not further than the length of the data array
			if (i > this.data.length-1) {
				i = this.data.length-1;
			}
		}

		// if page down was pressed
		if (keyCode === 33) {
			// decrease index with page size
			i -= ps;
			// but not further that zero
			if (i < 0) {
				i = 0;
			}
		}

		// return the index for new row to focus/select
		return i;
	},

	/* Find the next row if we're scrolling with up or down key
	 */
	_getRowIndexNextRow: function(keyCode) {

		// get the index of the current row
		var i = this.data.indexOf(this._focussedRow);

		// if key down was pressed an we're not at the last row already ...
		if (keyCode === 40 && i < this.data.length-1) {
			// increase the index
			i++;
		}

		// if key up was pressed an we're not at the first row already ...
		if (keyCode === 38 && i > 0) {
			// decrease the index
			i--;
		}

		// return the index for new row to focus/select
		return i;
	},

	/* Set a header to the pressed state.
	 */
	_highlightHeader: function(header) {
		header.addClass("sui-lv-header-button-pressed");
	},

	/* Process a key stroke
	 */
	_handleKeyStroke: function(e)  {

		// enable key processing by the browser
		var r = true;

		// set _multiSelStartRow if necessary
		this._setMultiSelStartRow(e.event.ctrlKey, e.event.shiftKey);

		// keycode madness: there is a difference between keypress and
		// mousedown event
		var keyCode = e.event.keyCode ? e.event.keyCode : e.event.charCode;

		// dispatch to the correct keystroke processing function
		switch(keyCode) {
		case 40:
		case 38:
			// up or down
			r = this._selectNextRow(keyCode, e.event.ctrlKey,
				e.event.shiftKey);
			break;
		case 32:
			// (ctrl) space
			r = this._toggleSelection(keyCode, e.event.ctrlKey);
			break;
		case 34:
		case 33:
			// page up or down
			r = this._selectNextPageRow(keyCode);
			break;
		case 65:
		case 97:
			// (ctrl) a
			r = this._selectAll(keyCode, e.event.ctrlKey);
			break;
		default:
			break;
		}

		// it the keystroke was processed (note: !r) then prevent default
		// action
		if (!r) {
			if (SUI.browser.isIE) {
				e.event.returnValue = false;
			} else {
				e.event.preventDefault();
			}
		}

		// likewise prevent event propagation if the keystroke was processed
		return r;
	},

	/* Remove the focus CSS class name from the focussed row
	 */
	_removeFocusRectangle: function(e)  {
		this._isFocussed = false;
		if (this._focussedRow && this._focussedRow.rowPtr.row) {
			this._focussedRow.rowPtr.row.removeClass("sui-lv-row-focus");
		}
	},

	/* Render the rows currently in the viewport, create the rows if necessary
	 */
	_renderRows: function() {

		// don't re-enter
		if (this._rowDrawing) {
			return;
		}
		this._rowDrawing = true;

		// get the first and number of rows to render ...
		var t = this.listvpt.el().scrollTop / this.ROW_HEIGHT | 0;
		var n = this.height() / this.ROW_HEIGHT | 0;

		// and loop over these rows
		for (var i=t; i<t+n && i<this.data.length; i++) {

			// the current left
			var l = 0;
			// shortcuts: dataPtr is the current row in the data set ...
			var dataPtr = this.data[i];
			// ... and rowPtr point to the DOM row
			var rowPtr = dataPtr.rowPtr;

			// is the row already drawn in the current drawing phase ...
			if (rowPtr.drw !== this._rowDraw) {
				// ... no the draw it

				// if there is no row yet, create it
				if (rowPtr.drw === 0) {

					// create a box for the row
					rowPtr.row = new SUI.Box({parent: this.list});
					// temporary hide its contents
					rowPtr.row.el().style.display="none";
					// add CSS class and border
					rowPtr.row.addClass("sui-lv-row");
					rowPtr.row.border(
					 new SUI.Border(this.ROW_BORDER_WIDTH, 0));
					// store reference
					dataPtr.rowPtr = rowPtr;

					// an add the event handlers to the row
					this._addRowEventHandlers(dataPtr);
				}

				// loop over the columns
				for (var c=0; c<this.colums.length; c++) {

					// if the row is not drawn yet add the cells
					if (rowPtr.drw === 0) {
						this._createCell(rowPtr, dataPtr, this.colums[c], c);
					}
					// set the size of the cells
					var w = this.colums[c].width;
					rowPtr.cells[c].setRect(0, l, w, this.ROW_HEIGHT
						- 2 * this.ROW_BORDER_WIDTH - this.CELL_PADDING_TOP);

					// increase the current left
					l += w;

					// set the CSS dimensions of the cell
					rowPtr.cells[c].setDim();
				}

				// now we're sure that we have a row and all cells have the
				// proper dimensions draw the row, first set the proper CSS
				// class name
				rowPtr.row.removeClass("sui-lv-row-even");
				rowPtr.row.removeClass("sui-lv-row-odd");
				rowPtr.row.addClass(
					"sui-lv-row sui-lv-row-" + (i%2 ? "even" : "odd"));

				// if the row is not as long as the viewport extend it so the
				// zebra pattern is not truncated (and correct for the width of
				// the scroll bar)
				if (l < this.width()) {
					l = this.width()
						- (this.listvpt.height() < this.list.height()
							? this._scrollBarWidth : 0);
				}

				// set the size of the row and the CSS dimensions
				rowPtr.row.setRect(this.ROW_HEIGHT*i, 0, l, this.ROW_HEIGHT);
				rowPtr.row.setDim();

				// if it is the focussed row add CSS class
				if (this._focussedRow && this._isFocussed
						&& rowPtr === this._focussedRow.rowPtr) {
					rowPtr.row.addClass("sui-lv-row-focus");
				}

				// if it is a selected row add CSS class
				if (rowPtr.sel) {
					rowPtr.row.addClass("sui-lv-row-selected");
				}

				// store the drawing phase into the row
				rowPtr.drw = this._rowDraw;

				// now show the row
				rowPtr.row.el().style.display = "block";
			}

		}

		// unlock this function
		this._rowDrawing = false;
	},

	/* Start sizing a column: create and initialize a dragger.
	 */
	_resizeColumn: function(event, column) {

		var left = column.left - this.HEADER_SPACER_WIDTH;

		// find minimum x for dragging
		var minx = left + column.minWidth;
		if (minx < this.headervpt.el().scrollLeft) {
			minx = this.headervpt.el().scrollLeft;
		}

		// find maximum x for dragging
		var maxx = left + column.maxWidth;
		if (maxx > this.headervpt.width() +
			this.headervpt.el().scrollLeft - this.HEADER_SPACER_WIDTH * 2) {
			maxx = this.headervpt.width() +
				this.headervpt.el().scrollLeft - this.HEADER_SPACER_WIDTH * 2;
		}

		// Create  dragger ...
		var dragger = new SUI.Dragger({parent: this.header});
		// ... width the same dimensions as the column spacer
		dragger.setRect(column.spacer);

		// style the dragger
		dragger.addClass("sui-lv-header-dragger");
		dragger.el().style.cursor = column.spacer.el().style.cursor;

		// set the dragging restrictions
		dragger.direction(dragger.HORIZONTAL);
		dragger.xMin(minx);
		dragger.xMax(maxx);

		// set the CSS dimensions of the dragger
		dragger.setDim();

		// set the onEndDrag event handler
		var that = this;
		dragger.addListener("onEndDrag", function() {
			that._endDrag(dragger, column);
		});

		// and start dragging
		dragger.start(event, this);
	},

	/* Set a header to the normal state.
	 */
	_restoreHeader: function(header)  {
		header.removeClass("sui-lv-header-button-pressed");
	},

	/* Scroll the given row into view.
	 */
	 _scrollIntoView: function(row) {

		// assume no need to scroll
		var res = false;

		if (row) {

			// at what position is the row?
			var rownum = this.data.indexOf(row);

			// if calculated distance from top is larger than the viewport
			// height plus top overflow ...
			if (((rownum + 1) * this.ROW_HEIGHT) >
					(this._scrollOffsetTop + this.listvpt.el().clientHeight)) {

				// ... then calculate the new top overflow en set it
				this._scrollOffsetTop = (rownum + 1) * this.ROW_HEIGHT -
					this.listvpt.el().clientHeight;
				this.listvpt.el().scrollTop = this._scrollOffsetTop;

				// render rows into the viewport
				this._renderRows();

				res = true;
			}

			// if calculated distance from top is smaller than the
			// top overflow ...
			if (rownum * this.ROW_HEIGHT < this._scrollOffsetTop) {

				// ... then set the top overflow to that value
				this._scrollOffsetTop = rownum * this.ROW_HEIGHT;
				this.listvpt.el().scrollTop = this._scrollOffsetTop;

				// render rows into the viewport
				this._renderRows();

				res = true;
			}
		}

		return res;
	},

	/* Process letter A key.
	 */
	_selectAll: function(keyCode, ctrl) {

		// Ctrl-A: select all, So only relevant when multiple selection is on
		// and ctrl is pressed
		if (this._multiselect && ctrl) {

			// select all rows
			for (var i=0; i<this.data.length; i++) {
				this._selectRow(this.data[i]);
			}

			// invalidate rows region, so rows will be redrawn
			this._rowDraw++;
			// and redraw the rows
			this._renderRows();

			// disable key processing by the browser
			  return false;
		}

		// enable key processing by the browser
		return true;
	},

	/* Handle a click on a row
	 */
	_selectAndFocusRows: function(dataPtr, ctrl, shift) {

		// set _multiSelStartRow if necessary
		this._setMultiSelStartRow(ctrl, shift);

		if (this._multiselect && shift && this._multiSelStartRow) {

			// multiple selection is on, shift key is pressed and there is a
			// start row: do a range selection. Find the start and end
			var startno = this.data.indexOf(this._multiSelStartRow);
			var endno = this.data.indexOf(dataPtr);
			// swap if necessary
			if (startno > endno) {
				var t = startno; startno = endno; endno = t;
			}
			// deselect the rows
			this._deSelectRows();
			// and create the new selection
			for (var i=startno; i<=endno; i++) {
				this._selectRow(this.data[i]);
			}


		} else if (this._multiselect && ctrl) {

			// multiple selection is on and the ctrl key was pressed, if
			// current row was selected ...
			if (dataPtr.rowPtr.sel) {
				// ... de-select it ...
				this._deSelectRows(dataPtr);
			} else {
				// ... else select it.
				this._selectRow(dataPtr);
			}

		} else {

			// no fancy keys, or no start of multiple selection set yet:
			// deselect all rows an select the requested.
			this._deSelectRows();
			this._selectRow(dataPtr);

		}

		// focus the row was clicked upon
		this._focusRow(dataPtr);
	},

	/* Process page up or page down key.
	 */
	_selectNextPageRow: function(keyCode) {

		// only relevant if there is a focussed row to start
		if (this._focussedRow) {

			// find the index of the new row, ...
			var i = this._getRowIndexNextPage(keyCode);
			// ... deselect the rows and select the new one, ...
			this._deSelectRows();
			this._selectRow(this.data[i]);
			// ... and focus the row, ...
			this._focusRow(this.data[i]);
			// ... and scroll it into view
			this._scrollIntoView(this._focussedRow);

			// disable key processing by the browser
			  return false;
		}

		// enable key processing by the browser
		return true;
	},

	/* Process up or down key.
	 */
	_selectNextRow: function(keyCode, ctrl, shift) {

		// if there is no focussed row ...
		if (!this._focussedRow) {

			// ... then use that keystroke to focus the first row
			// TODO: is this a real case?
			this._focusRow(this.data[0]);

		} else {

			// ... else if there is no selected row ...
			if (this.selectedRows.length === 0) {

				// ... the use that keystroke to select the row
				this._selectRow(this._focussedRow);

			} else {

				var n = this._getRowIndexNextRow(keyCode);

				if (this._multiselect && shift) {

					// multiple selection is on, shift key is pressed and
					// there is a start row: do a range selection. Find the
					// start and end
					var s = this.data.indexOf(this._multiSelStartRow);
					var e = this.data.indexOf(this.data[n]);
					// swap if necessary
					if (s > e) {
						var t = s; s = e; e = t;
					}
					// deselect the rows
					this._deSelectRows();
					// and create the new selection
					for (var i=s; i<=e; i++) {
						this._selectRow(this.data[i]);
					}

				} else if (!this._multiselect || !ctrl) {

					// multiple selection is off or ctrl and shift were not
					// used, deselect all rows an select the requested one.
					this._deSelectRows();
					this._selectRow(this.data[n]);

				}

				// now foucs the selected row
				this._focusRow(this.data[n]);
			}

			// and scroll the row into view
			this._scrollIntoView(this._focussedRow);
		}

		// disable key processing by the browser
		return false;
	},

	/* Set the selected row
	 */
	_selectRow: function(dataPtr) {

		// don't add this row if it was just added? Seems like a stange bug fix
		if (this.selectedRows[this.selectedRows.length-1] !== dataPtr) {

			// add the row to the selected rows ...
			this.selectedRows.push(dataPtr);
			// ... set the CSS class name ...
			if (dataPtr.rowPtr.row) {
				// ... if the row was rendered ...
				dataPtr.rowPtr.row.addClass("sui-lv-row-selected");
			}
			// ... call the onselection changed event handler ...
			this.callListener("onSelectionChange");
			// ... and set the selection marker to true
			dataPtr.rowPtr.sel = true;
		}

	},

	/* For a range selection with shift we need a to remember the first
	 * selected row in a multiple selection.
	 */
	_setMultiSelStartRow: function(ctrl, shift) {

		// shift or ctrl key was pressed ...
		if (this._multiselect && (ctrl || shift)) {
			// ... and this._multiSelStartRow is not yet set ...
			if (!this._multiSelStartRow) {
				// ... remember the first row in a multiple selection, we use
				// that as the first row for a range selection with the shift
				// key
				this._multiSelStartRow = this._focussedRow;
			}
		} else  {
			// ... no multiple select so clear the row
			   this._multiSelStartRow = null;
		}
	},

	/* Set the cell title if the contents of the cell did overflow
	 */
	_setTitleOnOverflow: function(cell) {
		var of = cell.el().clientWidth - cell.el().scrollWidth;
		cell.el().title = of >= 0 ? "" : cell.text().replace(/<[^>]+>/g,"");
	},

	/* Set the sort direction and header icon and sort the data.
	 */
	_sortColumn: function(column) {

		// if the requested column to sort is different that the current
		// sorted column ...
		if (column !== this._sortCol) {
			// ... clear the sort icon from the current column header ...
			if (this._sortCol) {
				this._sortCol.header.el().style.backgroundImage = "";
			}
			// ... set the sort direction to asc ...
			this._sortUp = true;
			// .. set the current sort column the requested one
			this._sortCol = column;
		} else {
			// ... else just reverse the search direction
			this._sortUp = !this._sortUp;
		}

		// now sort the data based on the requested column
		this._sort();
		// and redraw the listview
		this.draw();
	},

	/* Set the sort icon on the header and sort the data
	 */
	_sort: function() {

		// get the key of the data-column
		var k = this._sortCol.key;
		// and the search direction
		var d = this._sortUp ? 1 : -1;

		// set the header icon for the sort
		this._sortCol.header.el().style.backgroundImage = this._sortUp
			? "url("+SUI.imgDir+"/"+SUI.resource.lvSortUp+")"
			: "url("+SUI.imgDir+"/"+SUI.resource.lvSortDown+")";

		// and hide all row data (if the row was rendered)
		for (var i=0; i<this.data.length; i++) {
			if (this.data[i].rowPtr.row) {
				this.data[i].rowPtr.row.el().style.display="none";
			}
		}

		// now sort the data using the specified method
		if ("text" === this._sortCol.sort) {
			// text sort: sort data with a case insensitive comparison method
			this.data.sort(
				function(a, b) {
					var aa = String(a[k]);
					var bb = String(b[k]);
					return d * (
						aa.toLowerCase() < bb.toLowerCase() ? -1 :
						aa.toLowerCase() > bb.toLowerCase() ? 1 : 0
					);
				}
			);
		} else if ("number" === this._sortCol.sort) {
			// number sort: sort data with a number comparison method
			this.data.sort(
				function(a, b) {
					return d*(a[k] - b[k]);
				}
			);
		} else {
			// user sort: sort data with a user provided comparison method
			this._sortCol.sort(this.data, k, d);
		}

		// scroll the currently focussed row into view
		this._scrollIntoView(this._focussedRow);
	},

	/* Process space key.
	 */
	_toggleSelection: function(keyCode, ctrl) {

		// only relevant when multiple selection is on and there is a focussed
		// row and ctrl is pressed
		if (this._multiselect && this._focussedRow && ctrl) {

			// if the focussed row is selected ...
			if (this._focussedRow.rowPtr.sel) {
				// ... then deselect it ...
				this._deSelectRows(this._focussedRow);
			} else {
				// ... else select it
				this._selectRow(this._focussedRow);
			}

			// disable key processing by the browser
			  return false;
		}

		// enable key processing by the browser
		return true;
	}

});
