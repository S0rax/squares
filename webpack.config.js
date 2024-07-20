const glob = require('glob');
const path = require('path');

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
    }
};
