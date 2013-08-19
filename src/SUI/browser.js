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
 * $Id: browser.js 786 2013-08-09 13:26:51Z geert $
 */

"use strict";

/**
 * Holds a set of browser specific functions.
 * @namespace
 */
SUI.browser = {

	/**
	 * Is the code executed by a Mozilla type browser?
	 * @type boolean
	 */
	isGecko: false,

	/**
	 * Is the code executed by an IE type browser?
	 * @type boolean
	 */
	isIE: false,

	/**
	 * Is the code executed by an Opera type browser?
	 * @type boolean
	 */
	isOpera: false,

	/**
	 * Is the code executed by a WebKit type browser?
	 * @type boolean
	 */
	isWebKit: false,

	/**
	 * What's the version of the browser?
	 * TODO not really supported yet.
	 * @type boolean
	 */
	version: null,

	/**
	 * Some older browsers (notably IE 8) don't implement Array.indexOf. This
	 * is the fix for a missing Array.indexOf method as proposed on MDN.
	 */
	patchNoArrayIndexOf: function() {

		if (!Array.prototype.indexOf) {
			Array.prototype.indexOf = function(searchElement /*, fromIddx */) {
				"use strict";
				if (this === void 0 || this === null) {
					throw new TypeError();
				}
				var t = Object(this);
				var len = t.length >>> 0;
				if (len === 0) {
					return -1;
				}
				var n = 0;
				if (arguments.length > 0) {
					n = Number(arguments[1]);
					if (n !== n) {
						n = 0;
					} else if (n !== 0 && n !== (1 / 0) && n !== -(1 / 0)) {
						n = (n > 0 || -1) * Math.floor(Math.abs(n));
					}
				}
				if (n >= len) {
					return -1;
				}
				var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
				for (; k < len; k++) {
					if (k in t && t[k] === searchElement)
					return k;
				}
				return -1;
			};
		}

	},

	/**
	 * Fix for String.substr implementations (IE) that do not support a
	 * negative index.
	 */
	patchSubstrIE: function() {

		if (SUI.browser.isIE) {
			String.prototype.substr = function(off, len) {
				// make the implicit len parameter explicit
				if (!len) {
					len = this.length;
				}
				if (off < 0) {
					// if offset is negative work from other side of string ...
					off = this.length+off;
					// ... but correct if (abs) offset was larger than string
					if (off < 0) {
						off = 0;
					}
				}
				return this.substring(off, off+len);
			};
		}
	},

	/**
	 * Get the browser type and version. The function has no return values, but
	 * it sets the isIE, isGEcko, isOpera, isWebKit and version fields of the
	 * SUI.browser object.
	 * TODO version not really supported yet
	 */
	getBrowser: function() {

		var ua, s, i;
		// we'll use the user agent string to determine the browser
		ua = navigator.userAgent;

		if ((i = ua.indexOf("Opera")) >= 0) {

			// Opera first because it as also MSIE in the identification string
			this.isOpera = true;

		} else if ((i = ua.indexOf("MSIE")) >= 0) {

			this.isIE = true;
			this.version = parseFloat(ua.substr(i + 4));

		} else if ((i = ua.indexOf("WebKit")) >= 0) {

			this.isWebKit = true;

		} else {

			// Assume a gecko browser ??
			// TODO look into this
			this.isGecko = true;
			this.version = 6.1;

		}

	},

	/**
	 * Add an event listener to an HTML element node. This is basically a
	 * wrapper for HTMLElementNode.addEventListener() because we would like to
	 * use the standard mechamism but can't because of IE.
	 * Also note that we really can't 'add' eventlisteners because of IE,
	 * unless we're adding event listeners to the window object. That's
	 * because in this library we normally store the listener element in an
	 * SUI.Event object. Using attachEvent (what you want to use if you want
	 * to add listeners) will leave you with a this pointer that points to
	 * the window object instead of the element that handles te event.
	 * So except for the window object there is no posibility to add multiple
	 * event listners to a HTML element. IE will only recognize the last one
	 * added when using this function.
	 * @param {HTMLElementNode} el The HTML element node to add the event
	 *     listener to.
	 * @param {String} id An event id (like: "click", "mouseover", etc.).
	 * @param {Function} fn Listener function with signature ({DOMEvent}).
	 *     Note that in IE the listener will be called with no parameter and
	 *     that access to the DOMEvent will be provided by the widow object.
	 */
	addEventListener: function(el, id, fn) {
		if (this.isIE && this.version < 9) {
			// can't use attachEvent: loses el that has the event
			// listener (this)
			if (el == window || el.tagName == "IFRAME") {
				el.attachEvent("on"+id, fn);
			} else {
				// IE has no input event but propertychange works more or less
				// like it
				if (id == "input") {
					id = "propertychange";
				}
				el["on"+id] = fn;
			}
		} else {
			// the standard way, no capturing bubbling only
			el.addEventListener(id, fn, false);
		}
	},


	/**
	 * Remove an event listener from an HTML element node that was previously
	 * added with addEventListener. It is basically a wrapper for
	 * HTMLElementNode.removeEventListener() needed for IE compatibility.
	 * @param {HTMLElementNode} el The HTML element node to add the event
	 *     listener to.
	 * @param {String} id An event id (like: "click", "mouseover", etc.).
	 * @param {Function} fn A valid reference to the listener function that
	 *     earlier was added with addEventListener method.
	 */
	removeEventListener: function(el, id, fn) {
		if (this.isIE && this.version < 9) {
			// Only use detachEvent on the window object
			if (el == window) {
				el.detachEvent("on"+id, fn);
			} else {
				// IE has no input event but propertychange works more or less
				// like it
				if (id == "input") {
					id = "propertychange";
				}
				el["on"+id] = null;
			}
		} else {
			// the standard way, no capturing bubbling only
			el.removeEventListener(id, fn, false);
		}
	},

	/**
	 * Stop the propagation (bubbling) of the event upwards the DOM tree.
	 * This is basically a wrapper for DOMEvent.stopPropagation needed for
	 * IE compatibility.
	 */
	noPropagation: function(e) {
			// If the event was not passed (what will normally be the case in
			// IE) use the window.event. Is some circumstances we will use
			// contentWindow.event (iframe) and then we'll set e explictly.
			if (!e) {
				e = window.event;
			}
		if (this.isIE && this.version < 9) {
			// the MS way to stop propagation
			e.cancelBubble = true;
		} else if (e){
			// the standard way to stop propagation
			e.stopPropagation();
		}
	},

	/**
	 * Counter to create unique id's within the scope of the page.
	 * @type int
	 * @private
	 */
	_id: 1,

	/**
	 * Return a new unique id. Note that the id sequence is initialized when
	 * this module is loaded.
	 * @return {String} An unique id.
	 */
	newId: function() {
		return "scrivo-ui-"+this._id++;
	},

	/**
	 * <p>Create an HTML element with a set of default properties set. In the
	 * SUI library most elements are created by this function to ensure some
	 * standard settings. The following element properties are set:</p>
	 * <ul>
	 *    <li>not selectable unless it's a from element,</li>
	 *    <li>set a standard font (class),</li>
	 *    <li>disable system context menu's,</li>
	 *    <li>no margin or padding,</li>
	 *    <li>the default cursor,</li>
	 *    <li>absolute positioning</li>
	 *    <li>generate a unique id</li>
	 * </ul>
	 * @param {String} [tag="DIV"] HTML tag name of the element to create
	 * @param {Object} [attr] Object containing the name and value pairs
	 *    for the elements attributes.
	 */
	createElement: function(tag, attr) {

		// create an the element
		var div = document.createElement(tag ? tag : "DIV");

		// set the attributes as given in the arguments (setAttribute sets -
		// not adds - to the className so do it here)
		if (attr) {
			this.setAttributes(div, attr);
		}

		// set the font class
		SUI.style.addClass(div, "sui-font");

		// IE uses unselectable and it does not inherit so set the property
		// on all created elements.
		if (this.isIE) {
			div.unselectable = true;
		}

		// if we've created a div element ...
		if (!tag) {
			// ...set standard style for divs
			SUI.style.addClass(div, "no-select");
			div.style.overflow = "hidden";
		} else {
			// ... else was it an input field?
			if (tag == "INPUT" || tag == "TEXTAREA") {
				// ... set styles for input fields ...
				SUI.style.addClass(div, "select");
				// ... and make them selectable in IE
				if (this.isIE) {
					div.unselectable = false;
				}
			}
		}

		// disable the default context menu
		SUI.browser.addEventListener(div, "contextmenu", function(e) {
			if (SUI.browser.isIE) {
				window.event.returnValue = false;
			} else {
				e.preventDefault();
			}
		});

		// set the other styles
		div.style.position = "absolute";
		div.style.margin = "0px";
		div.style.padding = "0px";
		div.style.cursor = "default";

		// and generate a unique id for the element
		div.id = this.newId();

		return div;
	},

	/**
	 * Get the current/computed style of an HTML element. You can either
	 * retrieve the style object itself or a single property.
	 * Note: You can only use this function if the HTML content of the page
	 * is fully rendered because the currentStyle is asynchronious in IE.
	 * @param {HTMLElementNode} el HTML element node to get the computed
	 *     style (property) from.
	 * @param {String} [property] The style property to retrieve.
	 * @return {Object|*} The style object if no specific property was set,
	 *     or else the requested style property.
	 */
	currentStyle: function(el, property) {
		if (SUI.browser.isIE) {
			return property ? el.currentStyle[property] : el.currentStyle;
		} else {
			property = property
				? property.replace(/([A-Z])/g, "-$1").toLowerCase() : null;
			var st = el.ownerDocument.defaultView.getComputedStyle(el, null);
			return property ? st.getPropertyValue(property) : st;
		}
	},

	/**
	 * Add and overwrite the attributes of some HTML element node with the
	 * attributes of another.
	 * @param {HTMLElementNode} newMode The node to copy the attributes to.
	 * @param {HTMLElementNode} oldMode The node to copy the attributes from.
	 */
	mergeAttributes: function(newNode, oldNode) {
		if (SUI.browser.isIE) {
			newNode.mergeAttributes(oldNode);
		} else {
			for(var i=0; i<oldNode.attributes.length; i++) {
				var a = oldNode.attributes[i];
				if (a.name === "class" || a.name === "className")  {
					SUI.style.addClass(newNode.className, oldNode.className);
				} else {
					newNode.setAttribute(a.name, oldNode.getAttribute(a.name));
				}
			}
		}
	},

	/**
	 * Set/unset a number of attributes using an object. The attributes get
	 * the values from the corresonding properties. A property value of null
	 * will remove the attribute.
	 * @param {HTMLElementNode} e Element node of which the attributes to set.
	 * @param {Object} attr Object containing the new values for the
	 *    attributes.
	 */
	setAttributes: function(e, attr) {
		for (var i in attr) {
			if (attr.hasOwnProperty(i)) {
				if (i === "class" || i === "className") {
					SUI.style.setClass(e, attr[i]===null ? "" : attr[i]);
				} else {
					if (attr[i] === null) {
						e.removeAttribute(i);
					} else {
						e.setAttribute(i, attr[i]);
					}
				}
			}
		}
	},

	/**
	 * Remove an element from the document tree. Either remove the node
	 * completely or keep the nodes child nodes in place.
	 * @param {HTMLElementNode} e Element node to remove.
	 * @param {boolean} removeChildren Also remove the children of the node.
	 */
	removeNode: function(node, removeChildren) {
		if (node.removeNode) {
			// MS method
			return node.removeNode(removeChildren);
		} else {
			if (removeChildren) {
				// remove the node completely
				return node.parentNode.removeChild(node);
			} else {
				// replace the node with its contents
				var range = document.createRange();
				range.selectNodeContents(node);
				return node.parentNode.replaceChild(
					range.extractContents(), node);
			}
		}
	},

	/**
	 * The current width of the browser window (viewport).
	 * @type int
	 */
	viewportWidth: 0,

	/**
	 * The current height of the browser window (viewport).
	 * @type int
	 */
	viewportHeight: 0,

	/**
	 * Get the browser window (viewport) size and set the viewportWidth and
	 * viewportHeight members of the SUI.browser object. Note that this
	 * function returns no values.
	 */
	getVieportSize: function() {
		if(SUI.browser.isIE) {
			// standards compliant mode of IE
			this.viewportWidth = document.documentElement.clientWidth;
			this.viewportHeight = document.documentElement.clientHeight;
		} else {
			this.viewportWidth = window.innerWidth;
			this.viewportHeight = window.innerHeight;
		}
	},

	/**
	 * Get the vertical scroll offset of the viewport.
	 * @return {int} The vertical scroll offset of the viewport.
	 */
	viewportScrollX: function() {
		return SUI.browser.isIE ? document.documentElement.scrollLeft :
			window.scrollX;
	},

	/**
	 * Get the horizontal scroll offset of the viewport.
	 * @return {int} The horizontal scroll offset of the viewport.
	 */
	viewportScrollY: function() {
		return SUI.browser.isIE ? document.documentElement.scrollTop :
			window.scrollY;
	},

	/**
	 * Get the horizontal mouse position from a mouse event with respect to
	 * the left of the document.
	 * @param {DOMEvent} e A mouse event.
	 * @return {int} The distance from the left side of the document to the
	 *     mouse click in pixels.
	 */
	getX: function(e) {
		if (SUI.browser.isIE && !e) {
			// If the event was not passed (what will normally be the case in
			// IE) use the window.event. Is some circumstances we will use
			// contentWindow.event (iframe) and then we'll set e explictly.
			e = window.event;
		} 
		return e.clientX + this.viewportScrollX();
	},

	/**
	 * Get the vertical mouse position from a mouse event with respect to
	 * the top of the document.
	 * @param {DOMEvent} e A mouse event.
	 * @return {int} The distance from the top side of the document to the
	 *    mouse click in pixels.
	 */
	getY: function(e) {
		if (SUI.browser.isIE && !e) {
			// If the event was not passed (what will normally be the case in
			// IE) use the window.event. Is some circumstances we will use
			// contentWindow.event (iframe) and then we'll set e explictly.
			e = window.event;
		}
		return e.clientY + this.viewportScrollY();
	}

};
