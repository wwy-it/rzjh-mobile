const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: "./src/main.ts",
    output: {
        filename: "[name].js",
        path: path.join(__dirname, "dist/assets"),
        // publicPath: "./dist/", //公共目录的前缀，配置之后所有的打包的引用的资源目录 前面都会加上此路径，谨慎使用，适用于打包到网络
    },
    module: {
        rules: [{
                test: /\.zml$/,
                use: {
                    loader: "html-loader"
                }
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
            },
            {
                test: /\.ts$/,
                use: "ts-loader"
            },
            //使用url-loader必须集成file-loader,url-loader里面有png|jpg|gif就不用放在file-loader处理了.
            {
                test: /\.(png|jpg|gif)$/i,
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: 1000,
                        name: 'image/[name].[ext]?[hash]',
                    }
                }, ],
            },
            // 同时处理有问题[建议将正常图片和内联图片分开处理] 
            // {
            //     test: /\.(gif|jpg|png|svg|ttf|eot|woff|otf)$/, //(png|jpg|gif|svg)
            //     loader: 'file-loader',
            //     options: {
            //         name: '[name].[ext]?[hash]', //[path][name].[ext]?[hash]!./dir/file.png
            //     },
            // },
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        alias: {
            "@": path.resolve(__dirname, "src"),
        },
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./public/index.html",
            filename: "../index.html",
            hash: true,
        }),
        new CopyWebpackPlugin({
            patterns: [{
                from: './public',
                to: '../public'
            }],
        }),
        new webpack.HotModuleReplacementPlugin()
    ],
    devServer: {
        contentBase: path.resolve(__dirname, 'dist'),
        publicPath: "./", //这个是devserver 服务器启动打包的路径
        // publicPath: "./webpack-dev-server/", //这个是devserver 服务器启动打包的路径
        host: "localhost",
        port: 9000,
        inline: true,
        open: true,
        hot: true,
    }
}