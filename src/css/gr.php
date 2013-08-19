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
 * $Id: gr.php 786 2013-08-09 13:26:51Z geert $
 */

header("Content-Type: text/css");
/*
$gr1=array("gsr"=>198,"gsg"=>163,"gsb"=>19,"ger"=>254,"geg"=>254,"geb"=>254);
$gr1=array("gsr"=>120,"gsg"=>160,"gsb"=>240,"ger"=>254,"geg"=>254,"geb"=>254);
// olive
$gr1=array("gsr"=>156,"gsg"=>156,"gsb"=>93,"ger"=>254,"geg"=>254,"geb"=>254);
$gr1=array("gsr"=>193,"gsg"=>193,"gsb"=>115,"ger"=>254,"geg"=>254,"geb"=>254);
// purple
$gr1=array("gsr"=>210,"gsg"=>180,"gsb"=>180,"ger"=>254,"geg"=>254,"geb"=>254);
// gray
$gr1=array("gsr"=>180,"gsg"=>180,"gsb"=>195,"ger"=>254,"geg"=>254,"geb"=>254);
// gray 2
$gr1=array("gsr"=>190,"gsg"=>180,"gsb"=>195,"ger"=>254,"geg"=>254,"geb"=>254);
*/
$gr1=array("gsr"=>193,"gsg"=>193,"gsb"=>150,"ger"=>255,"geg"=>255,"geb"=>255);
/*
// purble
$gr2 = array("gsr"=>93,"gsg"=>22,"gsb"=>88,"ger"=>176,"geg"=>132,"geb"=>167);
*/
// blue
$gr2=array("gsr"=>20,"gsg"=>24,"gsb"=>40,"ger"=>120,"geg"=>144,"geb"=>240);

function gr($gr, $perc) {

	$r = dechex($gr["gsr"] + intval(($gr["ger"]-$gr["gsr"])*$perc/100));
	$g = dechex($gr["gsg"] + intval(($gr["geg"]-$gr["gsg"])*$perc/100));
	$b = dechex($gr["gsb"] + intval(($gr["geb"]-$gr["gsb"])*$perc/100));

	return "#$r$g$b";
}

function gradient($gr, $start, $end) {
	$s = "background-color:".gr($gr, intval(($start+$end)/2)).";\n\t";
	$s .= "filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='"
		.gr($gr, $start)."', endColorstr='".gr($gr, $end)."');\n\t";
	$s .= "background: -webkit-gradient(linear, left top, left bottom, from("
		.gr($gr, $start)."), to(".gr($gr, $end)."));\n\t";
	$s .= "background: -moz-linear-gradient(top,".gr($gr, $start).","
		.gr($gr, $end).");\n";
	return $s;
}

function corners($tl, $tr, $br, $bl) {
//$tl *= 10; $tr *= 10; $br *= 10; $bl *=10;
	$s = "";
	$s .= "-webkit-border-top-left-radius: {$tl}"."px;\n"
		."\t-moz-border-radius-topleft: {$tl}px;\n"
		."\t-khtml-border-top-left-radius: {$tl}px;\n"
		."\tborder-top-left-radius: {$tl}px;\n";
	$s .= ($s?"\t":"")."-webkit-border-top-right-radius: {$tr}px;\n"
		."\t-moz-border-radius-topright: {$tr}px;\n"
		."\t-khtml-border-top-right-radius: {$tr}px;\n"
		."\tborder-top-right-radius: {$tr}px;\n";
	$s .= ($s?"\t":"")."-webkit-border-bottom-left-radius: {$bl}px;\n"
		."\t-moz-border-radius-bottomleft: {$bl}px;\n"
		."\t-khtml-border-bottom-left-radius: {$bl}px;\n"
		."\tborder-bottom-left-radius: {$bl}px;\n";
	$s .= ($s?"\t":"")."-webkit-border-bottom-right-radius: {$br}px;\n"
		."\t-moz-border-radius-bottomright: {$br}px;\n"
		."\t-khtml-border-bottom-right-radius: {$br}px;\n"
		."\tborder-bottom-right-radius: {$br}px;\n";
	return $s;
}

function shadow($h_offset, $v_offset, $blur_dist, $spread_dist, $color) {
	$s = "-moz-box-shadow: {$h_offset}px {$v_offset}px"
		." {$blur_dist}px {$spread_dist}px {$color};\n\t";
	$s .= "-webkit-box-shadow: {$h_offset}px {$v_offset}px"
		." {$blur_dist}px {$spread_dist}px {$color};\n\t";
	$s .= "box-shadow: {$h_offset}px {$v_offset}px"
		." {$blur_dist}px {$spread_dist}px {$color};\n";
	return $s;
}

function opacity($perc) {
	$v2 = $perc/100;
	$s = "-ms-filter: "
		."'progid:DXImageTransform.Microsoft.Alpha(Opacity={$perc})';\n\t";
	$s .= "filter: alpha(opacity={$perc});\n\t";
	$s .= "-moz-opacity: {$v2};\n\t";
	$s .= "-khtml-opacity: {$v2};\n\t";
	$s .= "opacity: {$v2};\n";
	return $s;
}

?>
