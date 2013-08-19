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
 * @namespace Holds a set of functions for RSA encryption.
 */
var RSA = {

	/**
	 * Encrypt data using RSA encryption.
	 *
	 * The function can encrypt any size of string into a set of RSA encrypted
	 * data blocks.
	 *
	 * Note: it is assumed that the input data is an Unicode string and will
	 * be converted to UTF-8 before encrypting. So decrypting will yield 
	 * UTF-8 data. Tip: be sure that your web page is serviced with correct 
	 * UTF-8 headers so String.charCodeAt() will return Unicode values.
	 *
	 * @param {string} data An Unicode to encrypt using RSA encryption.
	 * @param {string} modulus The modulus to use in base64 encoding.
	 * @param {string} modulus The encryption exponent to use in base64 
	 *    encoding.
	 * @param {int} bits The length of the modulus in bits.
	 * @return {string[]} An array of RSA encrypted data blocks.
	 */
	encrypt: function(data, modulus, encryptionExponent, bits) {
		var c = Cryptography;
		var d = this.pkcs1v1_5EncodedChunks(data, bits/8);
		var m = c.fromString(modulus, 64);
		var e = c.fromString(encryptionExponent, 64);
		var mp = c.montgomeryPrepare(m);
		for (var i=0, r=[]; i<d.length; i++) {
			var d2 = c.convertBase(d[i].reverse(), 256, c.BASE);
			var d3 = c.montgomeryModularExponentiate(d2, e, m, mp);
			r.push(c.toString(d3, 64));
		}
		return r;
	},
	
	/**
	 * Prepare data for RSA encryption. Convert the data from Unicode to UTF-8
	 * and split it into smaller chunks.
	 *
	 * @param {string} data An Unicode string to split in smaller chunks.
	 * @param {int} chunksize The maximum size for the chunks.
	 * @return {string} The input data converted to UTF-8 and splitted into
	 *   chunks (Note: splitting is done at byte and not at character level,
	 *   so longer UTF-8 character can be divided by this operation: the 
	 *   chunks are not guaranteed to be valid UFT-8 until rejoined.
	 */
	prepareChunks: function(data, chunksize) {
		var res = [], r = [], c, d = unescape(encodeURIComponent(data));
		for (var i=0; !isNaN(c = d.charCodeAt(i)); i++) {
			if (i % chunksize == 0) {
				r = [];
				res.push(r);
			} 
			r.push(c);
		}
		return res;	
	},
	
	/**
	 * Prepare data for RSA encoding.
	 *
	 * Data will first be converted from Unicode to UFT-8 and split into
	 * smaller chunks. Then all these chunks will be encoded using 
	 * EME-PKCS1-v1_5 encoding. These chunks will have the form:
	 *   EM = 0x00 || 0x02 || PS || 0x00 || M.
	 * in which M is the message and PS a series of pseudo-randomly generated 
	 * nonzero octets. The length of PS will be at least eight octets.
	 *
	 * @param {string} data The data to convert from Unicode to UTF-8 and 
	 *   convert into EME-PKCS1-v1_5 encoded chunks.
	 * @param {int} keysize The size of the key in octets (i.e. 128 for a 1024
	 *   bit key.
	 * @returns {string[]} An array of EME-PKCS1-v1_5 encoded chunks.
	 */
	pkcs1v1_5EncodedChunks: function(data, keysize) {
		var prep = this.prepareChunks(data, keysize - 11);
		var chunks = [];
		for (var i=0; i<prep.length; i++) {
			var r=[0,2];
			for (var j = keysize-prep[i].length-3; j > 0; j--) {
				r.push(Math.floor(Math.random()*254)+1);
			}
			r.push(0);
			chunks.push(r.concat(prep[i]));
		}
		return chunks;
	}
};
