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
 * $Id: ImageCropper.js 786 2013-08-09 13:26:51Z geert $
 */

"use strict";

SUI.control.ImageCropper = SUI.defineClass(
	/** @lends SUI.control.ImageCropper.prototype */{

	/** @ignore */ baseClass: SUI.Box,

	/**
	 * @class
	 * SUI.control.ImageCropper is image cropping tool. With this tool you can
	 * select a rectangular area of a an image. You can send this selection
	 * together with the desired image width (and/or height) to a server that
	 * can do the actual image cropping and resizing. The tool allows you to
	 * set a target width or height, in that case you can make a selection that
	 * is not bound to a ratio. Or to set the target width and height height,
	 * in that case the selection will have a fixed ratio.
	 *
	 * @augments SUI.Box
	 *
	 * @description
	 * Create a SUI.control.ImageCropper.
	 *
	 * @constructs
	 * @param see base class
	 * @param {int} arg.outputHeight The desired height of the image to create
	 *     by the server side procedure.
	 * @param {int} arg.outputWidth The desired width of the image to create
	 *     by the server side procedure.
	 * @param {String} arg.image Location of the image to crop.
	 */
	initializer: function(arg) {

		SUI.control.Date.initializeBase(this, arg);

		// set the output/target dimensions for the image
		this._outputHeight = arg.outputHeight || 0;
		this._outputWidth = arg.outputWidth || 0;

		// show the picture behind the cropper div
		this.el().style.backgroundImage = "url("+arg.image+")";

		// the dragger handles might move a little over the edge, display them
		this.el().style.overflow = "visible";

		// create a structure that holds the four rectangles that gray out the
		// are to crop
		this._crop = {n: null, e: null, s: null, w: null};
		// create the rectangle boxes
		for (var i in this._crop) {
			this._crop[i] = new SUI.Box({parent: this});
			this._crop[i].el().appendChild(document.createElement("SPAN"));
			this._crop[i].addClass("sui-icr-crop");
			this._crop[i].el().style.cursor = "crosshair";
		}

		// create the center 'see-through' box
		this._croparea = new SUI.Box({parent: this});
		// the dragger handles might move a little over the edge, display them
		this._croparea.el().style.overflow = "visible";
		this._croparea.el().style.cursor = "move";
		this._croparea.border(new SUI.Border(1));
		this._croparea.addClass("sui-icr-croparea");

		// add the handler for moving this area
		this._addDragHandler(this._croparea);

		// create a structure that holds the eight dragger handles
		this._handle = {
			n: { cursor:"n-resize", top: "-5", left: "0" },
			nw: { cursor:"nw-resize", top: "-5", left: "-5" },
			w: { cursor:"w-resize", top: "0", left: "-5" },
			sw: { cursor:"sw-resize", bottom:"-5", left: "-5" },
			s: { cursor:"s-resize", bottom:"-5", right: "0" },
			se: { cursor:"se-resize", bottom:"-5", right:"-5" },
			e: { cursor:"e-resize", top: "0", right:"-5" },
			ne: { cursor:"ne-resize", top: "-5", right:"-5" }
		};

		// create the handlers
		for (var i in this._handle) {

			// create handles on the crop area
			var h = new SUI.Box({parent: this._croparea });

			// set the size of the handles
			h.el().style.width = this.DRAGGER_SIZE + "px";
			h.el().style.height = this.DRAGGER_SIZE + "px";
			// correct the position with the offset find in the data structure
			if (this._handle[i].top) {
				h.el().style.top = this._handle[i].top + "px";
			}
			if (this._handle[i].right) {
				h.el().style.right = this._handle[i].right + "px";
			}
			if (this._handle[i].left) {
				h.el().style.left = this._handle[i].left + "px";
			}
			if (this._handle[i].bottom) {
				h.el().style.bottom = this._handle[i].bottom + "px";
			}

			// set the style
			h.el().style.cursor = this._handle[i].cursor;
			h.addClass("sui-icr-handle");

			// some content for the div (what browser bug was that?)
			h.el().appendChild(document.createElement("SPAN"));

			// add the handler for moving this handle
			this._addDragHandler(h);

			// overwrite the entry in the data structure with the handle
			this._handle[i] = h;
		}

		// initialize draw the crop area
		this._rescale();
	},

	/**
	 * Size (width/height) of the dragger handlers.
	 */
	DRAGGER_SIZE: 7,

	/**
	 * Minimum size (width or height) of the crop area
	 */
	MIN_SIZE: 16,

	/**
	 * Get the image cropper data. This is all the data that a server side
	 * procedure needs to cut and resize the image as requested.
	 * @param {Object} Object with the following members:
	 * - {int} originalWidth Width of the image as shown in the cropper
	 * - {int} originalHeight Height of the image as shown in the cropper
	 * - {int} cropWidth Width of the selected region
	 * - {int} cropHeight Height of the selected region
	 * - {int} cropTop Top of the selected region
	 * - {int} cropLeft Left of the selected region
	 * - {int} newWidth Desired width of the picture to create
	 * - {int} newHeight Desired height of the picture to create
	 */
	data: function() {

		var ow = this._outputWidth;
		var oh = this._outputHeight;

		// the desired picture has no width of height
		if (ow==0 && oh==0) {
			return null;
		}

		// if the desired width of the picture was not set calculate it
		if (ow == 0) {
			ow = Math.round(
			 this._croparea.width() * oh / this._croparea.height());
		}
		// if the desired height of the picture was not set calculate it
		if (oh == 0) {
			oh = Math.round(
			 this._croparea.height() * ow / this._croparea.width());
		}

		// fill a data structure with all relevant data and return it
		return {
			originalWidth: this.width(),
			originalHeight: this.height(),
			cropWidth: this._croparea.width(),
			cropHeight: this._croparea.height(),
			cropTop: this._croparea.top(),
			cropLeft: this._croparea.left(),
			newWidth: ow,
			newHeight: oh
		};
	},

	/**
	 * Set the desired output size for the image and redraw the control. If
	 * both are set the crop area will be resized using a fixed ratio of the
	 * given width and height. If the width and not the height or vice verse
	 * were given then you can size the crop area in all directions.
	 * @param {int} w The desired target width of the image
	 * @param {int} h The desired height width of the image
	 */
	targetSize: function(w, h) {

	 // set the output width
		this._outputWidth = parseInt(w, 10);
		if (isNaN(this._outputWidth)) {
			this._outputWidth = 0;
		}

	 // set the output height
		this._outputHeight = parseInt(h, 10);
		if (isNaN(this._outputHeight)) {
			this._outputHeight = 0;
		}

		// and reinitialize and draw the control ...
		this._rescale();
		// ... show only the handles that we need
		this._activateHandles();
	},

	// reference to the drag listener function so we can remove it later
	_ehDrag: null,

	// reference to the end drag listener function so we can remove it later
	_ehEndDrag: null,

	// object with references to the four rectangles around the crop area
	_crop: null,

	// start position of the mouse when starting to drag
	_dragStartPos: null,

	// object with references to all of the resize handlers
	_handle: null,

	// height of the output rectangle
	_outputHeight: 0,

	// width of the output rectangle
	_outputWidth: 0,

	// the width/height ratio to retain while dragging
	_ratio: 0,

	// height of the crop area when dragging starts
	_startHeight: 0,

	// left of the crop area when dragging starts
	_startLeft: 0,

	// top of the crop area when dragging starts
	_startTop: 0,

	// width of the crop area when dragging starts
	_startWidth: 0,

	// when we keep the ratio while dragging, we don't need the handles
	// on the side of the crop area: remove them
	_activateHandles: function() {
	 // should we show ...
	 var d = "block";
		if (this._ratio) {
		 // ... or hide the handles
		 d = "none";
		}
		this._handle.n.el().style.display = d;
		this._handle.w.el().style.display = d;
		this._handle.e.el().style.display = d;
		this._handle.s.el().style.display = d;
	},

	_addDragHandler: function(h) {
	 var that = this;
	 // h and that are the two closure variables
		SUI.browser.addEventListener(h.el(), "mousedown",
		 function(e) {
			 if (!that._startDrag(h, new SUI.Event(this, e))) {
			   SUI.browser.noPropagation(e);
			 }
		 }
		);
	},

	// recalculate the size and position of the crop area while dragging one
	// of the handles
	_drag: function(el, ev) {

	 // the current mouse position
		var p = {x: SUI.browser.getX(ev.event), y: SUI.browser.getY(ev.event)};

		if (el == this._croparea) {

		 // if the crop area was selected, move the crop area
		 this._moveCropArea(p);

		} else if (this._ratio) {

		 // we're dragging the corners and should keep that ration fixed
		 if (el == this._handle.se) {
				this._handle_se(p);
			} else if (el == this._handle.ne) {
				this._handle_ne(p);
			} else if (el == this._handle.nw) {
				this._handle_nw(p);
			} else if (el == this._handle.sw) {
				this._handle_sw(p);
			}

		} else {

		 // we can freely size in any direction, no ratio to worry about
		 if (el == this._handle.se) {
				this._handle_s(p);
				this._handle_e(p);
			} else if (el == this._handle.ne) {
				this._handle_n(p);
				this._handle_e(p);
			} else if (el == this._handle.nw) {
				this._handle_n(p);
				this._handle_w(p);
			} else if (el == this._handle.sw) {
				this._handle_s(p);
				this._handle_w(p);
			} else if (el == this._handle.e) {
				this._handle_e(p);
			} else if (el == this._handle.n) {
				this._handle_n(p);
			} else if (el == this._handle.w) {
				this._handle_w(p);
			} else if (el == this._handle.s) {
				this._handle_s(p);
			}

		}

		// redisplay the new crop area
		this._redraw();
	},

	// The difference between the start position and the current position in
	// horizontal direction while dragging.
	_dx: function(p) {
	 return p.x - this._dragStartPos.x;
	},

	// The difference between the start position and the current position in
	// vertical direction while dragging.
	_dy: function(p) {
	 return p.y - this._dragStartPos.y;
	},

	// remove the listeners used for dragging
	_endDrag: function(e) {
		// Unregister the event handlers ...
		SUI.browser.removeEventListener(document, "mousemove", this._ehDrag);
		SUI.browser.removeEventListener(document, "mouseup", this._ehEndDrag);
	},

	// Handle dragging of the three east draggers (no fixed ratio)
	_handle_e: function(p) {

	 // set the new croparea width
		this._croparea.width(this._startWidth + this._dx(p));

		// if we've gone to far, set croparea width to max/min allowed
		if (this._croparea.width() < this.MIN_SIZE) {
			this._croparea.width(this.MIN_SIZE);
		}
		if (this._croparea.left() + this._croparea.width() > this.width()) {
			this._croparea.width(this.width() - this._croparea.left());
		}
	},

	// Handle dragging of the three north draggers (no fixed _ratio)
	_handle_n: function(p) {

	 // get the bottom first, we might need it later on
	 var b = this._croparea.top() + this._croparea.height();

	 // set the new croparea height and top
		this._croparea.height(this._startHeight - this._dy(p));
		this._croparea.top(this._startTop + this._dy(p));

		// if we've gone to far, set croparea height to max/min allowed
		if (this._croparea.height() < this.MIN_SIZE) {
			this._croparea.height(this.MIN_SIZE);
			this._croparea.top(b - this.MIN_SIZE);
		}
		if (this._croparea.top() < 0) {
			this._croparea.height(b);
			this._croparea.top(0);
		}
	},

	// Handle dragging of the north-east corner while keeping a fixed _ratio
	_handle_ne: function(p) {
	 // get the new size ...
	 var s = this._ratioSize(this._dx(p), -this._dy(p));
	 // ... and check if it's within boundaries ...
		if (s.w >= this.MIN_SIZE && s.h >= this.MIN_SIZE
		   && this._croparea.left() + s.w <= this.width()
		   && this._croparea.top() + this._croparea.height() - s.h >= 0) {
		 // ... yes: set top, width and height of crop area
			this._croparea.top(
				 this._croparea.top() + this._croparea.height() - s.h);
			this._croparea.width(s.w);
			this._croparea.height(s.h);
		}
	},

	// Handle dragging of the north-west corner while keeping a fixed _ratio
	_handle_nw: function(p) {
	 // get the new size ...
	 var s = this._ratioSize(-this._dx(p), -this._dy(p));
	 // ... and check if it's within boundaries ...
		if (s.w >= this.MIN_SIZE && s.h >= this.MIN_SIZE
		   && this._croparea.left() + this._croparea.width() - s.w >= 0
		   && this._croparea.top() + this._croparea.height() - s.h >= 0) {
		 // ... yes: set top, left, width and height of crop area
			this._croparea.left(
				 this._croparea.left() + this._croparea.width() - s.w);
			this._croparea.top(
				 this._croparea.top() + this._croparea.height() - s.h);
			this._croparea.width(s.w);
			this._croparea.height(s.h);
		}
	},

	// Handle dragging of the three south draggers (no fixed _ratio)
	_handle_s: function(p) {

	 // set the new croparea height
		this._croparea.height(this._startHeight + this._dy(p));

		// if we've gone to far, set croparea height to max/min allowed
		if (this._croparea.height() < this.MIN_SIZE) {
			this._croparea.height(this.MIN_SIZE);
		}
		if (this._croparea.top() + this._croparea.height() > this.height()) {
			this._croparea.height(this.height() - this._croparea.top());
		}
	},

	// Handle dragging of the south-east corner while keeping a fixed _ratio
	_handle_se: function(p) {
	 // get the new size ...
	 var s = this._ratioSize(this._dx(p), this._dy(p));
	 // ... and check if it's within boundaries ...
		if (s.w >= this.MIN_SIZE && s.h >= this.MIN_SIZE
		   && this._croparea.left() + s.w <= this.width()
		   && this._croparea.top() + s.h <= this.height()) {
		 // ... yes: set width and height of crop area
			this._croparea.width(s.w);
			this._croparea.height(s.h);
		}
	},

	// Handle dragging of the south-west corner while keeping a fixed _ratio
	_handle_sw: function(p) {
	 // get the new size ...
	 var s = this._ratioSize(-this._dx(p), this._dy(p));
	 // ... and check if it's within boundaries ...
		if (s.w >= this.MIN_SIZE && s.h >= this.MIN_SIZE
		   && this._croparea.left() + this._croparea.width() - s.w >= 0
		   && this._croparea.top() + s.h <= this.height()) {
		 // ... yes: set left, width and height of crop area
			this._croparea.left(
			 this._croparea.left() + this._croparea.width() - s.w);
			this._croparea.width(s.w);
			this._croparea.height(s.h);
		}
	},

	// Handle dragging of the three west draggers (no fixed _ratio)
	_handle_w: function(p) {

	 // get the right first, we might need it later on
		var r = this._croparea.left() + this._croparea.width();

	 // set the new _croparea width and left
		this._croparea.width(this._startWidth - this._dx(p));
		this._croparea.left(this._startLeft + this._dx(p));

		// if we've gone to far, set croparea width to max/min allowed
		if (this._croparea.width() < this.MIN_SIZE) {
			this._croparea.width(this.MIN_SIZE);
			this._croparea.left(r - this.MIN_SIZE);
		}
		if (this._croparea.left() < 0) {
			this._croparea.width(r);
			this._croparea.left(0);
		}
	},

	// move the crop area
	_moveCropArea: function(p) {

	 // set the new top and left
		this._croparea.top(this._startTop + this._dy(p));
		this._croparea.left(this._startLeft + this._dx(p));

		// correct it if we've moved too far
		if (this._croparea.top() < 0) {
			this._croparea.top(0);
		}
		if (this._croparea.left() < 0) {
			this._croparea.left(0);
		}
		if (this._croparea.left()+this._croparea.width() > this.width()) {
			this._croparea.left(this.width()-this._croparea.width());
		}
		if (this._croparea.top()+this._croparea.height() > this.height()) {
			this._croparea.top(this.height()-this._croparea.height());
		}
	},

	// Get the (proposed) new size when resizing with a fixed _ratio.
	_ratioSize: function(dx, dy) {
	 // get the new width an height by adding the delta ...
	 var r = {
			w: this._startWidth + dx,
			h: this._startHeight + dy
	 };
	 // .. and correct the new width and height for the given _ratio
		if (r.w/r.h > this._ratio) {
		 r.h = Math.round(r.w / this._ratio);
		} else {
		 r.w = Math.round(r.h * this._ratio);
		}
		// return the result
	 return r;
	},

	// Redraw the area: set the size of the inner rectangle and the rectangles
	// that darken outer area, set the center positions of the north, south,
	// west and east dragger handles.
	_redraw: function() {

	 // set the CSS size of rectangle on the west side of the croparea
		this._crop.w.left(0);
		this._crop.w.top(this._croparea.top());
		this._crop.w.width(this._croparea.left());
		this._crop.w.height(this._croparea.height());

	 // set the CSS size of rectangle on the east side of the croparea
		this._crop.e.top(this._croparea.top());
		this._crop.e.left(this._croparea.width() + this._croparea.left());
		this._crop.e.width(this.width() - this._croparea.width()
			- this._croparea.left());
		this._crop.e.height(this._croparea.height());

	 // set the CSS size of rectangle on the north side of the croparea
		this._crop.n.top(0);
		this._crop.n.width(this.width());
		this._crop.n.height(this._croparea.top());

	 // set the CSS size of rectangle on the south side of the croparea
		this._crop.s.top(this._croparea.height() + this._croparea.top());
		this._crop.s.width(this.width());
		this._crop.s.height(this.height() - this._croparea.height()
			- this._croparea.top());

	 // set the CSS size of the rectangles
		this._croparea.setDim();
		this._crop.w.setDim();
		this._crop.e.setDim();
		this._crop.n.setDim();
		this._crop.s.setDim();

	 // set the dragger handles on the sides to the center of the sides
		// of the croparea
		this._handle.n.el().style.left =
			Math.round(this._croparea.width()/2) - 5 + "px";
		this._handle.s.el().style.left =
			Math.round(this._croparea.width()/2) - 5 + "px";
		this._handle.e.el().style.top =
			Math.round(this._croparea.height()/2) - 5 + "px";
		this._handle.w.el().style.top =
			Math.round(this._croparea.height()/2) - 5 + "px";
	},

	// the output width and height are changed, reinitialize draw the crop area
	_rescale: function() {

		// is desired output width and height larger than 0 ? ...
		if (this._outputWidth > 0 && this._outputHeight > 0) {

		 // ... we use a fixed _ratio while resizing, calculate the _ratio
			this._ratio = this._outputWidth/this._outputHeight;

			// create a rectangle with the required _ratio of .9 times the
			// height or width of the area, whichever direction fits.
			var w, h;
			if (this.width() / this.height() < this._ratio) {
				w = Math.round(this.width() * .9);
				h = Math.round(w / this._ratio);
			} else {
				h = Math.round(this.height() * .9);
				w = Math.round(h * this._ratio);
			}

			// set the croparea size ...
			this._croparea.width(w);
			this._croparea.height(h);
			// ... and position
			this._croparea.left(Math.round(this.width()-w-4)/2);;
			this._croparea.top(Math.round(this.height()-h-4)/2);

		} else {

			// ... no: then we don't use a _ratio: all sides and corners can
		 // be scaled freely ...
			this._ratio = 0;

			// set the croparea to a size somewhat smaller than the picture
			// size
			this._croparea.width(Math.round(this.width()*.9));
			this._croparea.height(Math.round(this.height()*.9));
			this._croparea.left(Math.round(this.width()*.05));;
			this._croparea.top(Math.round(this.height()*.05));

		}

		// redisplay the new crop area
		this._redraw();
	},

	// start the dragging of a handle or the crop area itself. remember
	// the start position/size of the croparea and mouse click and add the
	// mousemove and mouseup event listeners
	_startDrag: function(el, ev) {

	 // store the start postion and size of the crop area
		this._startWidth = this._croparea.width();
		this._startHeight = this._croparea.height();
		this._startTop = this._croparea.top();
		this._startLeft = this._croparea.left();

		// start the position of the mouse click
		this._dragStartPos = {
			x: SUI.browser.getX(ev.event),
			y: SUI.browser.getY(ev.event)
		};

		// add the event listeners for dragging and stop dragging
		var that = this;
		SUI.browser.addEventListener(document, "mousemove",
		 this._ehDrag = function(e) {
			 if (!that._drag(el, new SUI.Event(this, e))) {
			   SUI.browser.noPropagation(e);
			 }
		 }
		);
		SUI.browser.addEventListener(document, "mouseup",
		 this._ehEndDrag = function(e) {
			 if (!that._endDrag(new SUI.Event(this, e))) {
			   SUI.browser.noPropagation(e);
			 }
		 }
		);
	}

});
