module.exports = {
	output: {
		filename: 'main.js',
	},
	devtool: 'eval-source-map',
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /(node_modules)/,
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
