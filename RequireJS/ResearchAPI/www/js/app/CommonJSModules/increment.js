define(function(require, exports, module) {
    var add = require('./add');

    console.log('request paths: ', require.paths);
    console.log('module id: ', module.id);
    console.log('module uri: ', module.uri);

    return function(val) {
        return add(val, 1);
    };
}); 