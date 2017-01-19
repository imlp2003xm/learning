const merge = require('webpack-merge');

/*var obj1 = {foo: 'foo'};
var obj2 = {bar: 'bar'};

var output = merge(obj1, obj2);
console.log(output);*/


/*var output = merge.smart({
  loaders: [{
    test: /\.js$/,
    loader: 'babel'
  }]
}, {
  loaders: [{
    test: /\.js$/,
    loader: 'coffee'
  }]
});*/

var output = merge.smart({
  loaders: [{
    test: /\.js$/,
    loader: 'coffee'
  }]
}, {
  loaders: [{
    test: /\.js$/,
    loader: 'babel'
  }]
});

console.log(output);