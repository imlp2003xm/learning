'use strict';

var assert = require('assert');
var User = require('./User');

describe('Array', function() {
    describe('#indexOf()', function() {
        it('should return -1 when the value is not present', function() {
            assert.equal(-1, [1, 2, 3].indexOf(4));
        });
    });
});

describe('User', function() {
    describe('#save()', function() {
        it('should save without error', function(done) {
            let user = new User('Luna');

            user.save(function(err) {
                if (err) {
                    done(err);
                } else {
                    done();
                }
            });
        })
    });
});

describe('parseInt', function() {
    describe('96', function() {
        it('should return 96', function() {
            assert.equal(96, parseInt('96'));
        });
    });
});