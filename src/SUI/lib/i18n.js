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
 * $Id: i18n.js 786 2013-08-09 13:26:51Z geert $
 */

"use strict";

/**
 * SUI.i18n is a global instance that contains all the internationalization
 * keys and values.
 */
SUI.i18n = {
	/* General */
	ok: "OK",
	cancel: "Cancel",
	dateFormat: "d-m-y",
	timeFormat: "h:i",

	/* Alert Boxes */
	captionAlert: "System notification",
	captionWindow: "Dialog window",

	/* Calendar */
	arrDaysShort: ["ma","tu","we","th","fr","sa","su"],
	arrMonths: ["January", "February", "March", "April", "May", "June", "July",
		"August", "September", "October", "November", "December"],
	weekShort: "w",
	time: "Time",
	exactMinutes : "Exact time (min).",
	prevMonth: "Go to previous month",
	nextMonth: "Go to next month",
	prevYear: "Go to previous year",
	nextYear: "Go to next year",
	goToday: "Select current date",
	captionDateTime: "Date and time selection",
	captionDate: "Date selection",
	captionTime: "Time selection",

	/* Controls */
	selDateTime: "Select date and time",
	selDate: "Select date",
	selTime: "Select time",

	hsvHue: "Hue",
	hsvSaturation: "Satuarion",
	hsvValue: "Value",
	hsvCode: "Code",
	hsvColor: "Color",

	rgbRed: "Red",
	rgbGreen: "Green",
	rgbBlue: "Blue",

	dlgConfirm: "Are you sure?",
	dlgCaptConfirm: "Please confirm",
	dlgCaptPrompt: "Input required",
	dlgPrompt: "Enter value:",
	dlgAlert: "Duh",

	/**
	 * Overwrite the default values in a language resource object with
	 * internationalized ones. It searches for the common keys in both objects
	 * and copies the values of the common keys to destiny object.
	 * @param {Object} dest Object with default i18n keys and values.
	 * @param {Object} src Object internationalized i18n keys and values.
	 */
	setLocale: function(dest, src) {
		for (var x in dest) {
			if (src[x] && dest[x]) {
				if (dest[x] instanceof Object) {
					this.setLocale(dest[x], src[x]);
				} else {
					dest[x] = src[x];
				}
			}
		}
	}

};

/**
 * SUI.resource is a global object that contains all the the resource keys
 * and values.
 */
SUI.resource = {

	lvSortUp: "pointer_down.png",
	lvSortDown: "pointer_up.png",
	lvLoading: "wait_icon_grey_64.gif",

	tbMenu: "pointer_down.png",

	acClosed: "pointer_left.png",
	acDown: "pointer_down.png",

	tpScrollLeft: "pointer_left.png",
	tpScrollRight: "pointer_right.png",

	blHandle: "handle.png",

	calPrev: "pointer_left.png",
	calNext: "pointer_right.png",
	calToday: "calendar_today.png",
	calDate: "calendar.png",
	calTime: "clock.png",

	pmSub: "pointer_right.png",

	tvClosed: "pointer_right.png",
	tvOpen: "pointer_down.png",
	tvNone: "blank.png",
	tvLoadingAni: "loading2.gif",
	tvLoadingBg: "loading2.png",
	tvPage: "page.png",
	tvFolder: "folder.png",

	wnClose: "close2.png",

	mbQuestion: "question_32.png",
	mbError: "error_32.png",
	mbAlert: "alert_32.png",
	mbOK: "ok_32.png",

	ecAnchor: "anchor.png",
	ecAbbr: "abbreviation.png",
	ecLang: "language.png",

	hsvSatVal: "colorsatval.png",
	hsvHue: "colorhue.png",
	hsvChSatVal: "colorcrosshair.png",
	hsvChHue: "huecrosshair.png",

	rgbBar: "colorrgb.png",
	rgbCh: "rgbcrosshair.png"

};

