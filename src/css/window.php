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
 * $Id: window.php 786 2013-08-09 13:26:51Z geert $
 */

include "gr.php";

?>

.sui-window-border {
	border-color: #555;
	<?php echo shadow(4, 4, 16, 0, "#555"); ?>
	<?php echo corners(4, 4, 4, 4); ?>
}

.sui-window-border div {
	-moz-box-shadow: none;
	-webkit-box-shadow: none;
	box-shadow: none;
}

.sui-window {
	<?php echo gradient($gr1,90,70); ?>
	border-color: white;
	<?php echo corners(0, 0, 4, 4); ?>
}

.sui-window-body {
	overflow: hidden;
}

.sui-window-caption {
	font-weight: bold;
	<?php echo corners(3, 3, 0, 0); ?>
	<?php echo gradient($gr2, 50, 10); ?>
	color:white;
}

.sui-window-dragger {
	border-color: black;
	<?php echo opacity(40); ?>
}
