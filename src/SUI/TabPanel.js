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
 * $Id: TabPanel.js 786 2013-08-09 13:26:51Z geert $
 */

"use strict";

SUI.TabPanel = SUI.defineClass(
	/** @lends SUI.TabPanel.prototype */{

	/** @ignore */ baseClass: SUI.Box,

	/**
	 * @class
	 * SUI.TabPanel is a component that helps you to save space by stacking a
	 * number of panels/boxes and let the user swap them by clicking on the
	 * tabs. A SUI.TapPanel can host a number of SUI boxes, each of them has
	 * a tab with a title for the user to identify and select them.
	 * TODO: create a separate Tab class
	 *
	 * @augments SUI.Box
	 *
	 * @description
	 * Construct a SUI.TabPanel object. The titles of the tabs and  (optional)
	 * the client boxes are given as argument to this constructor.
	 * It is also possible to select the initial tab.
	 *
	 * @constructs
	 * @param see base class
	 * @param {object[]} items An object array containing objects with the
	 *    following members:
	 * @param {String} items[].title Tab title
	 * @param {SUI.Box} items[].box A client box (optional)
	 * @param {int} selected Index of tab that should be selected initially
	 *      (optional)
	 * @exception {String} If there is no valid initial selection for the
	 *     default client area
	 */
	initializer: function(arg) {

		// anchors default to all sides
		if (!arg.anchor) {
			arg.anchor = {left:true,right:true,top:true,bottom:true};
		}

		SUI.TabPanel.initializeBase(this, arg);

		if (arg.onSelectTab) {
			this.addListener("onSelectTab", arg.onSelectTab);
		}

		// create the boxes for the tab panel and add the event handlers
		this._buildControl(arg);
	},

	/**
	 * Padding of the content on the tab.
	 */
	PANEL_PADDING: 4,

	/**
	 * Border width of the line under the tab strip.
	 */
	TAB_BORDER_BOTTOM_WIDTH: 1,

	/**
	 * Border width of the lines of the tab.
	 */
	TAB_BORDER_WIDTH: 1,

	/**
	 * Height of the highlight strip on top of a selected tab.
	 */
	TAB_HILIGHT_HEIGHT: 5,

	/**
	 * Top margin of unselected tabs.
	 */
	TAB_MARGIN_TOP: 3,

	/**
	 * Height of the tab bar (including bottom border).
	 */
	TABBAR_HEIGHT : 29,

	/**
	 * Top padding of the text in the tabs.
	 */
	TABTEXT_PADDING_TOP: 5,

	/**
	 * Left padding of the text in the tabs.
	 */
	TABTEXT_PADDING_LEFT: 7,

	/**
	 * Left position of the image in a scroller button.
	 */
	SCROLL_IMG_PADDING_LEFT: 1,

	/**
	 * Top position of the image in a scroller button.
	 */
	SCROLL_IMG_PADDING_TOP: 5,

	/**
	 * Width of a the scroller button.
	 */
	SCROLLER_WIDTH: 20,

	/**
	 * Margin top of the selected tab.
	 */
	SELTAB_MARGIN_TOP: 0,

	/**
	 * Add a box to one of the client areas of the control.
	 * @param {SUI.Box} child The box to add to the control
	 * @param {int} i Index position of the client container to at the box to
	 */
	add: function(child, i) {
		this._tabs[i].content.add(child);
	},

	/**
	 * Display the tab panel control. Set the CSS size and position of the tabs
	 * and the currently displayed content panel.
	 */
	display: function() {

		if (this.width() <=0 || this.height() <=0) {
			return;
		}

		this.setDim();

		// set the CSS dimensions of the header
		this.tabstripvpt.setDim();
		this.tabstrip.setDim();

		// set the CSS dimensions of the tabs
		for (var i=0; i<this._tabs.length; i++) {
			this._tabs[i].tab.setDim();
			this._tabs[i].tabtext.setDim();
		}

		// set the CSS dimensions of the client area and its contents
		this.clientArea.setDim();
		this._selectedTab.content.display();

		// set the CSS dimensions of the tab highlight and the scrollers
		this.highlight.setDim();
		this.scrollRight.setDim();
		this.scrollLeft.setDim();
	},

	/**
	 * Lay out the tab panel control. Calculate the size and position of the
	 * tabs and client area.
	 */
	layOut: function() {

		// set the size of the tabstrip viewport
		this.tabstripvpt.setRect(0, 0, this.width(), this.TABBAR_HEIGHT);

		// set the size of the client area
		this.clientArea.setRect(this.TABBAR_HEIGHT, 0, this.width(),
			this.height()-this.TABBAR_HEIGHT);

		for (var i=0,l=0; i<this._tabs.length; i++) {

			// set the left and width of the tab
			this._tabs[i].tab.left(l);
			this._tabs[i].tab.width(this._tabs[i].textLength +
				2 * this.TABTEXT_PADDING_LEFT + 2 * this.TAB_BORDER_WIDTH);

			// set the size and position of the text box
			this._tabs[i].tabtext.setRect(
				this.TABTEXT_PADDING_TOP, this.TABTEXT_PADDING_LEFT,
				this._tabs[i].textLength, this._tabHeight()
				- this.TABTEXT_PADDING_TOP - this.TAB_BORDER_WIDTH);

			// set the size and position of the content container
			this._tabs[i].content.setRect(0,0,
				this.clientArea.clientWidth(), this.clientArea.clientHeight());

			// it this is the currently selected tab ...
			if (this._selectedTab === this._tabs[i]) {
				// ... layout the selected tab ...
				this._layOutSelectedTab(this._selectedTab);
				// ... and layout the the tab's contents
				this._tabs[i].content.layOut();
			} else {
				// ... else do the normal tab layout
				this._layOutNormalTab(this._tabs[i]);
			}

			// get the left of the next tab
			l += this._tabs[i].tab.width()-this.TAB_BORDER_WIDTH;
		}

		// set the width of the tab strop
		this.tabstrip.setRect(0, 0, l+this.TAB_BORDER_WIDTH,
			this.TABBAR_HEIGHT);

		// check if we need to draw scroller buttons ...
		if (this.tabstripvpt.width() < this.tabstrip.width()) {

			// ... yes: show the scrollers ...
			this.scrollRight.el().style.display = "block";
			this.scrollLeft.el().style.display = "block";

			// ... set their sizes and positions ...
			this.scrollRight.setRect(this.TAB_MARGIN_TOP,
				this.width() - this.SCROLLER_WIDTH, this.SCROLLER_WIDTH,
				this.TABBAR_HEIGHT - this.TAB_MARGIN_TOP);
			this.scrollLeft.setRect(this.scrollRight);
			this.scrollLeft.left(this.scrollLeft.left()
					- this.SCROLLER_WIDTH + this.TAB_BORDER_WIDTH);

			// ... add some extra width for the scrollers ...
			this.tabstrip.width(this.tabstrip.width()
				+ this.SCROLLER_WIDTH * 2);
			// ... and enable the scrollers.
			this._enableScrollers();

		} else {

			// ... no: hide the scrollers ...
			this.scrollRight.el().style.display = "none";
			this.scrollLeft.el().style.display = "none";
			// ... and the width of the tabstrip to its viewport
			this.tabstrip.width(this.tabstripvpt.width());
		}
	},

	/**
	 * onSelectTab event handler: is executed when the user clicks on a tab.
	 */
	onSelectTab: function() {
	},

	/**
	 * Get the top, left, right and bottom offset of the client area
	 * relative to the outer dimensions of the tab panel.
	 */
	clientAreaPosition: function() {
		return {
			top: this.TABBAR_HEIGHT + this.clientArea.border().top
				+ this.clientArea.padding().top,
			left: this.clientArea.border().left
				+ this.clientArea.padding().left,
			right: this.clientArea.border().right
				+ this.clientArea.padding().right,
			bottom: this.clientArea.border().bottom
				+ this.clientArea.padding().bottom
		};
	},

	/**
	 * Set or get the selected tab.
	 * @param {Object} tab (optional) the tab to set the selected tab to.
	 * @return {Object} the selected tab (null if method was used as setter)
	 */
	selectedTab: function(tab) {
		return tab !== undefined ? (this._selectedTab = tab) && null
			: this._selectedTab;
	},

	/**
	 * Set or get the index of the selected tab.
	 * @param {int} i (optional) the index to set the index of the selected
	 *    tab to.
	 * @return {int} the index of the selected tab (null if method was used
	 *    as setter)
	 */
	selectedTabIndex: function(i) {
		return i !== undefined
			? (this._selectedTab = this._tabs[i]) && null
			: this._tabs.indexOf(this._selectedTab);
	},

	/**
	 * Select a tab. Set the selected tab call the onSelectTab listener and
	 * draw it. Note: this method is probably most usefull when overriding, not
	 * to call it on a tab object directly.
	 * @param {Object} tab Tab to select
	 */
	selectTab: function(tab) {
		this._selectedTab = tab;
		this.callListener("onSelectTab", tab);
		this.draw();
	},

	// reference to the the selected tab
	_selectedTab: null,

	/* Add the onclick event handler on the tab
	 */
	_addOnClickTab: function(tab) {
		var that = this;
		// 'that' and 'tab' are two closure variables
		SUI.browser.addEventListener(tab.tab.el(), "click",
			function(e) {
				if (!that.selectTab(tab)) {
					SUI.browser.noPropagation(e);
				}
			}
		);
	},

	/* Make all required boxes for the control, set the CSS styles and add
	 * the event handlers.
	 */
	_buildControl: function(arg) {

		// start with an empty tab list
		this._tabs = [];

		// add the CSS class to the main box
		this.addClass("sui-tp-tabpanel");

		// create a viewport to scroll the tab strip
		this.tabstripvpt = new SUI.Box({parent: this});
		this.tabstripvpt.el().style.overflow = "hidden";
		this.tabstripvpt.addClass("sui-tp-tabstripvpt");

		// create the tap strip and add it to the viewport
		this.tabstrip = new SUI.Box({parent: this.tabstripvpt});
		this.tabstrip.border(
		 new SUI.Border(0, 0, this.TAB_BORDER_BOTTOM_WIDTH, 0));
		this.tabstrip.addClass("sui-tp-tabstrip");

		// create the content area to host the tab containers
		this.clientArea = new SUI.Box({parent: this});
		this.clientArea.addClass("sui-tp-border");
		this.clientArea.border(
		 new SUI.Border(0, this.TAB_BORDER_WIDTH, this.TAB_BORDER_WIDTH));
		this.clientArea.padding(
			new SUI.Padding(arg.panelMargin || this.PANEL_PADDING));

		// read in the items form the arguments object and store them in
		// a standardized way in the tabs list
		for (var i=0; i<arg.tabs.length; i++) {

			// start with a default profile
			var tab = {
				title: "Item "+i,
				box: null
			};
			for (var prop in arg.tabs[i]) {
				// and overwrite the tabault profile with the entries set
				// in the arguments
				if (arg.tabs[i].hasOwnProperty(prop)) {
					tab[prop] = arg.tabs[i][prop];
				}
			}

			// create boxes for the tab and set the event handler
			this._createTab(tab);

			// is this the selected tab ...
			if (i === arg.selected) {
				// ... yes, then select it
				this._selectedTab = tab;
			}

			this._tabs.push(tab);

			// if there is already content, then add it to the container
			if (tab.box) {
				this.add(tab.box, i);
			}
		}

		// create a little box on top of the tab to serve as highlight
		this.highlight = new SUI.Box({parent: this.tabstripvpt});
		this.highlight.border(
			new SUI.Border(this.TAB_BORDER_WIDTH));
		this.highlight.addClass("sui-tp-tabhighlight");

		// if no selected tab was given in the arguments ...
		if (!this._selectedTab && this._tabs.length) {
			// ... set the currently selected tab to first
			this._selectedTab = this._tabs[0];
		}

		if (!this._selectedTab) {
			throw "SUI.TabPanel: index for selected tab out of range";
		}

		// add the to scrollers that are needed of there are too many tabs
		// for the available width
		this.scrollLeft = this._createScroller(
			SUI.resource.tpScrollLeft, this._scrollLeft);
		this.scrollRight = this._createScroller(
			SUI.resource.tpScrollRight, this._scrollRight);

	},

	/* Create boxes for the tab and set the event handlers.
	 */
	_createTab: function(tab) {

		// create the tab
		tab.tab = new SUI.Box({parent: this.tabstripvpt});
		tab.tab.addClass("sui-tp-tab");
		tab.tab.border(new SUI.Border(this.TAB_BORDER_WIDTH,
		 this.TAB_BORDER_WIDTH, 0, this.TAB_BORDER_WIDTH));

		// store the length of the text on the tab
		tab.textLength = SUI.style.textLength(tab.title);

		// create a box for the tab text
		tab.tabtext = new SUI.TextBox({
			parent: tab.tab,
			text: tab.title
		});

		// create the content container for the tab
		tab.content = new SUI.AnchorLayout({parent: this.clientArea});
		tab.content.addClass("sui-tp-tabcontent");
		tab.content.el().style.overflow = "auto";
		tab.content.el().style.backgroundColor = "transparent";
		tab.content.el().style.display = "none";

		// add the onclick event handler for the tab
		this._addOnClickTab(tab);
	},

	/* Create a scroller button that is needed to scroll the tap strip
	 * if there are too many tabs for the available space.
	 */
	_createScroller: function(icon, fn) {

		// 'that' and 'fn' are the two closure variables
		var that = this;

		// create a box for the scroller
		var scroller = new SUI.Box({parent: this});
		scroller.addClass("sui-tp-scroller");
		scroller.border(new SUI.Border(this.TAB_BORDER_WIDTH,
		 this.TAB_BORDER_WIDTH, this.TAB_BORDER_BOTTOM_WIDTH));

		// and append an icon to it
		var img = document.createElement("IMG");
		img.src = SUI.imgDir + "/" + icon;
		img.style.marginTop = this.SCROLL_IMG_PADDING_TOP + "px";
		img.style.marginLeft = this.SCROLL_IMG_PADDING_LEFT + "px";
		scroller.el().appendChild(img);

		// add a handler to the onclick event of the box
		SUI.browser.addEventListener(scroller.el(), "click",
			function(e) {
				if (!fn.call(that)) {
					SUI.browser.noPropagation(e);
				}
			}
		);

		return scroller;
	},

	/* Enable the scrollers depending on the current scroll position
	 * of the tab strip in its viewport.
	 */
	_enableScrollers: function() {

		// if there is a left scroll offset enable the left scroller
		if (this.tabstripvpt.el().scrollLeft) {
			this.scrollLeft.removeClass("sui-tp-scroller-disabled");
		} else {
			this.scrollLeft.addClass("sui-tp-scroller-disabled");
		}

		// compare the distance of the left scroller with the right of
		// the last tab. If it is smaller enable the right scroller
		if (this._tabRight(this._tabs[this._tabs.length-1])
				< this._leftScrollerLeft()) {
			// ... disable the scroller
			this.scrollRight.addClass("sui-tp-scroller-disabled");
		} else {
			this.scrollRight.removeClass("sui-tp-scroller-disabled");
		}
	},

	/* Lay out a normal tab
	 */
	_layOutNormalTab: function(tab) {
		// Remove CSS class
		tab.tab.removeClass("sui-tp-tabselected");
		// set the dimensions
		tab.tab.setRect(this.TAB_MARGIN_TOP, tab.tab.left(), tab.tab.width(),
			this._tabHeight());
		tab.tabtext.top(this.TABTEXT_PADDING_TOP);
		// hide the tab content and highlight bar
		tab.content.el().style.display = "none";
	},

	/* Lay out a a selected tab
	 */
	_layOutSelectedTab: function(tab) {
		// Add CSS class
		tab.tab.addClass("sui-tp-tabselected");
		// set the dimensions
		tab.tab.setRect(this.SELTAB_MARGIN_TOP, tab.tab.left(),
			tab.tab.width(), this.TABBAR_HEIGHT - this.SELTAB_MARGIN_TOP);
		tab.tabtext.top(this.TABTEXT_PADDING_TOP + this.TAB_MARGIN_TOP
			- this.SELTAB_MARGIN_TOP);
		// show the tab content and highlight bar
		tab.content.el().style.display = "block";
		// set the tab highlight
		this.highlight.setRect(tab.tab);
		this.highlight.height(this.TAB_HILIGHT_HEIGHT);
	},

	/* Get the distance of the left scroller to the left side of the component.
	 */
	_leftScrollerLeft: function() {
		return this.tabstripvpt.el().scrollLeft + this.scrollLeft.left();
	},

	/* Scroll one tab to the left.
	 */
	_scrollLeft: function() {

		// find the tab of which the right side is larger or equeal to the left
		// side of the left scroller
		for (var i=0; i<this._tabs.length; i++) {
			if (this._tabRight(this._tabs[i]) >= this._leftScrollerLeft()) {
				break;
			}
		}

		// set the scroll-left of the vieport so that found tab's left
		// equals the left of the scroller
		this.tabstripvpt.el().scrollLeft = this._tabs[i].tab.left()
			- this.scrollLeft.left() + this.TAB_BORDER_WIDTH;

		this._enableScrollers();
	},

	/* Scroll one tab to the right.
	 */
	_scrollRight: function() {

		// find the tab of which the right side is further that the left
		// side of the left scroller
		for (var i=0; i<this._tabs.length-1; i++) {
			if (this._tabRight(this._tabs[i]) > this._leftScrollerLeft()) {
				break;
			}
		}

		// set the scroll-left of the viewport so that the found tab will
		// be adjacent to the left scroller
		this.tabstripvpt.el().scrollLeft =
			this._tabRight(this._tabs[i]) - this.scrollLeft.left();

		this._enableScrollers();
	},

	/* Height of an unselected tab (including top border but excluding bottom
	 * border)
	 */
	_tabHeight: function() {
		return this.TABBAR_HEIGHT - this.TAB_BORDER_BOTTOM_WIDTH
			 - this.TAB_MARGIN_TOP;
	},

	/* Get the position of the right side of a tab.
	 */
	_tabRight: function(tab) {
		return tab.tab.left() + tab.tab.width();
	}

});
