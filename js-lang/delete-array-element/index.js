var _ = require('lodash');

var arr = [1, 2, 3, 4, 5, 6];

for (var i = 0, len = arr.length; i < len; ++i) {
    console.log(arr[i]);

    if (i == 0) {
        delete arr[i];
        arr = _.compact(arr);
    }
}

//output: 1, 3, 4, 5, 6, undefined