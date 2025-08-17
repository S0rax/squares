const glob = require('glob');
const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { AngularWebpackPlugin } = require('@ngtools/webpack');

const { version } = require('./package.json');

/** @type {import('webpack').Configuration} */
module.exports = {
    entry: {
        main: [path.resolve(__dirname, 'src/main.ts'), path.resolve(__dirname, 'dist/squares/browser/styles.css')]
    },
    mode: 'production',
    resolve: {
        modules: ['node_modules'],
        extensions: ['.ts', '.tsx', '.js', '.json'],
        alias: {
            src: path.resolve(__dirname, 'src')
        }
    },
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
            },
            {
                test: /\.ts$/,
                loader: '@ngtools/webpack'
            },
            {
                test: /\.html$/,
                use: ['raw-loader']
            },
            {
                test: /\.scss$/,
                exclude: /styles\.scss$/,
                use: ['raw-loader', 'sass-loader']
            },
            {
                test: /crypto-es[\/\\].*\.js$/,
                resolve: { fullySpecified: false }
            },
            {
                enforce: 'pre',
                test: /\.js$/,
                loader: 'source-map-loader',
                exclude: /node_modules/
            }
        ]
    },
    optimization: {
        minimize: true,
        usedExports: true,
        concatenateModules: true,
        sideEffects: true,
        minimizer: [
            new TerserPlugin({
                extractComments: false,
                terserOptions: {
                    format: {
                        comments: (node, comment) => {
                            if (!comment || typeof comment.value !== 'string') return false;
                            return /^\s*(?:==UserScript==|==\/UserScript==|@name\b|@namespace\b|@version\b|@description\b|@author\b|@match\b|@license\b)/.test(comment.value);
                        }
                    }
                }
            })
        ]
    },
    plugins: [
        new AngularWebpackPlugin({
            tsconfig: path.resolve(__dirname, 'tsconfig.app.json'),
            jitMode: false,
            directTemplateLoading: true
        }),
        new CopyPlugin({
            patterns: (() => {
                const files = glob.sync('./dist/squares/browser/*.js', { nodir: true }).filter((f) => !f.endsWith('/main.js') && !f.endsWith('browser/main.js'));
                if (!files || files.length === 0) {
                    return [];
                }
                return files.map((f) => ({
                    from: path.resolve(__dirname, f),
                    to: path.resolve(__dirname, 'out'),
                    noErrorOnMissing: true
                }));
            })()
        }),
        new webpack.BannerPlugin({
            banner: `// ==UserScript==
// @name         Squares
// @namespace    https://tampermonkey.net/
// @version      ${version}
// @description  Squares solver
// @author       rax
// @match        https://squares.org/
// @license      MIT
// ==/UserScript==`,
            raw: true
        })
    ]
};
