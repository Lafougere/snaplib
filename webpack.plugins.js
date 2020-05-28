
const path = require('path')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = [
	new ForkTsCheckerWebpackPlugin(),
	new CopyWebpackPlugin([
			
		{
			from: path.join(path.resolve(__dirname, './node_modules/@webcomponents/webcomponentsjs/'), '*.js'),
			to: './webcomponentjs',
			flatten: true
		},
		{
			from: path.resolve(__dirname, 'models'),
			to: './models'
		},
	
	]),
]
