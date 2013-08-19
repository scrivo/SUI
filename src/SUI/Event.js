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
 * $Id: Event.js 786 2013-08-09 13:26:51Z geert $
 */

"use strict";

SUI.Event = SUI.defineClass(
	/** @lends SUI.Event.prototype */{

	/**
	 * @class
	 * SUI.Event is a simple class to create a standard way to access the event
	 * object, event target an listener element across different browsers.
	 *
	 * @description
	 * Construct a SUI.Event object.
	 *
	 * @constructs
	 * @param {HTMLElementNode} elListener The element to which the listener
	 *      was attached (the this variable of the handler)
	 * @param {Event} event The browser's event object (null for IE)
	 */
	initializer: function(elListener, event) {

		// Set the element to which the listener was bound
		this.elListener = elListener;

		// Set the event
		this.event = event ? event : window.event;

		// Set the target
		// Note: target (or better srcElement) can be null (onselectionchange)
		this.target = this.event.srcElement
			? this.event.srcElement : this.event.target;

		// hack for some browser, a version of Safari if I remember it well
		if (this.target && this.target.nodeType == 3) {
			this.target = this.target.parentNode;
		}
	},

	// the element to which the listener was attacted that caused the event
	elListener: null,

	// the DOM event object
	event: null,

	// the event target (or srcElement in IE speak)
	target: null
});

