var autoprefixer = require('autoprefixer');
var path = require('path');

var join = path.join;
var styleDir = [
  join(__dirname, 'src'),
  join(__dirname, '.build'),
  join(__dirname, 'node_modules'),
];

var svgDir = [
  require.resolve('antd').replace(/warn\.js$/, ''),
  join(__dirname, 'src'),
];

module.exports = {
  components: 'src/components/*/[A-Z]*.js',
  getExampleFilename(componentPath) {
    var filename = path.basename(componentPath);
    var dirname = path.dirname(componentPath);

    return path.join(dirname, 'doc', filename.replace(/\.jsx?$/, '.md'));
  },
  ignore: [
    '**/__tests__/**',
    '**/*.test.{js,jsx,ts,tsx}',
    '**/*.spec.{js,jsx,ts,tsx}',
    '**/*.d.ts',
    '**/components/EditComponent/*.js'
  ],
  webpackConfig: {
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          use: {
            loader: 'babel-loader',
            options: {
              extends: join(__dirname, '.babelrc'),
              cacheDirectory: true,
            },
          },
          exclude: /node_modules/
        },
        {
          test: /\.css$/,
          use: [
            ( () => { return 'style-loader'; })(),
            {
              loader: 'css-loader',
              options: {
                minimize: false,
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                plugins: () => [
                  autoprefixer(false),
                ],
              },
            },
          ],
          include: styleDir,
        },
        {
          test: /\.less$/,
          use: [
            ( () => { return 'style-loader'; } )(),
            {
              loader: 'css-loader',
              options: {
                minimize: false,
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                plugins: () => [
                  autoprefixer(false),
                ],
              },
            },
            {
              loader: 'less-loader',
              options: {
                javascriptEnabled: true,
              },
            },
          ],
          include: styleDir,
        },
        {
          test: /\.(png|jpe?g|gif)$/,
          use: [
            {
              loader: 'url-loader',
              options: {
                name: '[name]-[hash:10].[ext]',
                limit: 10000,
                outputPath: 'resources/images/'
              },
            },
            'image-webpack-loader',
          ],
          include: styleDir,
        },
        {
          test: /\.svg$/,
          use: [
            {
              loader: 'svg-sprite-loader',
              options: {
                limit: 10000,
                spriteFilename: 'resources/images/sprite.svg',
              },
            },
            {
              loader: 'image-webpack-loader',
              options: {
                svgo: {
                  plugins: [{
                      cleanupAttrs: true
                    }, // 清理属性换行和重复的空格
                    {
                      cleanupEnableBackground: true
                    }, // 移除或清理 enable-background 属性
                    {
                      cleanupIDs: true
                    }, // 清理未使用的 和 压缩使用的 ID
                    {
                      removeRasterImages: true
                    }, // 移除栅格图标，默认值 false √
                    {
                      removeDimensions: true
                    }, // 移除 width/height 属性，默认值 false √
                    {
                      removeStyleElement: true
                    }, // 移除 <style> 元素，默认值 false √
                  ]
                }
              },
            },
          ],
          include: svgDir,
        },
      ]
    },
    resolve: {
      alias: {
        "rework": "rework.less/rework.less",
        "sprite": "sprite.less"
      },
      // Ant Design Mobile（Web）：".web.js"
      extensions:  [
        ".web.js",
        ".js"
      ],
      // 普通版：main
      // ES2015+ Version：jsnext:main
      mainFields: [
        "browser",
        "jsnext:main",
        "main"
      ],
      modules: [
        join(__dirname, '.build'),
        join(__dirname, 'node_modules'),
      ],
    }
  }
}
