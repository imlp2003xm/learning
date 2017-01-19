var fs = require('fs');

var readableStream = fs.createReadStream('./cool.txt');

readableStream.pipe(process.stdout);