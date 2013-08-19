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
 * $Id: listview.php 786 2013-08-09 13:26:51Z geert $
 */

include "gr.php";

?>

.sui-lv-row div {
	background-repeat: no-repeat;
	background-position: 2px 1px;
}

.sui-lv-viewport {
	background-color: white;
}

.sui-lv-row-even {
	border-color:<?php echo gr($gr1, 80)?>;
	background-color:<?php echo gr($gr1, 80)?>;
}

.sui-lv-row-odd {
	border-color: white;
	background-color: white;
}

.sui-lv-row-focus {
	border-color: <?php echo gr($gr2, 20)?> !important;
}

.sui-lv-row-selected {
	<?php echo gradient($gr2, 75, 55);?>
	border-top-color: <?php echo gr($gr2, 75)?>;
	border-bottom-color: <?php echo gr($gr2, 55)?>;
	color: white;
}

.sui-lv-header {
	<?php echo gradient($gr1, 86, 60) ?>
	border-color: <?php echo gr($gr1, 0)?>;
	color:black;
}

.sui-lv-header-dragger {
	background-color: <?php echo gr($gr1, 20)?>;
}

.sui-lv-header-button-pressed {
	background-color: <?php echo gr($gr1, 40)?>;
}

.sui-lv-header-spacer {
	cursor: col-resize;
}
.sui-lv-header-separator {
	border-left-color: <?php echo gr($gr1, 0)?>;
	border-right-color: <?php echo gr($gr1, 90)?>;
}

.sui-lv-header-sort-left {
	background-repeat: no-repeat;
}

.sui-lv-header-sort-right {
	background-repeat: no-repeat;
}

.sui-lv-loading {
	border-color:red;
	background-repeat: no-repeat;
	background-position: center center;
}

