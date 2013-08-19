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
 * $Id: Panel.js 786 2013-08-09 13:26:51Z geert $
 */

"use strict";

SUI.Panel = SUI.defineClass(
	/** @lends SUI.Panel.prototype */{

	/** @ignore */ baseClass: SUI.AnchorLayout,

	/**
	 * @class
	 * SUI.Panel a very straightforward implementation of a container. It is
	 * just a colored pane with an inner an outer border (all customizable)
	 * to which you can add other boxes. It is the standard background panel
	 * for most forms. Alternatively you can insert HTML of the client area of
	 * the panel directly.
	 * TODO: split this in a HTMLPanel and a Container Panel.
	 *
	 * @augments SUI.AnchorLayout
	 *
	 * @description
	 * Construct a SUI.Panel object. Actually nothing more than a
	 * SUI.AnchorLayout but with some extra cosmetical extras.
	 *
	 * @constructs
	 * @param see base class
	 * @param {SUI.Border} arg.innerBorder (optional) The inner border to use
	 * @param {String} arg.color A color code for the color of the client area
	 */
	initializer: function(arg) {

		SUI.Panel.initializeBase(this, arg);

		// set the style of the main panel
		this.addClass("sui-panel");

		// removing these breaks scrivo why?
		this.border(arg.border);
		this.padding(arg.padding);

		// create the inner (client) box and set the style
		this.inner = new SUI.Box({parent: this});
		this.inner.addClass("sui-panel-inner");
		if (arg.innerBorder) {
			this.inner.border(arg.innerBorder);
		}

		// if a color for the inner panel was given ...
		if (arg.color) {
			// ... the use that color
			this.inner.el().style.backgroundColor = arg.color;
		} else {
			// ... else use the system default style
			this.inner.addClass("sui-panel-gradient");
		}
	},

	/**
	 * Add an box to the panel.
	 * @param {SUI.AnchorLayout} child box to add
	 */
	add: function(child) {
		// add the child to the inner box
		SUI.Panel.parentMethod(this, "add", child, this.inner);
	},

	/**
	 * Get the client box element. Return reference to the inner/client box.
	 * @return {SUI.Box} a reference to the client box
	 */
	clientBox: function() {
		// in the case of SUI.Box the outer box is the inner
		return this.inner;
	},

	/**
	 * Display the panel. Set the CSS positions of the element's box(es) and
	 * for the children of the box.
	 */
	display: function() {

		this.setDim();
		// type html has a CSS position of relative so don't use setDim on
		// the inner panel then.
		if (this._type == "sui") {
			this.inner.setDim();
			SUI.Panel.parentMethod(this, "display");
		}

	},

	/**
	 * Lay out the panel. Calculate the position of the panel and
	 * its contents.
	 */
	layOut: function() {

		// type html has a CSS position of relative so don't use layOut on the
		// inner panel then.
		if (this._type == "sui") {

			this.inner.setRect(0, 0, this.clientWidth(), this.clientHeight());

			SUI.Panel.parentMethod(this, "layOut");
		}
	},

	/**
	 * Set or get the (HTML) content of the panel.
	 * @param {String} content the new panel content
	 * @return {String} the panel content
	 */
	content: function(content) {

		// if is a "sui" panel change it into a "html" panel
		if (this._type !== "html") {
			this._createHTMLPanel();
		}

		if (content === undefined) {
			return this.inner.el().innerHTML;
		}
		this.inner.el().innerHTML = content;

		// when the content is set make it unselectable in IE
		if (SUI.browser.isIE) {
			if (this.inner.el().unselectable) {
				var l = this.inner.el().getElementsByTagName("*");
				for (var i=0; i<l.length; i++) {
					l[i].unselectable = true;
				}
			}
		}

		return null;
	},

	/* Turn the inner box into a relatively positioned div and use the
	 * outer div as a viewport for that div.
	 */
	_createHTMLPanel: function() {

		// set the type to html
		this._type = "html";

		// use the background color of the inner panel for the outer panel
		this.el().style.backgroundColor =
			this.inner.el().style.backgroundColor;

		// if the inner panel has the system CSS use that for the outer panel
		if (this.inner.el().className.indexOf("sui-panel-gradient") !== -1) {
			this.inner.removeClass("sui-panel-gradient");
			this.addClass("sui-panel-gradient");
		}

		// the outer panel get a scroll bar
		this.el().style.overflow = "auto";

		// and the inner panel is reset to a relatively positioned div
		this.inner.el().style.width = "auto";
		this.inner.el().style.height = "auto";
		this.inner.el().style.position = "relative";
		this.inner.el().style.top = 0;
		this.inner.el().style.left = 0;
		this.inner.el().style.overflow = "visible";
	},

	// type of the panel "sui" or "html"
	_type: "sui"

});
