var fs = require('fs');

function writeOneMillionTimes(writer, data, encoding, callback) {
    let i = 1000000;

    write();

    function write() {
        var ok = true;

        do {
            i--;

            if (i === 0) {
                writer.write(data, encoding, callback);
            } else {
                ok = writer.write(data, encoding);
            }
        } while (i > 0 && ok);

        if (i > 0) {
            writer.once('drain', write);
        }
    }
}

let writer = fs.createWriteStream('./data.js');
writeOneMillionTimes(writer, 'writable stream is awesome!\n', "utf-8", ()=>{
    console.log('1 million writes done');
});

