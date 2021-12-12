(async () => {
    const fs = require('fs');
    const archiver = require('archiver');

    // ======= windows x86 =======
    console.log("zipping win x86");
    var output = fs.createWriteStream('./../builds/poopweb-windows-x86.zip');
    var archive = archiver('zip');
    archive.append(fs.readFileSync('./../builds/poopweb-windows-x86.exe'), {name: 'poopweb-windows-x86.exe'});
    archive.pipe(output);
    await archive.finalize();

    // ======= windows x64 =======
    console.log("zipping win x64");
    var output = fs.createWriteStream('./../builds/poopweb-windows-x64.zip');
    var archive = archiver('zip');
    archive.append(fs.readFileSync('./../builds/poopweb-windows-x64.exe'), {name: 'poopweb-windows-x64.exe'});
    archive.pipe(output);
    await archive.finalize();

    // ======= linux x86 =======
    console.log("zipping linux x86");
    var output = fs.createWriteStream('./../builds/poopweb-linux-x86.zip');
    var archive = archiver('zip');
    archive.append(fs.readFileSync('./../builds/poopweb-linux-x86'), {name: 'poopweb-linux-x86'});
    archive.pipe(output);
    await archive.finalize();

    // ======= linux x64 =======
    console.log("zipping linux x64");
    var output = fs.createWriteStream('./../builds/poopweb-linux-x64.zip');
    var archive = archiver('zip');
    archive.append(fs.readFileSync('./../builds/poopweb-linux-x64'), {name: 'poopweb-linux-x64'});
    archive.pipe(output);
    await archive.finalize();
})();