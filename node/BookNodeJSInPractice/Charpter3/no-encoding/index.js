var fs = require('fs');
fs.readFile(__filename, function(err, buf) {
    var isBuf = Buffer.isBuffer(buf);
    console.log(isBuf);
});