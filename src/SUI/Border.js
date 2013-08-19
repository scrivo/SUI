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
 * $Id: Border.js 786 2013-08-09 13:26:51Z geert $
 */

"use strict";

SUI.Border = SUI.defineClass(
	/** @lends SUI.Border.prototype */{

	/**
	 * @class
	 * SUI.Border is a simple class to group border width data. It is used as
	 * one of the members of the SUI.Box class to hold the border definition
	 * for the box ({@link SUI.Box#border}). Like all SUI components, border
	 * definitions are given in integers (pixels).
	 *
	 * @description
	 * Create a SUI.Border object. The arguments are optional and are
	 * given in CSS style: one argument sets all, two arguments set the
	 * top/bottom right/left, three arguments the top right/left and
	 * bottom and four set the individual  border widths.
	 *
	 * @constructs
	 * @param {int} [t=0] Border top width (and right, bottom and left width
	 *    if not set by the r, b and l parameters).
	 * @param {int} [r=0] Border right (and left width if not set by the l
	 *    parameter).
	 * @param {int} [b=0] Border bottom width.
	 * @param {int} [l=0] Border left width.
	 */
	initializer: function(t, r, b, l) {

		// implement the CSS border arguments system
		for (var i=0; arguments[i] !== undefined && i<arguments.length; i++) {
			var x = arguments[i];
			if (0 === i) {
				// first argument was set: set all members
				this.top = this.right = this.bottom = this.left = x;
			} else if (1 === i) {
			 // second argument was set: set the right and left border width
				this.right = this.left = x;
			} else if (2 === i) {
			 // third argument was set: set the top
				this.bottom = x;
			} else if (3 === i) {
			 // fourth argument was set: set the left
				this.left = x;
			}
		}

		// set the total border width
		this.width = this.right + this.left;
		this.height = this.top + this.bottom;
	},

	/**
	 * Apply the border definition to the CSS style of an element.
	 * @param {HTMLElementNode} el HTML element node of which to set the
	 *    border style.
	 */
	set: function(el) {
		el.style.borderWidth =
		 this.top+"px "+this.right+"px "+ this.bottom+"px "+this.left+"px";
		el.style.borderStyle = "solid";
	},

	/**
	 * The border bottom width.
	 * @type int
	 */
	bottom: 0,

	/**
	 * The border top and bottom width together.
	 * @type int
	 */
	height: 0,

	/**
	 * The border left width
	 * @type int
	 */
	left: 0,

	/**
	 * The border right width
	 * @type int
	 */
	right: 0,

	/**
	 * The border top width
	 * @type int
	 */
	top: 0,

	/**
	 * The border left and right width together.
	 * @type int
	 */
	width: 0

});

