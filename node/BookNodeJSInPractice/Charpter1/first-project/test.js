var assert = require('assert');
var CountStream = require('./countstream');
var countStream = new CountStream('example');
var fs = require('fs');
var passed = 0;

// exampl-e here will make the assertion failed.

countStream.on('total', function(count) {
    assert.equal(count, 1);
    passed++;
});

fs.createReadStream(__filename).pipe(countStream);

process.on('exit', function() {
    console.log('Assertion passed: ', passed);
});