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
 * $Id: color.js 786 2013-08-09 13:26:51Z geert $
 */

"use strict";

/**
 * @summary
 * The SUI.color namespace contains a set of utility functions for working
 * with color codes. 
 * 
 * @description
 * Colors can be defined in different was. Popular methods use HSV
 * or RGB color values. The latter can be represented in different ways in
 * CSS: '#0010FF', '#01F' or 'rgb(0,16,255)'. In this namespace you'll find a
 * set of functions for conversions between HTML/CSS color codes, RGB and HSV 
 * color values.
 * 
 * @namespace
 */
SUI.color = {

	/**
	 * Convert an HTML or CSS color code to a standard HTML color code
	 * (standardize color code).
	 * @param {String} c A HTML or CSS color code, the following formats
	 *    are allowed: #FFF, #FFFFFF, rgb(255,255,255).
	 * @return {String} An HTML color code (#FFFFFF).
	 */
	colToCol: function(c) {
		return SUI.color.rgbToCol(SUI.color.colToRgb(c));
	},

	/**
	 * Convert an HTML or CSS color code to an HSV color definition.
	 * @param {String} c A HTML or CSS color code to convert to an HSV color
	 *    object, the following formats are allowed: #FFF, #FFFFFF and
	 *    rgb(255,255,255).
	 * @return {Object} An HSV color object with the following members:
	 *    h (hue: 0-360), s: (saturation: 0-1), v: (value: 0-1)
	 */
	colToHsv: function(c) {
		return SUI.color.rgbToHsv(SUI.color.colToRgb(c));
	},

	/**
	 * Convert an HTML or CSS color code to RGB color fractions.
	 * @param {String} c A HTML or CSS color code to convert to a RGB color
	 *    object, the following formats are allowed: #FFF, #FFFFFF and
	 *    rgb(255,255,255).
	 * @return {Object} An RGB color object with the following members:
	 *    r (red: 0-1), g (green: 0-1) and b (blue: 0-1).
	 */
	colToRgb: function(c) {
		// assume base 16 (hexadecimal 0x00-0xFF)
		var b = 16;
		// see if c matches #F70 ...
		var x = /^#(\w{1})(\w{1})(\w{1})$/.exec(c);
		if (x) {
			// ... yes: change F to FF ...
			for (var i=1; i<=3; i++) {
				x[i] = x[i]+""+x[i];
			}
		} else {
			// ... no, see if c matches #FF7700 ...
			var x = /^#(\w{2})(\w{2})(\w{2})$/.exec(c);
			if (!x) {
				// ... no, go for base 10 ...
				b = 10;
				// ... and see is c matches rrb(255, 127, 0) ...
				x = /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/.exec(c);
				if (!x) {
					// ... no: hopeless, return black
					return {r: 0, g: 0, b: 0};
				}
			}
		}
		// parse and return the RGB values using the correct base
		return {r: parseInt(x[1],b)/255, g: parseInt(x[2],b)/255,
			b: parseInt(x[3],b)/255};
	},

	/**
	 * Convert a HSV color definition to an HTML color code.
	 * @param {Object} c An HSV color object with the following members:
	 *    h (hue: 0-360), s: (saturation: 0-1), v: (value: 0-1) to convert to
	 *    an HTML color code.
	 * @return {String} An HTML color code (#FFFFFF)
	 */
	hsvToCol: function(c) {
		return SUI.color.rgbToCol(SUI.color.hsvToRgb(c));
	},

	/**
	 * Convert a HSV color definition RGB color fractions.
	 * @param {Object} c An HSV color object with the following members:
	 *    h (hue: 0-360), s: (saturation: 0-1), v: (value: 0-1) to convert to
	 *    an HSV color object.
	 * @return {Object} An object with the following members: r, g and b,
	 *    each within a range of 0 to 1.
	 */
	hsvToRgb: function(c) {
		// if the saturation is zero ...
		if (c.s == 0) {
			// ... return gray based on the color's value
			return {r: c.v, g: c.v, b: c.v};
		}
		// find the sector (0-5)
		c.h /= 60;
		var sect = Math.floor(c.h);
		// get the fraction of the hue in the sector
		var f = c.h - sect;

		// c.v     _ q     t _     t _ _ q             t _ _ q
		// p         \ _ _ /       /     \ _ _     _ _ /     \
		// sect  R 0 1 2 3 4 5   G 0 1 2 3 4 5   B 0 1 2 3 4 5

		// value for the sector between high and low color sections
		var q = c.v * (1 - c.s * f);
		// values for the 2 sectors with the low color values
		var p = c.v * (1 - c.s);
		// value for the sector between low and high color sections
		var t = c.v * (1 - c.s * (1 - f) );

		// map the results to the right RGB components and return
		switch (sect) {
			case 1:
				return {r: q, g: c.v, b: p};
			case 2:
				return {r: p, g: c.v, b: t};
			case 3:
				return {r: p, g: q, b: c.v};
			case 4:
				return {r: t, g: p, b: c.v};
			case 5:
				return {r: c.v, g: p, b: q};
			default:
				return {r: c.v, g: t, b: p};
		}
	},

	/**
	 * Convert a RGB color fractions to an HTML color code.
	 * @param {Object} c An RGB color object with the following members:
	 *    r (red: 0-1), g (green: 0-1) and b (blue: 0-1) to convert to an
	 *    HTML color code.
	 * @return {String} An HTML color code (#FFFFFF).
	 */
	rgbToCol: function(c) {
		// build a hexadecimal color value and 0x1000000 to it ...
		var x = 0x1000000 + (c.r*255|0)*65536 + (c.g*255|0)*256 + (c.b*255|0);
		// ... convert it to string, chop of the leading 1 and return it
		return "#" + x.toString(16).substr(1);
	},

	/**
	 * Convert a RGB color fractions to an HTML color code.
	 * @param {Object} c An RGB color object with the following members:
	 *    r (red: 0-1), g (green: 0-1) and b (blue: 0-1) to convert to an
	 *    HSV color object.
	 * @return {Object} An HSV color object with the following members:
	 *    h (hue: 0-360), s: (saturation: 0-1), v: (value: 0-1)
	 */
	rgbToHsv: function(c) {
		// get the minimum value of the RGB components
		var min = (c.r<c.g ? c.r : c.g)<c.b ? (c.r<c.g ? c.r : c.g) : c.b;
		// get the maximum value of the RGB components
		var max = (c.r>c.g ? c.r : c.g)>c.b ? (c.r>c.g ? c.r : c.g) : c.b;
		// start with black
		var r = {h: 0, s: 0, v: 0};

		var chroma = max - min;

		// the value is the max component
		r.v = max;
		if (!chroma || r.v == 0) {
			// if there is no chroma (and guard against division by zero)
			r.h = 360;
			return r;
		} else {
			// the saturation is the chroma as fraction of the value
			r.s = chroma/r.v;
		}

		// get the hue as a sector + fraction
		if(c.r == max) {
			r.h = (c.g - c.b) / chroma;
		} else if(c.g == max) {
			r.h = 2 + (c.b - c.r) / chroma;
		} else {
			r.h = 4 + (c.r - c.g) / chroma;
		}

		// convert the hue from sector to degrees
		r.h *= 60;
		if(r.h < 0) {
			r.h += 360;
		}

		// return the result
		return r;
	}

};
