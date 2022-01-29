const APP_NAME = 'Vvvideo'
const path = require('path')

module.exports = {
	publishers: [
		{
			name: '@electron-forge/publisher-github',
			config: {
				repository: {
					owner: 'pink-eye',
					name: APP_NAME,
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
				exe: APP_NAME,
				setupIcon: path.join(__dirname, 'assets', 'icons', 'icon.ico'),
				skipUpdateIcon: true,
				iconUrl:
					'https://raw.githubusercontent.com/pink-eye/Vvvideo/main/assets/icons/icon.ico',
			},
		},
		{
			name: '@electron-forge/maker-dmg',
			config: {
				name: APP_NAME,
				icon: path.join(__dirname, 'assets', 'icons', 'icon.icns'),
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
					icon: path.join(__dirname, 'assets', 'icons', 'icon.png'),
					homepage: 'https://github.com/pink-eye/Vvvideo',
				},
			},
		},
		{
			name: '@electron-forge/maker-rpm',
			config: {
				options: {
					icon: path.join(__dirname, 'assets', 'icons', 'icon.png'),
					homepage: 'https://github.com/pink-eye/Vvvideo',
				},
			},
		},
	],
}
