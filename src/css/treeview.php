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
 * $Id: treeview.php 786 2013-08-09 13:26:51Z geert $
 */

include "gr.php";

?>

.sui-tv {
	overflow: auto;
}
.sui-tv ul {
	margin: 0px;
	padding: 0px;
	list-style: none;
}
.sui-tv li {
	margin: 0px;
	padding: 0px;
}

.sui-tv div {
	white-space: nowrap;
}

.sui-tv {
	background-color: white;
}

.sui-tv-row {
	background-color: white;
	border-color: transparent;
	border-style: solid;
	padding-top: 1px;
}

.sui-tv-row img {
	vertical-align:bottom;
}

.sui-tv-row span {
	position:relative;
	top: 1px;
	padding-left: 3px;
}

.sui-tv-row-selected {
	<?php echo gradient($gr2, 75, 55);?>
	color: white;
	border-top-color: <?php echo gr($gr2, 75)?>;
	border-bottom-color: <?php echo gr($gr2, 55)?>;
	color: white;
}

.sui-tv-row-highlight {
	<?php echo gradient($gr1, 95, 85);?>
	border-top-color: <?php echo gr($gr1, 95)?>;
	border-bottom-color: <?php echo gr($gr1, 85)?>;
	color:black;
}


