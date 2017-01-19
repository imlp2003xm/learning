let { EventEmitter } = require('events').EventEmitter;
let emitter = new EventEmitter();

emitter.on('foo', ev => {
    console.log('subscriber 1:', ev);
    ev.handled = true;
});

emitter.on('foo', ev => {
    if (ev.handled) {
        console.log('event already handled');
    }
});

emitter.emit('foo', { handled: false });