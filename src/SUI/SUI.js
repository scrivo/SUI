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
 * $Id: SUI.js 786 2013-08-09 13:26:51Z geert $
 */

"use strict";

/**
 * @summary
 * Root namespace of the <u>S</u>crivo <u>U</u>ser <u>I</u>nterface library.
 *
 * @description
 * The SUI namespace is the root namespace of the <u>S</u>crivo <u>U</u>ser
 * <u>I</u>nterface library. It holds all the classes of the basic UI
 * components as well as some general utility functions. More specialized
 * classes or sets of utility functions will have their own namespace
 * within the SUI namespace.
 * 
 * @namespace
 */
var SUI = {

	/**
	 * @summary
	 * The SUI.control namespace holds a set of more advanced user interface 
	 * controls.
	 * 
	 * @description
	 * The SUI.control namespace is the home for more advanced controls.
	 * These controls are specialized components such as a date entry
	 * component, an image cropper or an HTML editor. All are based on
	 * SUI.Box/SUI.AnchorLayout so they all can be used in the SUI lay out
	 * mechanism.
	 * 
	 * @namespace
	 */
	control: {},

	/**
	 * @summary
	 * The SUI.dialog namspace holds a set of common dialog boxes.
	 * 
	 * @description
	 * The SUI.dialog namespaces contains a set of common dialog boxes. All are
	 * based on the SUI.Window class. You'll find here (asynchronious)
	 * substitutes for JavaScript's alert, confirm and prompt popup boxes.
	 * There's also the typical calendar dialog and an empty dialog with an
	 * OK and cancel button that you can use as a base for your own dialogs.
	 * 
	 * @namespace
	 */
	dialog: {},

	/**
	 * @summary
	 * The SUI.form namspace contains a set of wrappers for the typical HTML 
	 * form components.
	 * 
	 * @description
	 * The SUI.form namespace holds a set of very lightweight wrappers around
	 * the standard HTML form controls. We like the standard HTML form
	 * elements and we want to use them as such. These wrappers add
	 * functionality to the HTML form elements so that they can be used in
	 * SUI layouts.
	 * 
	 * @namespace
	 */
	form: {},

	/**
	 * Location of the images relative to the SUI source directory. Change
	 * this value if you want to use an external image library.
	 * @type String
	 */
	imgDir: "",

	/**
	 * @summary
	 * Utility function to facilitate JavaScript's prototypal inheritance
	 * mechanisms.
	 * 
	 * @description
	 * <p>Utility function to facilitate JavaScript's prototypal inheritance
	 * mechanisms. The aim is to stay close to the language standard but
	 * to sand off some of the rough edges and to create a standard pattern
	 * to use within the Scrivo UI library.
	 * </p>
	 * <p>Example (boiler plate code):
	 * </p>
	 * <pre class="prettyprint">
	 * MyClass = SUI.defineClass({
	 *     initializer: function(arg) {
	 *         // Your constructor code here
	 *     },
	 *     // your prototype members and methods here:
	 *     sampleMethod: function(a) {
	 *         return "[" + a + "]";
	 *     }
	 * });
	 *
	 * MySubClass = SUI.defineClass({
	 *     baseClass: MyClass, // your base class
	 *     initializer: function(arg) {
	 *         MySubClass.initializeBase(this, arg); // initialize base class
	 *         // Your constructor code here
	 *     },
	 *     // your prototype members and methods here:
	 *     sampleMethod: function(a) { // override a method
	 *         return "> " + MySubClass.parentMethod(this, "sampleMethod", a);
	 *     }
	 * });
	 * </pre>
	 *
	 * <p>Or more prosaic:</p>
	 *
	 * <pre class="prettyprint">
	 * Person = SUI.defineClass({
	 *     initializer: function(arg) {
	 *         if (arg.name) {
	 *             this.name = arg.name;
	 *         }
	 *     },
	 *     name: ""
	 * });
	 *
	 * Employee = SUI.defineClass({
	 *     baseClass: Person,
	 *     initializer: function(arg) {
	 *         Employee.initializeBase(this, arg);
	 *     },
	 *     salary: 20000,
	 *     raise: function(percentage) {
	 *         return this.salary * (1 + percentage/(100 * 10));
	 *     }
	 * });
	 *
	 * Manager = SUI.defineClass({
	 *     baseClass: Employee,
	 *     initializer: function(arg) {
	 *         Manager.initializeBase(this, arg);
	 *     },
	 *     salary: 40000,
	 *     raise: function(percentage) {
	 *         return 3 * Manager.parentMethod(this, "raise", percentage);
	 *     }
	 * });
	 * </pre>
	 * @param {Object} arg An object containing the class definition.
	 */
	defineClass: function(arg) {

		// If we're creating a base class
		if (arg.baseClass) {
			// Commonly you'll see something like:
			//   arg.initializer.prototype = new arg.baseClass();
			// But the little trick below will prevent that the base class
			// constructor is executed during this stage of class definition.
			var tmp = function() {};
			tmp.prototype = arg.baseClass.prototype;
			arg.initializer.prototype = new tmp();

			// Now reset the prototype constructor back to the original
			arg.initializer.prototype.constructor = arg.initializer;
			// And keep a copy of the base class
			arg.initializer.base = arg.baseClass;
		}

		// Add members and methods to the prototype of the class
		for (var i in arg) {
			// initializer and baseClass are not part of the prototype body
			if (i != "initializer" && i != "baseClass") {
				arg.initializer.prototype[i] = arg[i];
			}
		}

		/**
		 * Each class gets a static method 'initializeBase' which is a
		 * convenience method to call the initializer of the base class.
		 *
		 * @param that: the initializer's this reference
		 * @param -: additional arguments
		 */
		arg.initializer.initializeBase = function(that) {
			// call the base class constructor
			this.base.prototype.constructor.apply(
				that, [].slice.call(arguments, 1));
		};

		/**
		 * Each class gets a static method 'parentMethod' which is a
		 * convenience method to call overridden methods of the base class.
		 *
		 * @param that: the objects this reference
		 * @param method: the overridden method name
		 * @param -: additional arguments
		 */
		arg.initializer.parentMethod = function(that, method) {
			// call the base class method
			return this.base.prototype[method].apply(
				that, [].slice.call(arguments, 2));
		};

		// Now return our class
		return arg.initializer;
	},

	/**
	 * @summary
	 * Initialize the SUI library.
	 * 
	 * @description
	 * <p>Initialize the SUI library. Some initial values and event handlers
	 * need to be set to ensure that all parts of the SUI library will work
	 * correctly. The SUI library was designed to have a minimum footprint so
	 * here it is what is does on initialization:</p>
	 * <ul>
	 * <li>Get the browser type,</li>
	 * <li>Two IE patches (Array.indexOf and String.substr),</li>
	 * <li>Get the viewport size and add an window.onresize handler to keep
	 *     these values current,</li>
	 * <li>Notify the SUI.onStart event listener.</li>
	 * </ul>
	 * <p>That was all folks, no lengthy initialization stuff for us!</p>
	 */
	initialize: function() {

		if (this._initialized) {
			return;
		}
		this._initialized = true;

		// get the browser version
		SUI.browser.getBrowser();

		// some older browsers (IE) don't have an indexOf for array's
		SUI.browser.patchNoArrayIndexOf();
		// IE interpretates a negative index for substr different than others
		SUI.browser.patchSubstrIE();

		// get the viewport (browser window) size ...
		SUI.browser.getVieportSize();
		// ... and keep them current
		SUI.browser.addEventListener(window, "resize", function() {
			SUI.browser.getVieportSize();
		});

		// notify the onStart listeners as soon as the DOM tree is ready
		if (document.addEventListener) {
			document.addEventListener("DOMContentLoaded", function(){
				SUI.onStart();
			}, false);
		} else {
			// need to wait a little longer for IE
			window.onload = function() {
				SUI.onStart();
			};
		}

		// get the location of the images
		var loc = document.location.href;
		var n = loc.indexOf("/sui/");
		if (n !== -1) {
			this.imgDir = loc.substr(0, n+5) + "img";
		} else {
			this.imgDir = "img";
		}

	},

	/**
	 * @summary
	 * Left trim a string.
	 * 
	 * @description
	 * Left trim a string. Remove the leading whitespace (space, non breaking
	 * space, tab, line feed, carriage return) from a string.
	 * 
	 * @param {String} s The string to trim.
	 * @return {String} The trimmed string.
	 */
	ltrim: function(s) {
		return s.replace(/^[\s\xA0\t\r\n]+/,"");
	},

	/**
	 * @summary
	 * Right trim a string.
	 * 
	 * @description
	 * Right trim a string. Remove the trailing whitespace (space, non breaking
	 * space, tab, line feed, carriage return) from a string.
	 * 
	 * @param {String} s The string to trim.
	 * @return {String} The trimmed string.
	 */
	rtrim: function(s) {
		return s.replace(/[\s\xA0\t\r\n]+$/,"");
	},

	/**
	 * @summary
	 * Trim a string.
	 * 
	 * @description
	 * Trim a string. Remove the leading and trailing whitespace (space, non
	 * breaking space, tab, line feed, carriage return) from a string.
	 * 
	 * @param {String} s The string to trim.
	 * @return {String} The trimmed string.
	 */
	trim: function(s){
		return this.ltrim(this.rtrim(s));
	},

	/**
	 * The onStart event handler, is called when all necessary initialization
	 * actions are done and the DOM tree is ready to be manipulated.
	 * @event
	 */
	onStart: function() {},

	/**
	 * Flag so we won't reinitialize SUI again.
	 * @private
	 */
	_initialized: false

};
