const path = require('path');

const PATHS = {
    foo: path.join(__dirname, 'app/foo'),
    bar: path.join(__dirname, 'app/bar'),
    build: path.join(__dirname, 'build')
};

const common = {
    entry: {
        app: [PATHS.foo, PATHS.bar]
    },
    output: {
        path: PATHS.build,
        filename: '[name].js'
    }
};

var config;

switch (process.env.npm_lifecycle_event) {
    case 'build':
        config = common;
        break;
    default:
        config = common;
}

module.exports = config;