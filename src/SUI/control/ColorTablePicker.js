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
 * $Id: ColorTablePicker.js 786 2013-08-09 13:26:51Z geert $
 */

"use strict";

SUI.control.ColorTablePicker = SUI.defineClass(
	/** @lends SUI.control.ColorTablePicker.prototype */{

	/** @ignore */ baseClass: SUI.AnchorLayout,

	/**
	 * @class
	 * SUI.control.ColorTablePicker is a control that lets you select colors by
	 * pointing them out in color table. The color table needs to be provided
	 * when constructing the control.
	 *
	 * @augments SUI.AnchorLayout
	 *
	 * @description
	 * Create a color table picker control.
	 *
	 * @constructs
	 * @param see base class
	 * @param {string[]} arg.table The color table data: an array (1D) of
	 *    color codes.
	 * @param {int} arg.rows The number of rows in the color table
	 * @param {int} arg.colums The number of columns in the color table
	 * @param {Function} arg.onChange Listener function that is executed
	 *    each time the control's color selection changes.
	 */
	initializer: function(arg) {

		SUI.control.ColorTablePicker.initializeBase(this, arg);

	 // Set the size of the control
		this.width(this.WIDTH);
		this.height(this.HEIGHT);

		// create the color table ...
		var tab = this._buildColorTable(
		 arg.table || ["#FFF","#B00","#000"],
			180 - this.PADDING,
			this.HEIGHT - 2*this.PADDING,
			arg.rows || 1,
			arg.columns || 3
		);
		// ... and postion it on the control
		tab.style.marginTop = this.PADDING + "px";
		tab.style.marginLeft = this.PADDING + "px";
		this.el().appendChild(tab);

		var top = this.PADDING;

	 // move to 4th row
		top += 3*this.ROW_HEIGHT;

		// create an box and label for the HTML color code
		this._boxCode = new SUI.TextBox({
			width: this.COLBOX_WIDTH,
			right: this.PADDING,
			height: this.COLBOX_HEIGHT,
			top: top+2,
			anchor: {right: true}
		});
		this._boxCode.el().style.textAlign = "right";
		this._boxCode.el().style.fontFamily = "mono";
		this._lblCode = new SUI.form.Label({
			width: this.LABEL_WIDTH,
			left: this.LABEL_LEFT,
			top: top,
			title: SUI.i18n.hsvCode
		});

		// move to next row
		top += this.ROW_HEIGHT;

		// create a colored box and label to display the color
		this._boxCol = new SUI.Box({
			width: this.COLBOX_WIDTH,
			height: this.COLBOX_HEIGHT,
			right: this.PADDING,
			top: top,
			anchor: {right: true}
		});
		this._boxCol.border(new SUI.Border(1));
		this._boxCol.el().style.borderColor = "black";
		this._lblColor = new SUI.form.Label({
			width: this.LABEL_WIDTH,
			left: this.LABEL_LEFT,
			top: top,
			title: SUI.i18n.hsvColor
		});

		// set the onChange listener
		if (arg.onChange) {
		 this.addListener("onChange", arg.onChange);
		}

		// now add all components to the control's container box
		this.add(this._lblCode);
		this.add(this._lblColor);
		this.add(this._boxCode);
		this.add(this._boxCol);

		// set the default color of the control
		this.colorCode(this._color);
	},

	/**
	 * The height of the boxes in which the color an HTML color code are shown.
	 */
	COLBOX_HEIGHT: 20,

	/**
	 * The Width of the boxes in which the color an HTML color code are shown.
	 */
	COLBOX_WIDTH: 64,

	/**
	 * The total height of the control.
	 */
	HEIGHT: 158,

	/**
	 * The left position of the labels.
	 */
	LABEL_LEFT: 200,

	/**
	 * The width of the labels.
	 */
	LABEL_WIDTH: 100,

	/**
	 * The padding of the control.
	 */
	PADDING: 15,

	/**
	 * The row height for the rows with hue, saturation, value and color boxes.
	 */
	ROW_HEIGHT: 27,

	/**
	 * The total width of the control.
	 */
	WIDTH: 335,

	/**
	 * Set or get the HTML color code selection of the control.
	 * @param {String} val An HTML color code (#FF7700), or none to get the
	 *    current color selection from the control.
	 * @return {String} An HTML color code (#FF7700), if no argument was given
	 *    this method acts as a getter and value will be returned.
	 */
	colorCode: function(val) {
	 if (val == undefined) {
			return this._color;
	 }
	 // got here? the method is a setter
		this._color = SUI.color.colToCol(val);
		this._boxCode.text(this._color.toUpperCase());
		this._boxCol.el().style.backgroundColor = this._color;

		return null;
	},

	// box to display the selected color
	_boxCol: null,

	// box to display the color code
	_boxCode: null,

	// the color picker's color selection
	_color: "#CCCCCC",

	// label for color code input field
	_lblCode: null,

	// label for the color display box
	_lblColor: null,

	// constuct a HTML table cotaining the colors given in the color map
	_buildColorTable: function(t, w, h, r, c) {
	 var that = this;

		// construct a table
		var table = document.createElement("TABLE");
		table.cellSpacing = 0;
		table.cols = t[0].length;
		table.width = w;
		table.height = h;
		table.style.width = w+"px";
		table.style.height = h+"px";
		table.style.borderTop = "solid black 1px";
		table.style.borderLeft = "solid black 1px";

		// append rows ...
		for (var i=0; i<r; i++) {
			var row = document.createElement("TR");
			table.appendChild(row);
			// ... and columns
			for (var j=0; j<c; j++) {
				var td = document.createElement("TD");
				row.appendChild(td);
				// add empty span for IE 7
				td.appendChild(document.createElement("SPAN"));
				// set the cell style ...
				td.style.cursor = "pointer";
				td.style.backgroundColor = t[c*i + j];
				td.style.borderBottom = "solid black 1px";
				td.style.borderRight = "solid black 1px";
				// ... and onclick event handler
				SUI.browser.addEventListener(td, "click",
				 function(e) {
					 if (!that._selTableColor(new SUI.Event(this, e))) {
					   SUI.browser.noPropagation(e);
					 }
				 }
				);
			}
		}
		// return the table element
		return table;
	},

	// set the color code and notify the onChange listener
	_selTableColor: function(e) {
		this.colorCode(e.elListener.style.backgroundColor);
		this.callListener("onChange", this._color);
	}

});
