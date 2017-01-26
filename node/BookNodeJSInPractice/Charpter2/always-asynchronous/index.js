var EventEmitter = require('events').EventEmitter;
var fs = require('fs');
var content;

function readFileIfRequired(cb) {
    if (!content) {
        fs.readFile(__filename, 'utf-8', function(err, data) {
            content = data;
            console.log('readFileIfRequired: readFile');
            cb(err, content);
        });
    } else {
        process.nextTick(function() {
            console.log('readFileIfRequired: cached');
            cb(null, content);
        });
    }
}

readFileIfRequired(function(err, data) {
    console.log('1. Length:', data.length);

    readFileIfRequired(function(err, data2) {
        console.log('2. Length:', data.length);
    });

    console.log('Reading file again...');
});

console.log('Reading file...');