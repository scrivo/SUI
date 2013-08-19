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
 * $Id: AnchorLayout.js 786 2013-08-09 13:26:51Z geert $
 */

"use strict";

SUI.AnchorLayout = SUI.defineClass(
	/** @lends SUI.AnchorLayout.prototype */{

	/** @ignore */ baseClass: SUI.Box,

	/**
	 * @class
	 * <p>SUI.AnchorLayout is the the component that handles the layout of
	 * anchored boxes. Anchoring means that child boxes can be positioned
	 * relative to the edges of the anchor layout box.
	 * </p>
	 * <p>Suppose you have an input field with a label. In this situation
	 * the label has a fixed size and if the form is enlarged and you only
	 * want the input field to resize.
	 * </p>
	 * <p>This is easy to accomplish with an anchor layout. The label will
	 * have a fixed width and will be anchored to the left side of the
	 * container box (an instance of SUI.AnchorLayout). The input field will
	 * be anchored on the left and right of the container box, setting the
	 * left to a value slightly larger that the right side of the label and
	 * the right to zero. When resizing the container the label will always
	 * be shown at its fixed width and the rest of the width will be used
	 * for the input field.
	 * </p>
	 * <p>Or in code:</p>
	 * var b = new SUI.AnchorLayout({
	 *    top: 10, left 10, width: 800, height: 800
	 *
	 *
	 *
	 * can contain other box elements. It is essentially nothing more than a
	 * SUI.Box with a list of children. It knows how to deal with anchored
	 * boxes.
	 *
	 * @augments SUI.Box
	 *
	 * @description
	 * Construct a SUI.AnchorLayout component.
	 *
	 * @constructs
	 * @param see base class
	 */
	initializer: function(arg) {

		// anchors default to all sides
		if (!arg.anchor) {
			arg.anchor = {left:true,right:true,top:true,bottom:true};
		}

		SUI.AnchorLayout.initializeBase(this, arg);

		// start with an empty children's list
		this.children = [];
	},

	/**
	 * The list of children of this container.
	 * @type SUI.Box[]
	 * @deprecated Will be moved to a getter setter function
	 */
	children: null,

	/**
	 * Add an box to the container. Add it to the document tree and to
	 * the container's list of children.
	 * @param {SUI.AnchorLayout} child box to add
	 * @param {SUI.AnchorLayout} parent Container to add box to (none for this)
	 */
	add: function(child, parent) {
		this.children.push(child);
		child.parent(parent || this);
	},

	/**
	 * Display the Container. Set the CSS positions of the element's box(es)
	 * and for the children of the box.
	 */
	display: function() {

		SUI.AnchorLayout.parentMethod(this, "display");

		for (var i=0; i<this.children.length; i++) {
			this.children[i].display();
		}
	},

	/**
	 * Lay out the Container. Calculate the position of the Container and
	 * it's contents.
	 */
	layOut: function() {
		// call layOut for the children of the Container
		this._layoutChildren();
	},

	/**
	 * Remove a child box.
	 * @param {SUI.Box} child a reference to the box to remove
	 * @param {SUI.AnchorLayout} parent Container to remove box from (none for
	 *     this)
	 */
	remove: function(child, parent) {

		// Find the index in the list of child containers
		var i = this.children.indexOf(child);
		// none found is an error
		if (i === -1) {
			throw "Trying to remove a nonexisting SUI.AnchorLayout";
		}
		// Remove it form the DOM tree ...
		(parent || this).el().removeChild(child.el());
		// ... and from the list
		this.children.splice(i,1);
	},

	/**
	 * Layout the children of the Container. Use the anchors of the children to
	 * place them on the client area of the Container.
	 * @private
	 */
	_layoutChildren: function() {

		for (var i=0; i<this.children.length; i++) {

			var c = this.children[i];

			// do the width calculation using the left and right anchors and
			// the available client width
			if (c.anchor.left && c.anchor.right) {
				c.width(c.parent().clientWidth() - c.left() - c.right());
			} else if (c.anchor.right) {
				c.left(c.parent().clientWidth() - c.width() - c.right());
			} else if (c.anchor.left) {
				c.right(c.parent().clientWidth() - c.width() - c.left());
			}

			// do the height calculation using of the top and bottom anchors
			// and the available client height
			if (c.anchor.top && c.anchor.bottom) {
				c.height(c.parent().clientHeight() - c.top() - c.bottom());
			} else if (c.anchor.bottom) {
				c.top(c.parent().clientHeight() - c.height() - c.bottom());
			} else if (c.anchor.top) {
				c.bottom(c.parent().clientHeight() - c.height() - c.top());
			}

			// now do the child's layOut
			c.layOut();
		}
	}

});

