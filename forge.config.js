module.exports = {
	packagerConfig: {
		name: 'Vvvideo',
		icon: './assets/icons/icon.',
		ignore: [
			'^(/__tests__$)',
			'^(/.husky$)',
			'^(/gulp$)',
			'^(/.yarn$)',
			'^(/src$)',
			'webpack\\.\\w+\\.js',
			'gulpfile.js',
		],
	},
	makers: [
		{
			name: '@electron-forge/maker-squirrel',
			config: {
				iconUrl:
					'https://raw.githubusercontent.com/pink-eye/Vvvideo/main/src/res/assets/icons/icon.ico',
			},
		},
		{
			name: '@electron-forge/maker-dmg',
			config: {
				icon: './assets/icons/icon.incs',
			},
		},
		{
			name: '@electron-forge/maker-zip',
			platforms: ['darwin'],
		},
		{
			name: '@electron-forge/maker-deb',
			config: {},
		},
		{
			name: '@electron-forge/maker-rpm',
			config: {},
		},
	],
}
