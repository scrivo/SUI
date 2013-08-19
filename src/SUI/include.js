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
 * $Id: core.js 786 2013-08-09 13:26:51Z geert $
 */

//if (!console) {    var console = { log: function(dat) {} }; }

"use strict";

/* Create script tags for a number of JavaScript files.
 */
function _corelib(s) {
	var scripts= document.getElementsByTagName("script");
	var path = scripts[scripts.length-1].src.split("?")[0];
	path = path.replace("core.js", "");
	for (var i=0; i<s.length; i++) {
		document.write("<script type=\"text/javascript\" src=\""
			+ path + s[i] + "\"></script>");
	}
}

/* Include the files of the core-library.
 */
_corelib([
	"SUI.js",
	"i18n.js",
	"browser.js",
	"xhr.js",
	"style.js",
	"color.js",
	"date.js",

	"Event.js",
	"ActionList.js",

	"Border.js",
	"Padding.js",
	"Box.js",
	"TextBox.js",
	"Dragger.js",

	"AnchorLayout.js",
	"SplitLayout.js",
	"BorderLayout.js",
	"Panel.js",
	"Window.js",
	"Accordion.js",

	"PopupMenu.js",
	"Toolbar.js",
	"ToolbarSeparator.js",
	"ToolbarButton.js",
	"TreeView.js",
	"TabPanel.js",
	"ListView.js",

	"form/Form.js",
	"form/Input.js",
	"form/TextArea.js",
	"form/Button.js",
	"form/RadioButton.js",
	"form/CheckBox.js",
	"form/SelectList.js",
	"form/Label.js",

	"dialog/OKCancelDialog.js",
	"dialog/Confirm.js",
	"dialog/Alert.js",
	"dialog/Prompt.js",
	"dialog/Calendar.js",

	"control/Date.js",
	"control/ImageCropper.js",
	"control/HSVSelector.js",
	"control/HSVColorPicker.js",
	"control/ColorIntensityBar.js",
	"control/RGBColorPicker.js",
	"control/ColorTablePicker.js",
	"control/PasteData.js",
	"control/BaseHTMLEditControl.js",
	"control/HTMLEditControl.js"
]);
