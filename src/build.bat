nexe ./poopweb.js --build --target windows-x86           --output ./../builds/poopweb-windows-x86.exe   && ^
nexe ./poopweb.js --build --target windows-x64           --output ./../builds/poopweb-windows-x64.exe   && ^
nexe ./poopweb.js --build --target linux-x86             --output ./../builds/poopweb-linux-x86         && ^
nexe ./poopweb.js --build --target linux-x64             --output ./../builds/poopweb-linux-x64         && ^
node ./../builder/ziphelper.js
