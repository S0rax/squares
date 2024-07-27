const glob = require('glob');
const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require("terser-webpack-plugin");

/** @type {import('webpack').Configuration} */
module.exports = {
    entry: {
        'main': [
            './dist/sandbox/styles.css',
            ...glob.sync('./dist/sandbox/*.js', { dotRelative: true, posix: true })
        ]
    },
    mode: 'production',
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'out'),
        publicPath: ''
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin({ extractComments: false })]
    },
    plugins: [
        new webpack.BannerPlugin(`// ==UserScript==
// @name         Squares
// @namespace    http://tampermonkey.net/
// @version      1.0.2
// @description  Squares solver
// @author       rax
// @match        https://squares.org/
// @license      MIT
// ==/UserScript==`)
    ]
};
