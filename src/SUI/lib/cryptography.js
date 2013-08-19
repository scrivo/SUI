/* Copyright (c) 2012, Geert Bergman (geert@scrivo.nl)
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
 * $Id: Cryptography.js 231 2012-02-08 01:27:16Z geert $
 */

"use strict";

/**
 * @namespace Holds a set of functions related to cryptography.
 * 
 * This library is a set of base routines to do large number math which
 * is necessary for cryptographic calculations. These functions target to
 * do large large number calculations as efficient as JavaScript will allow.
 * 
 * Most of the implemented functions are direct implementations of the
 * the algorithms presented in "Applied Cryptography". And note that they
 * should be used as such, not as general multipurpose large number math 
 * functions. For instance hardly any input checking is implemented (think
 * of division by zero, but not much more than that), but on the other hand 
 * documentation of how to apply these functions should be abundant.  
 *
 * JavaScript if of course interpreted code. With no access to the raw
 * processing power of the CPU itself. Typical operations (such as bitwise
 * logic) that are commonly used in large number libraries build in other 
 * programming languages are usually far more efficient than in JavaScript.  
 *
 * Some observations to start:
 * JavaScript does not know such thing as integer arithmetic: all numbers
 * are 64 bit floating point numbers. Within this number presentation the 
 * largest integral value is 53 bits wide (0x1F FFFF FFFF FFFF).
 *
 * Bitwise operators are implemented but they work internally on 32 bit signed
 * integers, which after the operation are casted back to JavaScript floating
 * point numbers.
 * 
 * So when using these for a large integer library it is best to stay away from
 * the sign bit, which makes a 31 bit radix the first choice. But then we'll
 * have overflow when multiplying numbers: a 53 / 2: 26 bit radix will be the
 * maximum we can safely use.
 *
 * Note that when we use a 26 bit radix a multiplication will possibly result
 * in a 52 bit number. The lower part can be treated with bitwise logic, the 
 * upper part cannot be right shifted 26 bits: a multiplication and floor are 
 * necessary.
 *
 * To hold the actual number we'll use an array that contains 26 bit digits.
 * We'll use the facility of arrays to auto expand when necessary. The least 
 * significant number is stored position 0, the most significant digit at
 * position Array.length-1. Undefined values are treated as zero, so the 
 * number arrays do not need to be initialized. But that has the consequence 
 * that when reading a figure from the array you will need to OR it with zero 
 * to convert undefined values to zero.
 * 
 * Note: large numbers with an leading digit of value zero (x[x.length-1]===0) 
 * should be considered and error.
 *
 * Suppose: in base 10 we want to define 90:
 *   var a = [];
 *   a[1] = 9;
 * Now a = [undefined, 9]
 * Then:
 *   1) a.length equals 2
 *   2) a[0]||0 equals 0
 *   3) a[1]||0 equals 9
 * Note that we can safely read higher figures from the string: 
 * 	a[8]||0 equals 0 and a.length still equals 2
 * 
 * In the comments that follow below the term 'large number' is commonly used 
 * to refer to such an array of base 26 digits. 
 * 
 * When building numbers the following is recommended:
 * 1) don't insert zero at positions equal and greater than the array length.
 * 2) insert zero at positions less than the array length.
 *
 * It makes sense to use get and set methods the access elements when you want
 * to enforce aforementioned rules but testing showed that this can have a
 * severe performance impact depending on the browser (IE) and/or configuration 
 * (FF with FireBug).
 *
 * Flooring is usually done by a bitwise OR with zero (x|0) which seems to be
 * a little more efficient than Math.floor().
 */
SUI.cryptography = {
		
	/**
	 * The bit width of the digits in large number arrays
	 */	
	BITS_BASE: 26,

	/**
	 * The base (or radix) of the large numbers (1 << BITS_BASE) 
	 */	
	BASE: 0x4000000,

	/**
	 * The maximum value of a digit in a large number array (BASE - 1) 
	 */	
	MAX_DIGIT: 0x3FFFFFF,

	/**
	 * The list of characters to use for string representations of large 
	 * numbers in base 2 to 36. 
	 */	
	DIGIT_TO_STR: "0123456789abcdefghijklmnopqrstuvwxyz",

	/**
	 * The list of characters to use for string representations of large
	 * numbers in base 64. 
	 */	
	DIGIT_TO_BASE64: 
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",

	/**
	 * The list of values to use for conversion of string representations 
	 * in base 2 to 36 to large numbers. 
	 * Note: this value is initialized in the first call to fromString() 
	 */	
	STR_TO_DIGIT: [],

	/**
	 * The list of values to use for conversion of string representations 
	 * in base 64 to large numbers. 
	 * Note: this value is initialized in the first call to fromString() 
	 */	
	BASE64_TO_DIGIT: [],
	
	/**
	 * Trim leading zero digits from a large number. The digit at position
	 * length-1 has to be the most significant digit.
	 * 
	 * @param {intp[} x The large number to trim.
	 * @return  {int[]} x The large number without leading zero digits.
	 */
	trim: function(x) {
		while (x.length>0 && !x[x.length-1]) {
			x.pop();
		}
		return x;
	},

	/**
	 * Convert an array with digits of one base to an array of digits of 
	 * another base.
	 *
	 * Example:
	 * // dec: [4][5][2] => hex: [14][15], 254 => 0xFE
	 * var hex = Cryptography.convertBase([4][5][2], 10, 16);
	 * // oct: [4][1] => bin: [0][0][1][1], 14o => 1100b
	 * var bin = Cryptography.convertBase([4][1], 8, 2);
	 * 
	 * TODO: could gain a lot of speed doing bitwise stuff on base 2^n
	 *
	 * @param {int[]} na An array with digits in radix fb with the least
	 *   significant digit at index 0.
	 * @param {int} The base from which to convert.
	 * @param {int} The base to which to convert.
	 * @return {int[]} An array with digits in radix tb.
	 */
	convertBase: function(na, fb, tb) {
		var r = [];
		while (na.length) {
			var n = [], c = 0, add = false;
			for (var i=na.length-1; i>=0; i--) {
				var t = c*fb + na[i];
				var q = t / tb | 0;
				if (q && !add) {
					add = true;
				}
				if (add) {
					n.unshift(q);
				}
				c = t % tb;
			}
			na = n;
			r.push(c);
		}
		return this.trim(r);
	},
	
	/**
	 * Generate a random value.
	 * 
	 * To compile random numbers we'll generate at large number array
	 * of n random digits of bit width bb. That number is then converted to 
	 * the internal 26 bit base.
	 *
	 * Example, to create a a 1024 bit wide random number:
	 * var x = Cryptography.random(64, 16);
	 *
	 * Note: the main reason to use a smaller base for random number 
	 * generation than the internal base is that I don't expect 
	 * Math.random() * 0x4000000 to yield very evenly distributed results. 
	 * I never verified this.
	 *
	 * @param {int} n The size/width of the random number to generate 
	 *   expressed a the number of base b digits.
	 * @param {int} bb The bit width of the random digits to assemble the large
	 *   number array from (defaults to 16).
	 * @return {int[]} A large number representing a random number selection 
	 *   of n*b bits wide.
	 */
	random: function(n, bb) {
		var r = [];
		var b = bb ? 1 << bb : 0x10000;
		for (var i=0; i<n; i++) {
			r.push(Math.random() * b | 0);
		}
		return this.convertBase(r, b, this.BASE);
	},
	
	/**
	 * Create a large number from a number string.
	 *
	 * Example:
	 * var x = Cryptography.fromString("123456789abcdef0", 16);
	 *
	 * Currently the following bases are supported: 2-36, 64. The bases 2-36 
	 * are using digits can be represented using the Arabic numerals 0-9 
	 * and the Latin letters A-Z. So when passing 2, 8, 10 and 16 for the base 
	 * parameter you can use standard binary, octal, decimal en hexadecimal 
	 * string representations (without type prefixes as 0xNN or 0NN) as input. 
	 * Base 64 will use the Base64 encoding scheme.
	 * 
	 * @param {string} str A string representation of the number to create.
	 * @param {int} b The base of the digits in the string (defaults to 16,
	 *    the following number bases are supported: 2-36, 64).
	 * @return {int[]} A large number containing the given number string.
	 */
	fromString: function(s, b) {
		// fill the lookup tables if not done yet
		if (!this.STR_TO_DIGIT.length) {
			for (var i=0; i<this.DIGIT_TO_STR.length; i++) {
				var d = this.DIGIT_TO_STR.charAt(i);
				this.STR_TO_DIGIT[d] = this.STR_TO_DIGIT[d.toUpperCase()] = i;
			}
			for (var i=0; i<this.DIGIT_TO_BASE64.length; i++) {
				this.BASE64_TO_DIGIT[this.DIGIT_TO_BASE64.charAt(i)] = i;
			}
		} 
		var t = [];
		b = !b ? 16 : b;
		for (var i=s.length-1; i>=0; i--) {
			var x = (b===64) ? this.BASE64_TO_DIGIT[s.charAt(i)] 
				: this.STR_TO_DIGIT[s.charAt(i)];
			if (x !== undefined) {
				t.push(x);
			}
		}
		var r = this.convertBase(t, b, this.BASE);
		// base64 data alignment differs from binary data
		if (b == 64 && t.length%4) {
			r = this.shiftRight(r, (4-t.length%4)*2);
		}
		return r;
	},
	
	/**
	 * Create a number string from a large number.
	 *
	 * Example:
	 * var x = Cryptography.toString(Cryptography.random(64), 16);
	 *
	 * Currently the following bases are supported: 2-36, 64. The bases 2-36 
	 * are using digits can be represented using the Arabic numerals 0-9 
	 * and the Latin letters A-Z. So passing 2, 8, 10 and 16 for the base 
	 * parameter will give you standard binary, octal, decimal en hexadecimal 
	 * representations of strings (without type prefixes as 0xNN or 0NN). 
	 * Base 64 will use the Base64 encoding scheme.
	 * 
	 * @param {int[]} x A large number.
	 * @param {int} b The base of the digits in the string (defaults to 16,
	 *    the following number bases are supported: 2-36, 64).
	 * @param {int} p An optional padding length in for zeropadding (not for
	 *    base 64).
	 * @return {string} A string representation of the given large number.
	 */
	toString: function(x, b, p) {
		b = !b ? 16 : b;
		p = !p ? 1 : p;
		if (b===64) {
			// base64 data alignment differs from binary data
			var l = (this.bitLength(x)+23)%24;
			var pd = (l < 8) ? "==" : (l < 16) ? "=" : "";
			x = this.shiftLeft(x, pd.length*2);
			var t = this.convertBase(x, this.BASE, b);
			for (var res = "", i=t.length-1; i>=0; i--) {
				res += this.DIGIT_TO_BASE64.charAt(t[i]);
			}
			res = res + pd;
			while (res.length%4) {
				res = "A" + res;
			}
			return res;
		}
		var t = this.convertBase(x, this.BASE, b);
		for (var res = "", i=t.length-1; i>=0; i--) {
			res += this.DIGIT_TO_STR.charAt(t[i]);
		}
		for (var pd= "", i=res.length; i<p; i++) {
			pd += this.DIGIT_TO_STR.charAt(0);
		}
		return pd + res;
	},
	
	/**
	 * Test if a bit is set at given location in a large number.
	 * 
	 * @param {int[]} x A large number.
	 * @param {int} p Position if the bit to test.
	 * @return {boolean} True if the bit was set, false if not.
	 */
	testBit: function(x, p) {
		return (x[p/this.BITS_BASE|0] & (1<<(p%this.BITS_BASE))) ? true:false;
	},
	
	/**
	 * Return the length of a large number in number of bits.
	 *  
	 * @param {int[]} x A large number.
	 * @return {int} The length of the number in bits.
	 */
	bitLength: function(x) {
		for (var t = x.length*this.BITS_BASE-1; t>=0; t--) {
			if (this.testBit(x, t)) {
				break;
			}
		}
		return (t+1);
	},
	
	/**
	 * Compare two large numbers.
	 *
	 * @param {int[]} x The first large number to compare.
	 * @param {int[]} y The second large number to compare.
	 * @return {int} 1 if x (the first number) is larger than y (the second
	 *    number), 0 if equal and -1 if smaller.
	 */
	compare: function(x, y) {
		for (var p = Math.max(x.length-1, y.length-1); p >= 0; p--) {
			var t = (x[p]||0) - (y[p]||0);
			if (t) {
				return t;
			}
		}
		return 0;
	},
	
	/**
	 * Shift the bits in a large number a number of places to the right. Can
	 * also be used to perform a fast division by any power of 2.
	 *
	 * @param {int[]} x The large number of which the bits to shift.
	 * @param {int} n The number of bit places to shift to the right.
	 * @return {int[]} A large number with the bits shifted.
	 */
	shiftRight: function(x, n) {
		if (!n) {
			return x.slice();
		}
		var n1 = n / this.BITS_BASE | 0;
		var s = n % this.BITS_BASE;
		var f1 = 2 << (s - 1);
		var f2 = 2 << (this.BITS_BASE - s - 1);
		var r = [];
		for (var i=x.length-1; i>=n1; i--) {
			r[i-n1] = (r[i-n1]||0) + (x[i] / f1 | 0);
			if (i-n1-1 >= 0) {
				r[i-n1-1] = (x[i] % f1) * f2;
			}
		}
		return this.trim(r);
	},

	/**
	 * Shift the bits in a large number a number of places to the left. If
	 * you want to multiply by any power of 2 this will be about 5-10 times
	 * faster than an ordinary multiplication. 
	 *
	 * @param {int[]} x The large number of which the bits to shift.
	 * @param {int} n The number of bit places to shift to the left.
	 * @return {int[]} A large number with the bits shifted.
	 */
	shiftLeft: function(x, n) {
		if (!n) {
			return x.slice();
		}
		var n1 = n / this.BITS_BASE | 0;
		var s = n % this.BITS_BASE;
		var f1 = 2 << (s - 1);
		var f2 = 2 << (this.BITS_BASE - s - 1);
		var r = [];
		for (var i=0; i<x.length; i++) {
			r[i+n1] = (r[i+n1]||0) + (x[i] % f2) * f1;
			var t = x[i] / f2 | 0;
			if (t) {
				r[i+n1+1] = t;
			}
		}
		return r;
	},
	
	/**
	 * Add two large numbers.
	 *
	 * @param {int[]} x The first large number to add.
	 * @param {int[]} y The second large number to add.
	 * @return {int[]} The sum of the two large numbers.
	 */
	add: function(x, y) {
		// Applied Cryptography 14.7 Algorithm Multiple-precision addition
		// INPUT: positive integers x and y, each having n+1 base b digits.
		// OUTPUT: the sum x + y = (w[n+1] w[n] ... w[1] w[0] ){b} in radix b 
		//   representation.
		var w = [];
		// 1. c <- 0 (c is the carry digit).
		var c = 0;
		// 2. For i from 0 to n do the following:
		var n = Math.max(x.length, y.length)-1;
		for (var i=0; i<=n; i++) {
			/// 2.1 wi <- (x[i] + y[i] + c) mod b.
			var xyc = (x[i]||0) + (y[i]||0) + c;
			var v = xyc & this.MAX_DIGIT;
			w[i] = v;
			// 2.2 If (x[i] + y[i] + c) < b then c <- 0; otherwise c <- 1.
			c = xyc < this.BASE ? 0 : 1;
		}
		// 3. wn + 1 <- c.
		if (c) {
			w[n+1] = c;
		}
		// 4. Return ((w[n+1] w[n] ... w[1] w[0])).
		return w;
	},

	/**
	 * Subtract a large number from another.
	 * 
	 * The large number array does not allow for negative large numbers. It
	 * is assumed that the first large number (x) is equal or larger than
	 * the second (y).
	 *
	 * @param {int[]} x The large number to subtract the other from.
	 * @param {int[]} y The large number to subtract from the other.
	 * @return {int[]} The difference of the two large numbers.
     * @exception {Exception} If the number to subtract is larger than the 
     *    number to subtract from.
	 */
	subtract: function(x, y) {
		if (this.compare(y, x) > 0) {
			throw "subtracting by a larger value";
		}
		// Applied cryptography 14.9
		// INPUT: positive integers x and y, each having n+1 base b digits, 
		//   with x >= y.
		// OUTPUT: the difference x - y = (w[n] w[n-1] ... w[1] w[0]){b} in 
		//   radix b representation.
		var w = [];
		// 1. c <- 0.
		var c = 0;
		// 2. For i from 0 to n do the following:
		var n = Math.max(x.length, y.length)-1;
		for (var i=0; i<=n; i++) {
			// 2.1 wi <- (x[i] - y[i] + c) mod b.
			var xyc = (x[i]||0) - (y[i]||0) + c;
			var v = (xyc>=0?xyc:xyc+this.BASE) & this.MAX_DIGIT;
			w[i] = v;
			// 2.2 If (x[i] - y[i] + c) >= 0 then c <- 0; otherwise c <- -1.
			c = xyc >= 0 ? 0 : -1;
		}
		// 3. Return ((w[n] w[n-1] ... w[1] w[0])).
		return this.trim(w);
	},

	/**
	 * Multiply a large number with another.
	 * 
	 * @param {int[]} x The first of the two numbers to multiply.
	 * @param {int[]} y The second of the two numbers to multiply.
	 * @return {int[]} The product of the two large numbers.
	 */
	multiply: function(x, y) {
		// 14.12 Algorithm Multiple-precision multiplication
		// INPUT: positive integers x and y having n+1 and t+1 base b
		//   digits, respectively.
		// OUTPUT: the product x * y = (w[n+t+1] ... w[1] w[0]){b} in radix b
		//   representation.
		// 1. For i from 0 to (n+t+1) do: w[i] <- 0.
		var w = [];
		// 2. For i from 0 to t do the following:
		var t = y.length-1;
		for (var i=0; i<=t; i++) {
			// 2.1 c <- 0.
			var c = 0;
			// 2.2 For j from 0 to n do the following:
			var n = x.length-1;
			for (var j=0; j<=n; j++) {
				// Compute (uv){b} = w[i+j] + x[j] * y[i] + c,
				var uv = (w[i+j]||0) + (x[j]||0) * (y[i]||0) + c;
				// and set w[i+j] <- v, c <- u.
				w[i+j] = uv & this.MAX_DIGIT;
				c = uv / this.BASE | 0;
			}
			// 2.3 w[i+n+1] <- u.
			if (c) {
				w[i+n+1] = c;
			}
		}
		// 3. Return ((w[n+t+1] ... w[1] w[0])).
		return w;
	},

	/**
	 * Square a large number with another.
	 * 
	 * @param {int[]} x The number to square.
	 * @return {int[]} The squared number.
	 */
	square: function(x) {
		// 14.16 Algorithm Multiple-precision squaring
		// INPUT: positive integer x = (x[t-1] x[t-2] ... x[1] x[0]){b}.
		// OUTPUT: x*x = x2 in radix b representation.
		// 1. For i from 0 to (2t - 1) do: w[i] <- 0.
		var w = [];
		// 2. For i from 0 to (t - 1) do the following:
		var t = x.length-1;
		for (var i=0; i<=t; i++) {
			// 2.1 (uv){b} <- w[2i] + x[i] * x[i], w[2i] <- v, c <- u.
			var uv = (w[2*i]||0) + (x[i]||0) * (x[i]||0);
			w[2*i] = uv & this.MAX_DIGIT;
			var c = uv / this.BASE | 0;
			// 2.2 For j from (i+1) to (t-1) do the following:
			for (var j=i+1; j<=t; j++) {
				// (uv){b} <- w[i+j] + 2*x[j] * x[i] + c, w[i+j] <- v, c <- u.
				var uv = (w[i+j]||0) + 2*(x[j]||0) * (x[i]||0) + c;
				w[i+j] = uv & this.MAX_DIGIT;
				c = uv / this.BASE | 0;
			}	
			// 2.3 w[i+t] <- u.
			if (c) {
				w[i+t+1] = c;
			}
		}
		// 3. Return((w[2t-1] w[2t-2] ... w[1] w[0]){b}).
		return w;
	},

	/**
	 * Divide a large number by another.
	 * 
	 * @param {int[]} x The large number to divide.
	 * @param {int[]} y The large number to divide by.
	 * @return {object} An object containing the quotient as a large number
	 *   in field 'quotient' and the remainder as a large number in the field
	 *   'remainder'.
     * @exception {Exception} On division by zero.
	 */
	divide: function(x, y) {
		// First deal with the cases: y > x y === x, y = 0, 1 or 2.
		if (!y.length) {
			throw "division by zero";
		} else if (this.compare(y, x) > 0) {
			return { quotient: [], remainder: x.slice() };
		}
		// 14.20 Algorithm Multiple-precision division
		// INPUT: positive integers x = (x[n] ... x[1] x[0]){b},
		//   y = (y[t] ... y[1] y[0]){b} with n >= t >= 1, y[t] != 0.
		// OUTPUT: the quotient q = (q[n-t] ... q[1] q[0]){b} and remainder
		//   r = (r[t] ... r[1] r[0]){b} such that x = q[y] + [r], 0 <= r < y.
		var t = y.length-1;
		// Normalize x and y
		var lambda=0;
		for (var tmp=y[t], hb=this.BASE>>1; tmp<hb; tmp*=2) {
			lambda++;
		}
		if (lambda) {
			y = this.shiftLeft(y, lambda);
			x = this.shiftLeft(x, lambda);
		} else {
			x = x.slice(); // local copy
		}
		var n = x.length-1;
		// 1. For j from 0 to (n-t) do: q[j] <- 0.
		var q = [];
		// 2. While (x >= y*b^(n-t)) do the following:
		//  q[n-t] <- q[n-t] + 1, x <- x - y*b^(n-t).
		var yb = [];
		yb.length = n-t;
		yb = yb.concat(y);
		while (this.compare(x, yb) >= 0) {
			q[n-t] = (q[n-t]||0)+1;
			x = this.subtract(x, yb);
		}
		// 3. For i from n down to (t+1) do the following:
		for (var i=n; i>=t+1; i--) {
			
			// 3.1 If x[i] = y[t] then set q[i-t-1] <- b - 1;
			var e = [this.MAX_DIGIT];
			if ((x[i]||0) != (y[t]||0)) {
				// otherwise set q[i-t-1] <- (x[i]*b+x[i-1]) / y*t ) .
				e[0] = ((x[i]||0)*this.BASE+(x[i-1]||0))/(y[t]||0)|0;
			}
			// 3.2 While (q[i-t-1]*(y[t]*b+y[t-1]) > x[i]*b^2+x[i-1]*b+x[i-2])
			var x3 = new Array(x[i-2]||0, x[i-1]||0, x[i]||0);
			var y2 = new Array(y[t-1]||0, y[t]||0);
			var c = this.multiply(e, y2);
			while (this.compare(c, x3) > 0) {
				//   do: q[i-t-1] <- q[i-t-1] - 1.
				e[0]--;
				c = this.multiply(e, y2);
			}
			// 3.3 x <- x - q[i-t-1]*y*b^(i-t-1).
			var yb = [];
			yb.length = i-t-1;
			yb = yb.concat(y);
			// 3.4 If x < 0 then set x <- x + y*b[i-t-1]
			//    and q[i-t-1] <- q[i-t-1] - 1.
			var z = this.multiply(e, yb);
			if (this.compare(x, z) < 0) {
				e[0]--;
				z = this.subtract(z, yb);
			}
			x = this.subtract(x, z);
			q[i-t-1] = e[0];
		}	
		if (lambda) {
			x = this.shiftRight(x, lambda);
		}
		// 4. r <- x.
		return { quotient: q, remainder: x };
	},
	
	/**
	 * Perform a modular exponentiation (g^e mod m) using the 'classic' method.
	 *  
	 * @param {int[]} g The base for the exponentiation (large number).
	 * @param {int[]} e The exponent for the operation (large number).
	 * @param {int[]} m The modulus for the operation (large number).
	 * @returns {int[]} The solution of g^e mod m (large number)
	 */
	modularExponentiate: function(g, e, m) {
		var a = [1];
		for (var i=this.bitLength(e)-1; i>=0; i--) {
			a = this.divide(this.square(a), m).remainder;
			if (this.testBit(e, i)) {
				a = this.divide(this.multiply(a, g), m).remainder;
			}
		}	
		return a;
	},

	/**
	 * Finding the greatest common divisor of two integers a and b, and find 
	 * the integers x and y that satisfy Bézout's identity: ax+by=gcd(a,b).
	 * 
	 * @param {int[]} ab Array containing two integers: ab[0]=a and ab[1]=b  
	 * @returns {int[]} Array of two integers containing the result:
	 *   r[0]=x and r[1]=y
	 */
	extendedGdc: function(ab) {
	    if (ab[1] === 0) {
	    	return [1, 0];
	    }
		var st = this.extendedGdc([ab[1], ab[0] % ab[1]]);
		return [st[1], st[0] - (ab[0] / ab[1] | 0) * st[1]];
	},		

	/**
	 * Determine the negative of the multiplactive inversion of m in modulo 
	 * BASE (m' = -m^⁻1 mod b). Because it is derived of the modulo only it is
	 * benificial to precalculate this number and use it in subsequent 
	 * Montgomery reduction steps.
	 * Note: It is required that gcd(BASE, m) = 1 (which is always satisfied if 
	 * m is odd and BASE is a power of 2).
	 *
	 * @param {int[]} m An (uneven) large number m.  
	 * @returns {int} -m^⁻1 mod BASE
     * @exception {Exception} If there is no multiplactive inversion.
	 */
	montgomeryPrepare: function(m) {
		// note that we're only interested in the multiplactive inversion of m
		// in modulo BASE and not of BASE in modulo m: so we can use 
		// extendedGdc(m mod b, b). 
		var e = this.extendedGdc([m[0], this.BASE]);
		if (!e[1]) {
			throw "modulus and base are not coprime";
		}
		return e[0] < 0 ? -e[0] : this.BASE-e[0];
	},	
	
	/**
	 * Convert a number to the Montgomery domain: determine a' = aR mod m. For
	 * R we take the typical choice of BASE^n in which n is the length of m
	 * as a base BASE number. 
	 * 
	 * @param {int[]} a A large number to convert to the Montgomery domain. 
	 * @param {int[]} m The modulus for the operation (large number).
	 * @returns {int[]} The given large number converted to the Montgomery 
	 *   domain 
	 */
	montgomeryConvert: function(a, m) {
		// INPUTY m = (x[n-1] ... x[1] x[0]) and R = b^n;
		var R = [];
		R.length = m.length;
		return this.divide(R.concat(a), m).remainder;
	},
	
	/**
	 * Determine the Montgomery modular reduction of T modulo m (with respect
	 * to R). For R we take the typical choice of BASE^n in which n is the 
	 * length of m as a base BASE number.
	 * 
	 * Furtermore the following conditions need to be satisfied: T < m*R 
	 * and gcd(BASE, m) = 1 (m is odd). The first condition is tested, the
	 * second is assumed to be true because of the existence of the im 
	 * parameter.  
	 * 
	 * @param {int[]} T A large number converted to the Montgomery domain.
	 * @param {int[]} m The modulus for the operation (large number).
	 * @param {int} im negative of the multiplactive inversion of m in modulo 
	 *   BASE (m' = -m^⁻1 mod b)
	 * @returns {int[]} The Montgomery modular reduction of T modulo m 
	 *   (large number).
     * @exception {Exception} If T >= mR.
	 */
	montgomeryReduce: function(T, m, im) {
		// INPUT: integers m = (m[n-1] ... m[1] m[0]){b} with gcd(m, b) = 1, 
		//   R = b^n , m = -m^-1 mod b, and T = (t[2n-1] ... t[1] t[0]){b} < mR.
		// OUTPUT: T*R^-1 mod m.
		var n = m.length;
		if (T.length > 2*n) {
			throw "modular reduction: T >= mR";
		}
		// 1. A <- T (Notation: A = (a[2n-1] ... a[1] a[0]){b})
		var A = T.slice();
		// 2. For i from 0 to (n - 1) do the following:
		for (var i=0; i<n; i++) {
			// 2.1 u[i] <- a[i]*m' mod b.
			var u0 = (A[i] * im) & this.MAX_DIGIT;
			// 2.2 A <- A + u[i]*m*b^i.
			// Note: written out case of:
			// A = this.add(A, t.concat(this.multiply([ui], m)));
			// yielded huge performance gain.
			for (var j=0, c=0 ;j < m.length; j++) {
				var uv = (A[j+i]||0) + (m[j]||0) * u0 + c;
				A[j+i] = uv & this.MAX_DIGIT;
				c = uv / this.BASE | 0;
			}
			for (A[j+i] = (A[j+i]||0) + c; A[j+i] >= this.BASE; j++) {
		    	A[j+i] -= this.BASE;
		    	A[j+i+1] = (A[j+i+1]||0) + 1; 
			}
		}
		// 3. A <- A/b^n .
		A = A.slice(n);
		// 4. If A >= m then A <- A - m.
		if (this.compare(A, m) >= 0) {
			A = this.subtract(A, m);
		}
		// 5. Return(A).
		return A;
	},
	
	/**
	 * Perform a modular exponentiation (g^e mod m) using the Montgomery method.
	 *  
	 * @param {int[]} g The base for the exponentiation (large number).
	 * @param {int[]} e The exponent for the operation (large number).
	 * @param {int[]} m The modulus for the operation (large number).
	 * @returns {int[]} The solution of g^e mod m (large number)
	 */
	montgomeryModularExponentiate: function(g, e, m, im) {
		var gt = this.montgomeryConvert(g, m);
		var at = this.montgomeryConvert([1], m);
		for (var i=this.bitLength(e)-1; i>=0; i--) {
			at = this.montgomeryReduce(this.square(at), m, im);
			if (this.testBit(e, i)) {
				at = this.montgomeryReduce(this.multiply(at, gt), m, im);
			}
		}	
		return this.montgomeryReduce(at, m, im);
	},
	
	/**
	 * Precompute the quantity 'μ = BASE^(2k) / m' to use in Barrett modular
	 * reduction steps. Barret reduction is advantageous if many reductions 
	 * are performed with a single modulus.
	 *
	 * @param {int[]} m The modulus (large number).  
	 * @returns {int[]} The quantity μ = BASE^(2k) / m
	 */
	barrettPrepare: function(m) {
		var b2k = [];
		b2k[2 * m.length] = 1; 
		return this.divide(b2k, m).quotient;
	},
	
	/**
	 * Determine x modulo m using Barret reduction. This requires the 
	 * precomputation of 'mu' which can be determined once for a given
	 * modulus to use in all Barret reduction steps using that modulus.
	 * 
	 * @param {int[]} x A large number to perform the modulo operation on.
	 * @param {int[]} m The modulus for the operation (large number).
	 * @param {int[]} mu the quantity 'μ = BASE^(2k) / m' (large number).
	 * @returns {int[]} x modulo m (large number).
	 */
	barrettReduce: function(x, m, mu) {
		// INPUT: positive integers x = (x[2k-1] ... x[1] x[0]){b},
		//   m = (m[k-1] ... m[1] m[0]){b} (with m[k-1] != 0), and μ = b^(2k)/m.
		// OUTPUT: r = x mod m.
		// 1. q1 <- x/b^(k-1) , q2 <- q1 * μ, q3 <- q2 / b^(k+1).
		var q1 = x.slice(m.length - 1);
		var q2 = this.multiply(q1, mu);
		var q3 = q2.slice(m.length + 1);		
		// 2. r1 <- x mod b^(k+1) , r2 <- q3 * m mod b^(k+1),
		var r1 = x.slice(0, m.length + 1);
		var r2 = this.multiply(q3, m).slice(0, m.length + 1);
		//  r <- r1 - r2 .
		// 3. If r < 0 then r <- r + b^(k+1).
		if (this.compare(r2, r1) > 0) {
			var bk1 = [];
			bk1[m.length + 1] = 1;
			r1 = this.add(r1, bk1);
		}
		var r = this.subtract(r1, r2);		
		// 4. While r >= m do: r <- r - m.
		while (this.compare(r, m) >= 0) {
			r = this.subtract(r, m);
		}		
		// 5. Return(r).
		return r;
	},

	/**
	 * Perform a modular exponentiation (g^e mod m) using the Barrett method.
	 *  
	 * @param {int[]} g The base for the exponentiation (large number).
	 * @param {int[]} e The exponent for the operation (large number).
	 * @param {int[]} m The modulus for the operation (large number).
	 * @returns {int[]} The solution of g^e mod m (large number)
	 */
	barrettModularExponentiate: function(g, e, m, mu) {
		var a = [1];
		for (var i=this.bitLength(e)-1; i>=0; i--) {
			a = this.barrettReduce(this.square(a), m, mu);
			if (this.testBit(e, i)) {
				a = this.barrettReduce(this.multiply(a, g), m, mu);
			}
		}	
		return a;
	}
	
};
