module.exports = {
 
    mode: 'development',
    // メインとなるJavaScriptファイル（エントリーポイント）
    entry: `./src/index.ts`,
   
    // ファイルの出力設定
    output: {
      //  出力ファイルのディレクトリ名
      path: `${__dirname}/dist`,
      // 出力ファイル名
      filename: 'main.js'
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader'
            }
        ]
    },

    resolve: {
        extensions: [".ts", ".tsx", ".js", ".json"]
    },
  };
  