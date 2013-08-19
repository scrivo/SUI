#!/bin/sh

rm -r ../build
mkdir ../build
mkdir ../build/js
mkdir ../build/css

# sui js 
php buildlib.php ../src/SUI include.js
mv include.js tmp.txt
cat bsd.txt tmp.txt > include.js
cat include.js | gzip > ../build/js/sui.gz
mv include.js ../build/js/sui.js

# sui css
php ../src/css/sui.php > tmp.txt
cat bsd.txt tmp.txt > ../build/css/sui.css

cp -r ../src/img ../build

# clean
rm tmp.txt
 