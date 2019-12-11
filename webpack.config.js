const path = require('path');
const ServiceWorkerWebpackPlugin = require('serviceworker-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	entry: './public/index.js',
	output: {
		publicPath: '/',
	},
	mode: 'development',
	plugins: [
		new ServiceWorkerWebpackPlugin({
			entry: path.join(__dirname, './public/modules/sw.js'),
		}),
		new CopyWebpackPlugin([
			{
				from: path.join(__dirname, './public/static'),
				to: 'static',
				ignore: ['*.DS_Store'],
			},
		]),
		new HtmlWebpackPlugin({
			title: 'Next Level Mail',
			favicon: path.join(__dirname, './public/static/images/logo/nl.svg'),
			template: path.join(__dirname, './public/index.html'),
			filename: 'index.html',
		}),
	],
	module: {
		rules: [
			{
				test: /\.(sa|sc|c)ss$/i,
				use: [
					'style-loader',
					'css-loader',
				]
			},
			{
				// Для включения в css файлов шрифтов и картинок
				test: /\.(jp?g|png|woff|woff2|eot|ttf|svg)$/,
				loader: 'url-loader?limit=100000',
			},
			{
				test: /\.tmpl\.xml$/,
				loader: 'fest-webpack-loader',
			}, {
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
				},
			}, {
				// Now we apply rule for images
				test: /\.(png|jpe?g|gif|svg)$/,
				use: [
					{
						// Using file-loader for these files
						loader: 'file-loader',

						// In options we can set different things like format
						// and directory to save
						options: {
							outputPath: 'images',
						},
					},
				],
			}, {
				// Apply rule for fonts files
				test: /\.(woff|woff2|ttf|otf|eot)$/,
				use: [
					{
						// Using file-loader too
						loader: 'file-loader',
						options: {
							outputPath: 'fonts',
						},
					},
				],
			},
		],
	},
	resolve: {
		modules: [
			path.resolve(__dirname+'/public/components'),
			path.resolve(__dirname+'/public/modules'),
		],
	},
};
