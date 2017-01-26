var args = {
    '-h': displayHelp,
    '-r': readFile
};

function displayHelp() {
    console.log('Argument processor:', args);
}

function readFile(file) {
    if (file && file.length) {
        console.log('Reading:', file);
        console.time('read');
        var stream = require('fs').createReadStream(file);
        stream.on('end', function() {
            console.log('\n');
            console.timeEnd('read');
        });
        stream.pipe(process.stdout);
    } else {
        console.error('A file must be provided with -r option');
        process.exit(1);
    }
}

if (process.argv.length > 0) {
    process.argv.forEach(function(arg, index) {
        var func = args[arg];
        func && func.apply(this, process.argv.slice(index + 1));
    });
}