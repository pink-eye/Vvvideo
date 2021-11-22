module.exports = {
	output: {
		filename: 'main.js',
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /(node_modules)/,
				loader: 'babel-loader',
				options: {
					presets: [
						[
							'@babel/preset-env',
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
