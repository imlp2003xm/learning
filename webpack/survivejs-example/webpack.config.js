const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');

const PATHS = {
    app: path.join(__dirname, 'app'),
    build: path.join(__dirname, 'build')
};

const parts = require('./webpack.parts');

const common = {
    entry: {
        app: PATHS.app
    },
    output: {
        path: PATHS.build,
        publicPath: 'assets/',
        filename: '[name].js'
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'SurviveJS Example'
        })
    ]
};

module.exports = function(env) {
    var config;

    if (env.build) {
        config = merge(common);
    } else {
        config = merge(common, {
            performance: {
                hints: false
            },
            plugins: [
                new webpack.NamedModulesPlugin()
            ]
        }, parts.devServer({
            host: '127.0.0.1',
            port: 9100,
            contentBase: PATHS.build
        }));
    }

    return config;
}