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
 * $Id: xhr.js 786 2013-08-09 13:26:51Z geert $
 */

"use strict";

/**
 * Holds a set of xhr related functions.
 * @namespace
 */
SUI.xhr = {

	/**
	 * <p>Convert tabelized data to an array of objects. When sending a json
	 * string containing an huge array of objects you might want to consider
	 * to send the data in a table format: nn array of values only in which
	 * the first row defines the field names of the data that follows. For
	 * example:</p>
	 * <pre class="sh_javascript">
	 * [
	 *   { id: 1, name: "Jan" },
	 *   { id: 2, name: "Piet" },
	 *   { id: 3, name: "Klaas" },
	 *   ...
	 * ]
	 * </pre>
	 * <p>Can also be presended as:</p>
	 * <pre class="sh_javascript">
	 * [
	 *   ["id", "name"],
	 *   [1, "Jan"],
	 *   [2, "Piet"],
	 *   [3, "Klaas"],
	 *   ...
	 * ]
	 * </pre>
	 * <p>This function converts the latter to the former.</p>
	 * @param {Array[]} t A table of values in which the first row defines the
	 *    names of the columns.
	 * @return {Object[]} An array of objects containing name and value
	 *    pairs.
	 */
	tableToObjArr : function(t) {
		var vd = [];
		if (t.length) {
			// the first row is header ...
			header = t[0];
			// ... the rest is data
			for (var i=1; i<t.length; i++) {
				// construct an object ...
				var r = {};
				for (var j=0; j<header.length; j++) {
					r[header[j]] = t[i][j];
				}
				// ... and add it to the result array
				vd.push(r);
			}
		}
		return vd;
	},

	/**
	 * Convert a javascript object to an url query string. The data will
	 * be url-encoded. The function does not support rescursive structures (no
	 * inner objects) but it supports 1D array values for the members of the
	 * argument object. Note that this function is designed to work with PHP
	 * and that arrays will be converted to the "name[]" syntax that (afaik)
	 * only PHP supports. For example: { a: "V&D", b: [1, 2] } will be
	 * translated to "a=V%26D&b[]=1&b[]=2".
	 * @param {Object} data An object with name and values pairs to convert
	 *     to an url query string.
	 * @return {Object} data An url query string containing the given name
	 *     and value pairs.
	 */
	queryString: function(data) {
		var t = [];
		// create name and url-encoded values pairs
		for (var i in data) {
			if (data.hasOwnProperty(i)) {
				if (data[i] instanceof Array) {
					// create PHP style array parameters
					for (var j=0; j<data[i].length; j++) {
						t.push(i+"[]="+encodeURIComponent(data[i][j]));
					}
				} else {
					t.push(i+"="+encodeURIComponent(data[i]));
				}
			}
		}
		// construct the complete query string
		return t.join("&");
	},

	/**
	 * Execute a get request to an http server and supply a callback function
	 * to deal with the response.
	 * @param {String} url The url of an xhr script on a web server.
	 * @param {Object} data An object of which the members and their values
	 *     will be converted to an url query string and appended to the url.
	 *     Note: it is also possible to add a query string directly to the url
	 *     parameter, but then you should pass null for this parameter.
	 * @param {Function} callback A function with signature ({Object}) to
	 *     handle the server's response.
	 */
	doGet: function(url, data, callback) {
		// create an XMLHttpRequest obj, if not the normal way then the MS way
		var xhr = window.XMLHttpRequest
			? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
		// if there's data append it to the url
		if (data) {
			url += "?" + this.queryString(data);
		}
		// set the callback ...
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				callback(eval("(" + xhr.responseText + ")"));
			}
		};
		// ... open the connection ...
		xhr.open("GET", url, true);
		// ... and don't send any data.
		xhr.send(null);
	},

	/**
	 * Execute a post request to an http server and supply a callback function
	 * to deal with the response.
	 * @param {String} url The url of an xhr script on a web server.
	 * @param {Object} data An object of which the members and their values
	 *     will be converted to form encoded data and send along with the
	 *     request.
	 * @param {Function} callback A function with signature ({Object}) to
	 *     handle the server's response.
	 */
	doPost: function(url, data, callback) {
		// create an XMLHttpRequest obj, if not the normal way then the MS way
		var xhr = window.XMLHttpRequest
			? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
		// set the callback ...
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				callback(eval("(" + xhr.responseText + ")"));
			}
		};
		// ... open the connection ...
		xhr.open("POST", url, true);
		// ... tell in what format we'll send the data ...
		xhr.setRequestHeader(
			"Content-type", "application/x-www-form-urlencoded");
		// ... and send the data.
		xhr.send(this.queryString(data));
	}

};
