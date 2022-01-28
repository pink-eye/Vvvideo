module.exports = {
	publishers: [
		{
			name: '@electron-forge/publisher-github',
			config: {
				repository: {
					owner: 'pink-eye',
					name: 'Vvvideo',
				},
			},
		},
	],
	packagerConfig: {
		name: 'vvvideo',
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
				icon: './assets/icons/icon.icns',
			},
		},
		{
			name: '@electron-forge/maker-zip',
			platforms: ['darwin'],
		},
		{
			name: '@electron-forge/maker-deb',
			config: {
				options: {
					icon: './assets/icons/icon.png',
					homepage: 'https://github.com/pink-eye/Vvvideo',
				},
			},
		},
		{
			name: '@electron-forge/maker-rpm',
			config: {
				options: {
					icon: './assets/icons/icon.png',
					homepage: 'https://github.com/pink-eye/Vvvideo',
				},
			},
		},
	],
}
