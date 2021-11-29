import { YoutubeHelper } from 'Global/youtube-helper'

const yh = new YoutubeHelper()

describe('Is channel', () => {
	test('', () => {
		expect(yh.isChannel('https://www.youtube.com/c/A4a4a4a4')).toBeTruthy()
		expect(yh.isChannel('https://www.youtube.com/user/BlenderFoundation')).toBeTruthy()
		expect(yh.isChannel('https://www.youtube.com/chan/BlenderFoundation')).toBeFalsy()
		expect(yh.isChannel('https://www.yoube.com/channel/BlenderFoundation')).toBeFalsy()
	})
})

describe('Is playlist', () => {
	test('', () => {
		expect(yh.isPlaylist('https://www.youtube.com/playlist?list=PLa1F2ddGya_8Geu0rJ4y4dVCc9jZxS2IB')).toBeTruthy()
		expect(yh.isPlaylist('https://www.youtube.com/playlist=PLa1F2ddGya_8Geu0rJ4y4dVCc9jZxS2IB')).toBeFalsy()
	})
})

describe('Get channel id', () => {
	test('', () => {
		expect(yh.getChannelId('https://www.youtube.com/c/A4a4a4a4')).toEqual('A4a4a4a4')
		expect(yh.getChannelId('https://www.youtube.com/user/BlenderFoundation')).toEqual('BlenderFoundation')
		expect(yh.getChannelId('https://www.youtube.com/channel/someChannel')).toEqual('someChannel')
	})
})

describe('Get playlist id', () => {
	test('', () => {
		expect(yh.getPlaylistId('https://www.youtube.com/playlist?list=PLa1F2ddGya_8Geu0rJ4y4dVCc9jZxS2IB')).toEqual(
			'PLa1F2ddGya_8Geu0rJ4y4dVCc9jZxS2IB'
		)
		expect(yh.getPlaylistId('https://www.youtube.com/playlist?list=PLa1F2ddGASD_123DSu0rJ4y4dVCc9jZxS2IB')).toEqual(
			'PLa1F2ddGASD_123DSu0rJ4y4dVCc9jZxS2IB'
		)
	})
})
