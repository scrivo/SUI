<?php
/**
 * Utility function to parse files that include javascript files (such as
 * core.js and editor.js) to extract the included files and compile
 * (minimize) them with the google compiler. 
 */
$dir = $argv[1];
$libfile = $argv[2];
//$outfile = $argv[2];

$file = file_get_contents($dir."/".$libfile);

$n1 = strpos($file, "([")+2; 
$n2 = strpos($file, "])"); 
$n = substr($file, $n1, $n2-$n1);
$code = "\$files = Array(".$n.");";
eval($code);

//$exec = "java -jar compiler.jar --compilation_level WHITESPACE_ONLY --js=$dir/";
$exec = "java -jar compiler.jar --js=$dir/";
$exec .= implode(" --js=$dir/", $files);
$exec .= " --js_output_file=$libfile";

exec($exec);
