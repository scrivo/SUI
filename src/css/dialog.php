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
 * $Id: dialog.php 786 2013-08-09 13:26:51Z geert $
 */

include "gr.php";

?>

.sui-cal-day {
	border-color: white;
	background-color: white;
	text-align: center;
	vertical-align: center;
}

.sui-cal-otherday {
	border-color: white;
	background-color: white;
	color: <?php echo gr($gr1, 0)?> !important;
	text-align: center;
	vertical-align: center;
	font-style: italic;
}

.sui-cal-day-hover {
	border-color: <?php echo gr($gr1, 0)?> !important;
	background-color:<?php echo gr($gr2, 99)?> !important;
	color: white !important;
}

.sui-cal-selected {
	border-color: <?php echo gr($gr2, 20)?> !important;
	background-color:<?php echo gr($gr2, 65)?> !important;
	color: white !important;
	font-weight: bold;
}

.sui-cal-weekend {
	border-color:<?php echo gr($gr1, 80)?>;
	background-color:<?php echo gr($gr1, 80)?>;
}


.sui-cal-weekno {
	border-color:<?php echo gr($gr2, 35)?>;
	background-color:<?php echo gr($gr2, 35)?>;
	color: white;
	text-align: center;
}

.sui-cal-header {
	border-color:<?php echo gr($gr2, 35)?>;
	background-color:<?php echo gr($gr2, 35)?>;
	color: white;
	text-align: center;
	font-weight: bold;
}

