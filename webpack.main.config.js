const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
module.exports = {
	/**
	 * This is the main entry point for your application, it's the first file
	 * that runs in the main process.
	 */
	entry: './src/index.ts',
	// Put your normal webpack config below here
	// target: 'electron-renderer',
	module: {
		rules: require('./webpack.rules'),
	},
	resolve: {
		extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json']
	},
	plugins: [
		new CopyWebpackPlugin([

			{
				from: path.join(path.resolve(__dirname, './src'), 'preload.js'),

			}
		]),
		
	]
}