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
 * $Id: style.js 786 2013-08-09 13:26:51Z geert $
 */

"use strict";

/**
 * Holds a set of CSS/style related utility functions.
 * @namespace
 */
SUI.style = {

	/**
	 * Set the top, left, width and height style properties in one go. Either
	 * by passing all four values or by passing an other element to copy the
	 * values from.
	 * @param {HTMLElementNode} dest The element of which to set the style
	 *    properties.
	 * @param {HTMLElementNode|int} t A the new top value in pixels, or a
	 *    reference element to copy the four style attributes from.
	 * @param {int} l The new left value in pixels, or none if the t
	 *    parameter was a reference element.
	 * @param {int} w The new width value in pixels, or none if the t
	 *    parameter was a reference element.
	 * @param {int} h The new height value in pixels, or none if the t
	 *    parameter was a reference element.
	 */
	setRect: function(dest,t,l,w,h) {
		if (2 == arguments.length) {
			dest.style.top = t.style.top;
			dest.style.left = t.style.left;
			dest.style.width = t.style.width;
			dest.style.height = t.style.height;
		} else {
			dest.style.top = parseInt(t, 10)+"px";
			dest.style.left = parseInt(l, 10)+"px";
			dest.style.width = parseInt(w, 10)+"px";
			dest.style.height = parseInt(h, 10)+"px";
		}
	},

	/**
	 * Set the CSS class selector of an element (overwrites existing).
	 * @param {HTMLElementNode} e HTML element of which to set the class name.
	 * @param {String} clss The new CSS selector string.
	 */
	setClass: function(e, clss) {
		e.className = clss;
	},

	/**
	 * Add a CSS class selector to the CSS class selector list of an element.
	 * @param {HTMLElementNode} e HTML element of which to add a the class
	 *     selector.
	 * @param {String} clss The CSS selector string to add.
	 */
	addClass: function(e, clss) {
		if (!e.className) {
			e.className = clss;
		} else if (e.className.indexOf(clss) == -1) {
			e.className = SUI.trim(clss + " " + e.className);
		}
	},

	/**
	 * Remove a CSS class selector from the CSS class selector list of an
	 * element.
	 * @param {HTMLElementNode} e HTML element of which to add a the class
	 *     selector.
	 * @param {String} clss The CSS selector string to remove.
	 */
	removeClass: function(e, clss) {
		if (e.className.indexOf(clss) != -1) {
			var tmp = e.className.replace(new RegExp(clss, "g"), "");
			e.className = SUI.trim(tmp.replace(/\s\s+/g, " "));
		}
		if (SUI.trim(e.className) == "") {
			e.removeAttribute("className");
		}
	},

	/**
	 * Measure the text length of of a string.
	 * @param {String} t The text to measure the length of.
	 */
	textLength: function(t) {
		// create offscreen div containing the text with no explicit width ...
		var d = document.createElement("DIV");
		d.style.position = "absolute";
		d.style.left = "-1000px";
		d.style.fontSize = "14px";
		d.style.fontFamily = "Arial, sans-serif";
		d.innerHTML = t;
		// ... add it to the document tree ...
		if (document.body) {
				// TODO seems nonsense, look into this
			//document.documentElement.appendChild(d); //not for IE 7
			document.body.appendChild(d);
		}
		// ... measure the width ...
		var l = d.clientWidth;
		// ... and clean up
		if (document.body) {
			//document.documentElement.removeChild(d); //not for IE 7
			document.body.removeChild(d);
		}
		return l;
	},

	/**
	 * Get the width of the system scroll bars.
	 * @return {int} The width of the system scroll bars.
	 */
	scrollbarWidth: function() {
		// create an offscreen div width an explicit width ...
		var tmp = SUI.browser.createElement();
		tmp.style.left = "100px";
		tmp.style.width = "50px";
		tmp.style.height = "50px";
		// ... and append it to the body ...
		if (document.body) {
				// TODO seems nonsense, look into this
			//document.documentElement.appendChild(tmp); //not for IE 7
			document.body.appendChild(tmp);
		}
		// ... hide the scroll bars and measure the client width ...
		tmp.style.overflow = "hidden";
		var scrollBarWidth = tmp.clientWidth;
		// ... show the scroll bars and measure the client width, the
		// difference is the scroll bar width ...
		tmp.style.overflow = "scroll";
		scrollBarWidth -= tmp.clientWidth;
		// ... and clean up
		if (document.body) {
			//document.documentElement.removeChild(tmp); //not for IE 7
			document.body.removeChild(tmp);
		}
		return scrollBarWidth;
	}

};
