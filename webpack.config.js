var nodeExternals = require('webpack-node-externals');
module.exports = {
 
    mode: 'development',
    // メインとなるJavaScriptファイル（エントリーポイント）
    entry: './src/index.ts',
    // See https://github.com/webpack/webpack/issues/603#issuecomment-185472374 or https://saku.io/build-for-node-runtime-using-webpack/.
    // Otherwise, you can't resolve http with node_modules stream-http!
    target: 'node',
    externals: [nodeExternals()], // in order to ignore all modules in node_modules folder

    // ファイルの出力設定
    output: {
      //  出力ファイルのディレクトリ名
      path: `${__dirname}/dist`,
      // 出力ファイル名
      filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader'
            },
            { enforce: "pre", test: /\.js$/, loader: "source-map-loader" },
        ]
    },

    resolve: {
        // see the link, https://github.com/webpack/webpack-dev-server/issues/720#issuecomment-268470989
        extensions: [".ts", ".js"],
    },
  };
  