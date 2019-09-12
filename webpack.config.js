const nodeExternals = require('webpack-node-externals');
const path = require('path');
const {
    NODE_ENV = 'production',
} = process.env;

module.exports = {
    entry: './src/index',
     externals:[nodeExternals()],
    mode: NODE_ENV,
    node: {
		__filename: true,
		__dirname: true
	},
    target: 'node',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'server.bundle.js'
    },
    resolve: {
        extensions: ['.ts','.sql', '.js'],
        modules: [
             './node_modules'
        ]
    },
    module: {
        rules: [
            {
                enforce: 'pre',
                test: /\.js$/,
                use: 'source-map-loader'
            },
            {
                test: /\.ts$/,
                exclude: [/node_modules/],
                use: 'ts-loader'
            }
        ]
    }
}