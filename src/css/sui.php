<?php
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
 * $Id: sui.css 234 2012-02-08 17:07:18Z geert $
 */
error_reporting(0);


include ('popupmenu.php');
include ('toolbar.php');
include ('treeview.php');
include ('tabpanel.php');
include ('accordion.php');
include ('listview.php');
include ('window.php');
include ('borderlayout.php');
include ('panel.php');
include ('dialog.php');

?>

button {
	padding-top: 1px;
	padding-bottom: 2px;
	line-height: 20px;
}

textarea  {
	resize:none; 
}

.sui-font {
	font-family: Arial, sans-serif;
	font-size: 13px;
}

.no-select
{
	user-select: none;
	-o-user-select:none;
	-moz-user-select: -moz-none;
	-khtml-user-select: none;
	-webkit-user-select: none;
}

.select
{
	user-select: text;
	-o-user-select:text;
	-moz-user-select: text;
	-khtml-user-select: text;
	-webkit-user-select: text;
}

.no-focus:focus {
	outline: none;
}

.sui-overlay-disable {
	background-color: #888888;
	background-color: #000000;
	filter:alpha(opacity=40);
	-moz-opacity:0.4;
	-khtml-opacity: 0.4;
	opacity: 0.4;
}

.sui-icr-croparea {
	border-style: dashed;
	border-color: black;
}

.sui-icr-crop {
	opacity: 0.5;
	filter:alpha(opacity=50);
	background-color:black;
}

.sui-icr-handle {
	background-color:#FFFFFF;
	border:1px solid #333333;
}

.sui-form-header {
	font-size: 15px;
	font-weight: bold;
}

/* TODO move these */

.sui-scrivo-he {
	border: 0;
}

.scrivo-fld-asset-detail p {
	margin: 0px;
	margin-bottom: .6em;
}
.scrivo-fld-asset-detail ul {
	position: relative;
	top:-.6em;
	margin: 0px;
	padding: 0px;
	list-style-type: square;
}
.scrivo-fld-asset-detail li {
	margin-left: 1.5em;
	padding: 0px;
}
.scrivo-fld-asset-detail div.img {
	margin-bottom: .6em;
}
.scrivo-fld-asset-detail .red {
	color: red;
}
