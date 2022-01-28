module.exports = {
	moduleFileExtensions: ['js'],
	moduleNameMapper: {
		'^Global/(.*)$': '<rootDir>/src/renderer/global/js/$1',
		'^Components/(.*)$': '<rootDir>/src/renderer/components/$1',
		'^Layouts/(.*)$': '<rootDir>/src/renderer/layouts/$1',
	},
}
