var exec = require('child_process').exec;
var child = exec('node ./Server.js');
child.stdout.on('data', function(data) {
    console.log('stdout: ' + data);
});
child.stderr.on('data', function(data) {
    console.log('stderr:' + data);
});
child.on('close', function(code) {
    console.log('cloing code: ' + code);
});