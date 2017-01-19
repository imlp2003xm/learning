const webpack = require('webpack');

exports.devServer = function(options) {
    return {
        devServer: {
            historyApiFallback: true,
            hot: true,
            hotOnly: true,
            // inline: true,
            stats: 'errors-only',
            host: options.host,
            port: options.port,
            contentBase: options.contentBase
        },
        plugins: [
            new webpack.HotModuleReplacementPlugin({

            })
        ]
    };
};