var CountStream = require('./countstream');
var countStream = new CountStream('特朗普');
var http = require('http');

http.get('http://www.sina.com.cn/', function(res) {
    res.pipe(countStream);
});
countStream.on('total', function(count) {
    console.log('Total matches: ', count);
});