const path = require('path');

module.exports = {
    entry: './public/entry.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
    },
};