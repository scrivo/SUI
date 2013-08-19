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
 * $Id: Calendar.js 786 2013-08-09 13:26:51Z geert $
 */

"use strict";

SUI.dialog.Calendar = SUI.defineClass(
	/** @lends SUI.dialog.Calendar.prototype */{

	/** @ignore */ baseClass: SUI.dialog.OKCancelDialog,

	/**
	 * @class
	 * SUI.dialog.Calendar is a class to display a date/time dialog. Depending
	 * of the given arguments a date, time or datetime selection box is shown.
	 *
	 * @augments SUI.dialog.OKCancelDialog
	 *
	 * @description
	 * Show a modal dialog for date and/or time selection.
	 *
	 * @constructs
	 * @param see base class
	 * @param {boolean} arg.iso Use the ISO 8601 week day system
	 *     (true/default) or or the American (false) style
	 * @param {Date} arg.date Initial date selection
	 * @param {String} arg.type Type of the dialog "time", "date" (default)
	 *     or "datetime"
	 */
	initializer: function(arg) {

		SUI.dialog.Calendar.initializeBase(this, arg);

		// use iso unless told not to
		this.iso = arg.iso === undefined ? true : arg.iso;

		// get the initial date
		this._selDate = arg.date || new Date();

		// display the calendar for the selected month and year
		this._monthYear = this._selDate;

		// should we need draw a date or time box or both
		if (arg.type == "datetime") {
			this._type = 3;
		} else if (arg.type == "time") {
			this._type = 1;
		} else {
			this._type = 2;
		}

		// set the appropriate caption
		var t = SUI.i18n.captionDate;
		if (this._type ==- 3) {
			t = SUI.i18n.captionDatetime;
		} else if (this._type == 1) {
			t = SUI.i18n.captionTime;
		}
		this.caption(t);

		// if we have a date box also initialize the date scrolling actions
		if (this._type & 2) {
		 this._initCalendarActions();
		}
	},

	/**
	 * Border width of borders around cells
	 */
	BORDER_WIDTH: 1,

	/**
	 * (Standard) width of the calendar cells (including margin)
	 */
	BOX_WIDTH: 26,

	/**
	 * (Standard) height of the calendar cells (including margin)
	 */
	BOX_HEIGHT: 20,

	/**
	 * Margin between cells
	 */
	BOX_MARGIN: 2,

	/**
	 * Size of the date navigation buttons
	 */
	BUTTON_SIZE: 22,

	/**
	 * A little extra margin around the month calendar to give more space to
	 * the navigation bar
	 */
	BUTTON_EXTRA_SIDE_MARGIN: 1,

	/**
	 * Margin of the month calendar
	 */
	DATE_MARGIN: 7,

	/**
	 * Height of the date navigation bar or the time header
	 */
	HEADER_HEIGHT: 23,

	/**
	 * Top of text in the header
	 */
	HEADER_TEXT_TOP: 3,

	/**
	 * fraction to calculate width for the month and year scrollers
	 */
	HEADER_SPLIT_AT: .533,

	/**
	 * Width of the margin between the date and time box
	 */
	SPLIT_MARGIN: 10,

	/**
	 * Side margins of the time box (when there is no date box)
	 */
	TIME_SIDE_MARGIN: 24,

	/**
	 * Bottom margin of the time box
	 */
	TIME_BOTTOM_MARGIN: 5,

	/**
	 * Top margin of the date an time boxes
	 */
	TOP_MARGIN: 1,

	/**
	 * Return the form's selected value
	 */
	formToData: function() {
		this.close();
	 return this._selDate;
	},

	/**
	 * Show the calendar dialog centered on the screen
	 */
	show: function() {
		this._drawCalendar();
		this._setDialogSize();
		this.center();
		SUI.dialog.Calendar.parentMethod(this, "show");
	},

	// reference to the box with the date selector
	_dateBox: null,

	// month and year of the currently displayed calendar page
	_mohthYear: null,

	// currently selected date
	_selDate: null,

	// reference to the box with the time selector
	_timeBox: null,

	// binary selector 1 time, 2 date, 3 datetime
	_type: true,

	// add a CSS mouseover hover on a calender cell
	_addHovers: function(cell) {
	 // set a CSS class on mouseover
		SUI.browser.addEventListener(cell.el(), "mouseover",
		 function(e) {
				if (!cell.addClass("sui-cal-day-hover")) {
					SUI.browser.noPropagation(e);
				}
			}
		);
	 // remove a CSS class on mouseout
		SUI.browser.addEventListener(cell.el(), "mouseout",
		 function(e) {
			 if (!cell.removeClass("sui-cal-day-hover")) {
			   SUI.browser.noPropagation(e);
			 }
		 }
		);
	},

	// set the _selectDate handler to the onclick of a cell
	_addSelectDate: function(cell, val) {
	 var that = this;
		SUI.browser.addEventListener(cell.el(), "click",
		 function(e) {
		   if (!that._selectDate(val)) {
			  SUI.browser.noPropagation(e);
		   }
			}
		);
	},

	// set the _selectHour handler to the onclick of a cell
	_addSelectHour: function(cell, val) {
	 var that = this;
		SUI.browser.addEventListener(cell.el(), "click",
		 function(e) {
		   if (!that._selectHour(val)) {
			  SUI.browser.noPropagation(e);
		   }
			}
		);
	},

	// set the _selectMinutes handler to the onclick of a cell
	_addSelectMinutes: function(cell, val) {
	 var that = this;
		SUI.browser.addEventListener(cell.el(), "click",
		 function(e) {
		   if (!that._selectMinutes(val)) {
			  SUI.browser.noPropagation(e);
		   }
			}
		);
	},

	// construct a date calendar box in which the user can select a date
	_buildDateBox: function() {

	 var date = this._monthYear;

		// create a new box for the month table
		var cont = new SUI.Box({
			width: 8 * this.BOX_WIDTH + this.BOX_MARGIN +
				2 * this.BUTTON_EXTRA_SIDE_MARGIN,
			height: this.HEADER_HEIGHT + 7 * this.BOX_HEIGHT +
				this.BUTTON_EXTRA_SIDE_MARGIN
		});

		// add the navigation header to the box
		this._drawDateNavigation(cont);

		// set top and left position for drawing the week-day headers
		var l = this.BUTTON_EXTRA_SIDE_MARGIN;
		var t = this.HEADER_HEIGHT-this.BOX_MARGIN;

		// start with the week number header
		var dv = new SUI.TextBox({
		 parent: cont,
		 text: SUI.i18n.weekShort,
		 top: t + this.BOX_MARGIN,
		 left: l + this.BOX_MARGIN,
		 width: this.BOX_WIDTH - this.BOX_MARGIN,
		 height: this.BOX_HEIGHT - this.BOX_MARGIN,
		 border: new SUI.Border(this.BORDER_WIDTH),
		 padding: new SUI.Padding(0, 0, 0, this.BOX_MARGIN)
	 });
		dv.addClass("sui-cal-header");
		dv.display();

		// move to the next column
		l += this.BOX_WIDTH;

		// now draw the week-day headers
		for (var i=0; i<SUI.i18n.arrDaysShort.length; i++) {

		 dv = new SUI.TextBox({
			 parent: cont,
				text: (this.iso) ? SUI.i18n.arrDaysShort[i]
					: SUI.i18n.arrDaysShort[i?i-1:6],
			 top: t + this.BOX_MARGIN,
			 left: l,
			 width: this.BOX_WIDTH,
			 height: this.BOX_HEIGHT - this.BOX_MARGIN,
			 border: new SUI.Border(this.BORDER_WIDTH),
			 padding: new SUI.Padding(0, 0, 0, this.BOX_MARGIN)
		 });
			dv.addClass("sui-cal-header");
			dv.display();

			// move to the next column
			l += this.BOX_WIDTH;
		}
		// move to the next row
		t += this.BOX_HEIGHT;

		this._drawMonthTable(cont, t, this.BUTTON_EXTRA_SIDE_MARGIN);

		return cont;
	},

	// construct a time table box in which the user can select a time
	_buildTimeBox: function(date) {

	 // create a box for the time table
		var cont = new SUI.Box({
		 width: 6 * this.BOX_WIDTH + this.BOX_MARGIN,
			height: 6 * this.BOX_HEIGHT + 2 * this.HEADER_HEIGHT
		});

		// create a box for the time table title
		var tm = new SUI.TextBox({
		 parent: cont,
		 top: this.HEADER_TEXT_TOP,
		 width: cont.width(),
		 height: this.HEADER_HEIGHT,
		 text: SUI.i18n.time
		});
		tm.el().style.textAlign = "center";

		// create a box for the table section of the time table
		var tt = new SUI.Box({
		 parent: cont,
		 top: this.HEADER_HEIGHT-this.BOX_MARGIN,
		 width: cont.width(),
		 height: this.BOX_HEIGHT*6
		});

		// draw the hours table
		this._drawHoursTable(tt);
		// draw the minutes table
		var selsecs = this._drawMinutesTable(tt, 4 * this.BOX_HEIGHT);

		// create a box for the the exact time row
		var et = new SUI.Box({
		 parent: cont,
		 top: 6 * this.BOX_HEIGHT + this.HEADER_HEIGHT,
		 left: 0,
		 width: cont.width()-this.BOX_MARGIN,
		 height: this.HEADER_HEIGHT
		});
		et.el().style.textAlign = "right";

		// the value for the minutes input field: don't use the multiples of 5
		var min = this._selDate.getMinutes();
		var v = (min % 5) ? min : "";

		// create a label for the input box
		var lbl = new SUI.form.Label({
		 title: SUI.i18n.exactMinutes+": ",
		 parent: et
		});
		lbl.el().style.position = "relative";

		// create the input box
		var inp = new SUI.form.Input({
		 width: this.BOX_WIDTH-2*this.BOX_MARGIN,
		 parent: et
		});
		inp.el().value = v;
		inp.el().style.position = "relative";

		// point the label to the input box
		lbl.forBox(inp);

		// set the handler to retrieve exact minutes input from the user
		var that = this;
		SUI.browser.addEventListener(inp.el(), "input",
		 function(e) {
			 if (!that._inputMinutes(inp.el().value, selsecs)) {
			   SUI.browser.noPropagation(e);
			 }
			}
		);

		// display the elements of the time table
		et.display();
		tt.display();
		tm.display();
		inp.display();

		return cont;
	},

	// draw the dialog content
	_drawCalendar: function() {

	 // if we need to draw a date box ...
		if (this._type & 2) {
		 // ... remove it if it was previously drawn
			if (this._dateBox) {
			 this._dateBox.removeBox();
			}
			// create a new date box
			this._dateBox = this._buildDateBox();
			this._dateBox.top(this.TOP_MARGIN);
			this._dateBox.left(this.DATE_MARGIN);
			this._dateBox.parent(this.clientPanel.clientBox());
			// and display it
			this._dateBox.display();
		}

	 // if we need to draw a time box ...
		if (this._type & 1) {
		 // ... remove it if it was previously drawn
			if (this._timeBox) {
				this._timeBox.removeBox();
			}
			// create a new time box
			this._timeBox = this._buildTimeBox();
			this._timeBox.top(this.TOP_MARGIN);
			// the left margin depends if there is a date box too
			this._timeBox.left(this._dateBox
				? this._dateBox.width() + this.DATE_MARGIN + this.SPLIT_MARGIN
			 : this.TIME_SIDE_MARGIN);
			this._timeBox.parent(this.clientPanel.clientBox());
			// and display it
			this._timeBox.display();
		}

	},

	// draw a bar with year and month scrollers and a button to go to the
	// current date
	_drawDateNavigation: function(cont) {

		// width of the navigation header
		var w = this.BOX_WIDTH * 8 + this.BOX_MARGIN +
			this.BUTTON_EXTRA_SIDE_MARGIN * 2;

		// object that holds the position of the toolbar buttons
		var pos = {
			"cal.prevm": 0,
			"cal.nextm": Math.ceil(w * this.HEADER_SPLIT_AT, 10) -
				this.BUTTON_SIZE,
			"cal.prevy": Math.ceil(w * this.HEADER_SPLIT_AT, 10),
			"cal.nexty": w - 2 * this.BUTTON_SIZE,
			"cal.today": w - this.BUTTON_SIZE
		};

		// set the positions and actions of the toolbar buttons
		for (var i in pos) {
			var b = new SUI.ToolbarButton({
				actionId: i,
			 left: pos[i],
				width: this.BUTTON_SIZE,
				height: this.BUTTON_SIZE
			});
			b.parent(cont);
			b.setAction(this._actionList);
			b.draw();
		}

		// create the month text box
		var m = new SUI.TextBox({
		 parent: cont,
		 text: SUI.i18n.arrMonths[this._monthYear.getMonth()],
			top: this.HEADER_TEXT_TOP,
		 left: this.BUTTON_SIZE,
			width: pos["cal.nextm"] - this.BUTTON_SIZE,
			height: this.HEADER_HEIGHT
		});
		m.el().style.textAlign = "center";
		m.display();

		// create the year text box
		var y = new SUI.TextBox({
		 parent: cont,
		 text: this._monthYear.getFullYear(),
			top: this.HEADER_TEXT_TOP,
		 left: pos["cal.prevy"] + this.BUTTON_SIZE,
			width: pos["cal.nexty"] - this.BUTTON_SIZE-pos["cal.prevy"],
			height: this.HEADER_HEIGHT
		});
		y.el().style.textAlign = "center";
		y.display();
	},

	// draw a table of 4 by 6 cells for the hours of the day
	_drawHoursTable: function(tt) {

		var l = 0;
		var t = 0;

		// 24 hours in 4 rows ...
		for (var i=0; i<4; i++) {
			l = 0;
			// ... of 6 cells
			for (var j=0; j<6; j++) {

			 // current hour
				var x = i*6+j;

				// get the style
				var st = "sui-cal-day";
				if (x == this._selDate.getHours() ) {
					st += " sui-cal-selected";
				}

				var dv = new SUI.TextBox({
				 parent: tt,
				 text: String(x),
				 top: t+this.BOX_MARGIN,
				 left: l+this.BOX_MARGIN,
				 width: this.BOX_WIDTH-this.BOX_MARGIN,
				 height: this.BOX_HEIGHT-this.BOX_MARGIN,
				 border: new SUI.Border(this.BORDER_WIDTH)
				});
				dv.addClass(st);
				dv.display();

				// add the event handlers (hover and onclick)
				this._addHovers(dv);
				this._addSelectHour(dv, x);

				// move to the next cell
				l += this.BOX_WIDTH;
			}
			// move to the next row
			t += this.BOX_HEIGHT;
		}

	},

	// draw a table of 2 by 6 cells for the minutes of the day
	_drawMinutesTable: function(tt, t) {

		var l = 0;
		var selsecs = null;

		// 12 increments of 5 minutes in 2 rows ...
		for (var i=0; i<2; i++) {
			l = 0;
			// ... of 6 cells
			for (var j=0; j<6; j++) {
			 // current minutes
				var x = (i*6+j)*5;
				// get the style
				var st = "sui-cal-weekend";
				if (x == this._selDate.getMinutes() ) {
					st += " sui-cal-selected";
				}
				// create zero padded variant of x
				var x1 = x<10 ? ":0"+x : ":"+x;

				var cm = new SUI.TextBox({
				 parent: tt,
				 text: x1,
				 top: t+this.BOX_MARGIN,
				 left: l+this.BOX_MARGIN,
				 width: this.BOX_WIDTH-this.BOX_MARGIN,
				 height: this.BOX_HEIGHT-this.BOX_MARGIN,
				 border: new SUI.Border(this.BORDER_WIDTH)
				});
				cm.addClass(st);
				cm.display();

				// add the event handlers (hover and onclick)
				this._addHovers(cm);
				this._addSelectMinutes(cm, x);

				if (x == this._selDate.getMinutes() ) {
					selsecs = cm;
				}
				// move to the next cell
				l+=this.BOX_WIDTH;
			}
			// move to the next row
			t += this.BOX_HEIGHT;
		}

		return selsecs;
	},

	// draw a table of x by 8 (week no and 7 days) cells for the days of
	// the month
	_drawMonthTable: function(cont, top, left) {

	 var date = this._monthYear;
	 // get a data structure containing the data for this month
		var cal = this._getCalendar(date, this.iso);

		for (var wn in cal) {

		 var l = left;

		 // draw the week number
		 var dv = new SUI.TextBox({
			 parent: cont,
			 text: wn,
			 top: top,
			 left: l + this.BOX_MARGIN,
			 width: this.BOX_WIDTH - this.BOX_MARGIN,
			 height: this.BOX_HEIGHT,
			 border: new SUI.Border(this.BORDER_WIDTH),
			 padding: new SUI.Padding(this.BOX_MARGIN, 0)
		 });
			dv.addClass("sui-cal-weekno");
			dv.display();

			// move to the next column
			l += this.BOX_WIDTH;

			for (var i=0; i<cal[wn].length; i++) {

			 // get the day we're drawing
			 var d = cal[wn][i];

			 // determine the CSS style, does it belong to the month?
			 if (d.getMonth() == date.getMonth()) {
					var st = "sui-cal-day";
				} else {
					var st = "sui-cal-otherday";
				}
			 // is it a day of the week or weekend ?
			 if (d.getDay() == 0 || d.getDay() == 6) {
					st += " sui-cal-weekend";
				}
			 // is it the selected day ?
			 if (d.getDate() == this._selDate.getDate() &&
					d.getMonth() == this._selDate.getMonth() &&
					d.getFullYear() == this._selDate.getFullYear()) {
					st += " sui-cal-selected";
				}

			 dv = new SUI.TextBox({
				 parent: cont,
				 text: d.getDate(),
				 top: top + this.BOX_MARGIN,
				 left: l + this.BOX_MARGIN,
				 width: this.BOX_WIDTH - this.BOX_MARGIN,
				 height: this.BOX_HEIGHT - this.BOX_MARGIN,
				 border: new SUI.Border(this.BORDER_WIDTH)
			 });
				dv.addClass(st);
				dv.display();

				// add the event handlers (hover and onclick)
				this._addHovers(dv);
				this._addSelectDate(dv, d);

				// move to the next column
				l += this.BOX_WIDTH;
			}
			// move to the next row
			top += this.BOX_HEIGHT;
		}

	},

	// Return a an object with week rows (each member name is a week no) in
	// which each row has 7 elements, each representing a weekday. The whole
	// array is representing a month. To render a calendar you'll just need
	// to loop through this array.
	_getCalendar: function(d, iso) {

		var m = d.getMonth();
		var y = d.getFullYear();

		// get the first day (ISO: Monday, American: Sunday) of the first week
		// of the year (start week numbering). ISO: the week with the fourth
		// of January, American the week with the first of January
		var x = this.iso ? 4 : 1;
		var w1 = new Date(y, 0, x);
		for (; w1.getDay() != this.iso ? 1 : 0; x--) {
			w1 = new Date(y, 0, x);
		}

		// get the first day (ISO: Monday, American: Sunday) of the first week
		// of current month
		x = 2;
		do {
		 x--;
		 var fd = new Date(y, m, x);
		} while (fd.getDay() != this.iso ? 1 : 0);

		// get the week number of the first week of the month
		var wn = Math.round((fd.getTime() - w1.getTime()) / 604800000) + 1;

		var cal = {};
		do {
		 // set the week array (wn is the week no) ...
			cal[wn] = [];
			// ... fill it with the save Date()'s of the week
			for (var i=0; i<7; i++) {
			 // store 'first day' ...
				cal[wn].push(fd);
				// ... and move to the next day
				x++;
				fd = new Date(y, m, x);
			}
			wn ++;
			// as long as we're in the current month
		} while (fd.getMonth() == m);

		return cal;
	},

	// Set the date scrolling actions: next/prev month, prev/next year and
	// current date. All actions set the _mohthYear value and display the
	// calendar based on that value. The current date selection also selects
	// the current date.
	_initCalendarActions: function() {

		var that = this;

		this._actionList = new SUI.ActionList([{
				actionId: "cal.prevm",
				icon: SUI.resource.calPrev,
				title: SUI.i18n.prevMonth,
				handler: function() {
			  // display the previous month
					that._monthYear = new Date(that._monthYear.getFullYear(),
						that._monthYear.getMonth()-1, 1);
					that._drawCalendar();
				}
			},{
				actionId: "cal.nextm",
				icon: SUI.resource.calNext,
				title: SUI.i18n.nextMonth,
				handler: function() {
			  // display the next month
					that._monthYear = new Date(that._monthYear.getFullYear(),
						that._monthYear.getMonth()+1, 1);
					that._drawCalendar();
				}
			},{
				actionId: "cal.prevy",
				icon: SUI.resource.calPrev,
				title: SUI.i18n.prevYear,
				handler: function() {
					// display the previous year
					that._monthYear = new Date(that._monthYear.getFullYear()-1,
						that._monthYear.getMonth(), 1);
					that._drawCalendar();
				}
			},{
				actionId: "cal.nexty",
				icon: SUI.resource.calNext,
				title: SUI.i18n.nextYear,
				handler: function() {
					// display the next year
					that._monthYear = new Date(that._monthYear.getFullYear()+1,
						that._monthYear.getMonth(), 1);
					that._drawCalendar();
				}
			},{
				actionId: "cal.today",
				icon: SUI.resource.calToday,
				title: SUI.i18n.goToday,
				handler: function() {
					// display and select the current date
					that._monthYear = that._selDate = new Date();
					that._drawCalendar();
				}
			}
		]);

	},

	// get the input from the user on exact minutes entry
	_inputMinutes: function(value, selsecs) {
	 // if a minutes cell was selected, remove the CSS class
		if (selsecs) {
			selsecs.removeClass("sui-cal-selected");
		}
		// try to get a valid value from user input ...
		var m = parseInt(value, 10);
		if (isNaN(m)) {
			m = 0;
		}
		m = m < 0 ? 0 : m > 59 ? 59 : m;
		// ... and use that to set the selected minutes
		this._selDate.setMinutes(m);
	},

	// set the dialog's date selection and redraw the calendar
	_selectDate: function(v) {
		this._selDate.setFullYear(v.getFullYear(), v.getMonth(), v.getDate());
		this._monthYear = this._selDate;
		this._drawCalendar();
	},

	// set the dialog's hour selection and redraw the calendar
	_selectHour: function(val) {
	 this._selDate.setHours(val);
	 this._drawCalendar();
	},

	// set the dialog's minutes selection and redraw the calendar
	_selectMinutes: function(val) {
	 this._selDate.setMinutes(val);
	 this._drawCalendar();
	},

	// determine the initial dialog size
	_setDialogSize: function() {

	 var w = 0;
		var h = 0;

		// if there's only a date box ...
		if (this._dateBox) {
		 // ... add the margins to get to dialog width an height
			w = this._dateBox.width() + 2 * this.DATE_MARGIN;
			h = this.TOP_MARGIN + this._dateBox.height() + this.DATE_MARGIN;
		}

		// if there is a time box ...
	 if (this._timeBox) {

	   // ... add the margins to the height of the box ...
			var h2 = this.TOP_MARGIN + this._timeBox.height()
			 + this.TIME_BOTTOM_MARGIN;
			// ... and use that if it is larger (isn't it always?)
			if (h2 > h) {
			 h = h2;
			}

			// if there is width set by the date box already ...
			if (w) {
			 // ... add date box like margins to the time box left to
				// get the dialog width ...
				w = this._timeBox.left() + this._timeBox.width()
				 + this.DATE_MARGIN + this.BUTTON_EXTRA_SIDE_MARGIN;
			} else {
			 // ... else add margins to the time box
			 w = this._timeBox.width() + 2 * this.TIME_SIDE_MARGIN;
			}
	 }

	 // set the dialogs client size
	 this.setClientWidth(w);
		this.setClientHeight(h);
	}

});
