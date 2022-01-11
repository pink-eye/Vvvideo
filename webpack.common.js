const path = require('path')

module.exports = {
	output: {
		filename: 'main.js',
	},
	resolve: {
		alias: {
			Global: path.resolve(__dirname, 'src', 'renderer', 'global', 'js'),
			Components: path.resolve(__dirname, 'src', 'renderer', 'components'),
			Layouts: path.resolve(__dirname, 'src', 'renderer', 'layouts'),
		},
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: [/(node_modules)/, /\.test.js/],
				loader: 'babel-loader',
				options: {
					presets: [
						[
							'@babel/env',
							{
								targets: {
									esmodules: true,
								},
							},
						],
					],
				},
			},
		],
	},
}
