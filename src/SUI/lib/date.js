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
 * $Id: date.js 786 2013-08-09 13:26:51Z geert $
 */

"use strict";

/**
 * @summary
 * The SUI.date namespace contains a set of utility functions for working
 * with dates. 
 * 
 * @description
 * The JavaScript Date object gives us a lot of functionality, but since we'll
 * be working with SQL type dates (YYYY-MM-DD HH:II:SS) a lot this namespace
 * contains a minimal set of utility functions for conversions between SQL 
 * date strings and JavaScript Date objects
 * 
 * @namespace
 */
SUI.date = {

	/**
	 * Format a JavaScript Date object according to the locale or format
	 * string.
	 * @param {Date} dt A JavaScript Date object for which to create a
	 *    string representation.
	 * @param {String} format A date format string. possible values: date
	 *    (default)/time/datetime (format according to the locale) or a
	 *    format string containing the following letters: d,m,y,h,i,s
	 * @return {String} The given date in the requested format.
	 */
	format: function(dt, format) {

		// Find out which format string to use, start with the argument: ....
		var df = format;
		// ... but use one of the local string in the following cases instead
		if (format === "date" || format === undefined) {
			df = SUI.i18n.dateFormat;
		} else if (format === "datetime") {
			df = SUI.i18n.dateFormat + " " + SUI.i18n.timeFormat;
		} else if (format === "time") {
			df = SUI.i18n.timeFormat;
		}

		// now construct the output string ...
		var str = "";
		// ... for each letter in the format string ...
		for (var i=0; i<df.length; i++) {
			switch(df.charAt(i)) {

			case "d":
				// append the day as 2 digits to the string
				str += SUI.date.padZero(dt.getDate());
				break;

			case "m":
				// append the month as 2 digits to the string
				str += SUI.date.padZero(dt.getMonth()+1);
				break;

			case "y":
				// append the year as 4 digits to the string
				str += SUI.date.padZero(dt.getFullYear(), 4);
				break;

			case "h":
				// append the hour as 2 digits to the string
				str += SUI.date.padZero(dt.getHours());
				break;

			case "i":
				// append the minutes as 2 digits to the string
				str += SUI.date.padZero(dt.getMinutes());
				break;

			case "s":
				// append the seconds as 2 digits to the string
				str += SUI.date.padZero(dt.getSeconds());
				break;

			default:
				// append the non-format character (separator) to the string
				str += df.charAt(i);
				break;
			}
		}

		// return the result
		return str;
	},

	/**
	 * Create a zero padded string for date displaying.
	 * @param {int} v The number to pad the zeros to.
	 * @param {int} n The maximum length of the result string (defaults to 2).
	 * @return {String} A zero padded string.
	 */
	padZero: function(v, n) {
		return isNaN(v) ? "" : ("0000"+v).substr(-(n||2));
	},

	/**
	 * Parse an SQL date string into a JavaScript Date object.
	 * @param {String} d A string in SQL date format (date or timestamp)
	 * @return {Date} A JavaScript Date object
	 */
	parseSqlDate: function(d) {

		// if no valid string was given return null
		if (!d || d.length < 10) {
			return null;
		}

		// use substrings from the SQL date string to construct a JavaScript
		// date object
		return new Date(
			parseInt(d.substr(0,4),10),
			parseInt(d.substr(5,2),10)-1,
			parseInt(d.substr(8,2),10),
			d.length > 12 ? parseInt(d.substr(11,2),10) : 0,
			d.length > 15 ? parseInt(d.substr(14,2),10) : 0,
			d.length > 18 ? parseInt(d.substr(17,2),10) : 0
		);
	},

	/**
	 * Create an SQL date string from an JavaScript Date object.
	 * @param {Date} dt A JavaScript Date to format as a SQL date string
	 * @param {boolean} timestamp Return the value as SQL date (default) or
	 *     SQL timestamp
	 * @return {String} An date string in SQL format.
	 */
	toSqlDate: function (dt, timestamp) {
		return SUI.date.format(dt, timestamp ? "y-m-d h:i:s" : "y-m-d");
	}

};
