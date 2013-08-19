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
 * $Id: Padding.js 786 2013-08-09 13:26:51Z geert $
 */

"use strict";

SUI.Padding = SUI.defineClass(
	/** @lends SUI.Padding.prototype */{

	/** @ignore */ baseClass: SUI.Border,

	/**
	 * @class
	 * SUI.Padding is a simple class to group border width data.
	 *
	 * @augments SUI.Border
	 *
	 * @description
	 * Create a SUI.Padding object. The arguments are optional and are
	 * given in CSS style: one argument sets all, two arguments set the
	 * top/bottom right/left, three arguments the top right/left and
	 * bottom and four set the individual  padding widths.
	 *
	 * @constructs
	 * @param {int} t Padding top (or right, bottom, left) width
	 * @param {int} r Padding right (or left) width
	 * @param {int} b Padding bottom width
	 * @param {int} l Padding left width
	 */
	initializer: function(t, r, b, l) {
		SUI.Padding.initializeBase(this, t, r, b, l);
	},

	/**
	 * Make the border top and border widths smaller or larger.
	 * @param {int} h The amount that will be added to the border widths. Note
	 *   that the amount is distributed over the borders. An amount of 3 will
	 *   cause one border width to increase by 1 and the other by 2.
	 */
	growH: function(h) {
		var h1 = h / 2 | 0;
		var h2 = h - h1;
		this.top += h1;
		if (this.top < 0) {
		 this.top = 0;
		}
		this.bottom += h2;
		if (this.bottom < 0) {
		 this.bottom = 0;
		}
		this.height = this.top + this.bottom;
	},

	/**
	 * Make the border left and right widths smaller or larger.
	 * @param {int} w The amount that will be added to the border widths. Note
	 *   that the amount is distributed over the borders. An amount of 3 will
	 *   cause one border width to increase by 1 and the other by 2.
	 */
	growW: function(w) {
		var w1 = w / 2 | 0;
		var w2 = w - w1;
		this.left += w1;
		if (this.left < 0) {
		 this.left = 0;
		}
		this.right += w2;
		if (this.right < 0) {
		 this.right = 0;
		}
		this.width = this.right + this.left;
	},

	/**
	 * Apply the padding defintion to the CSS style of an element.
	 * @param {HTMLElementNode} el HTML element node of which to set the
	 *   padding style.
	 */
	set: function(el) {
		el.style.paddingTop = (this.top < 0 ? 0 : this.top)+"px";
		el.style.paddingBottom = (this.bottom < 0 ? 0 : this.bottom)+"px";
		el.style.paddingLeft = (this.left < 0 ? 0 : this.left)+"px";
		el.style.paddingRight = (this.right < 0 ? 0 : this.right)+"px";
	}
});