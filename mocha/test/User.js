'use strict';

module.exports = class User {
    constructor(name) {
        this.name = name;
    }

    save(done) {
        setTimeout(() => {
            done(new Error('can not connect the database'));
            // done();
        }, 1000);
    }
}