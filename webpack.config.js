const path = require('path');

module.exports = {
    entry: './public/entry.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
    },
    watch: true,
    module: {
        rules: [
            {
                test: /\.(scss|css)$/,
                use: [
                    {
                        loader: "style-loader"
                    },
                    {
                        loader: "css-loader"
                    },
                ]
            },
            {
                test: /\.(gif|svg|jpg|png)$/,
                use: [
                    {
                        loader: "file-loader"
                    },
                ]
            }
        ],
    },
};