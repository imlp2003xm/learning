var { Readable } = require('stream');

class CounterStream extends Readable {
    constructor() {
        super();

        this._max = 1000;
        this._index = 1;
    }

    _read(size) {
        var i = this._index++;
        if (i > this._max) {
            this.push(null);
        } else {
            var str = ' ' + i;
            this.push(str);
        }
    }
}

let cs = new CounterStream();
cs.pipe(process.stdout);