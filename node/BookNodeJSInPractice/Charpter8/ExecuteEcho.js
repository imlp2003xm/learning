var cp = require('child_process');

cp.execFile('echo', ['hello', 'world'], function(err, stdout, stderr) {
    if (err) {
        console.error(err);
    }

    console.log('stdout', stdout);
    console.log('stderr', stderr);
});