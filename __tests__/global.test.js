import {
	normalizeCount,
	convertSecondsToDuration,
	convertDurationToSeconds,
	isEmpty,
	formatDuration,
	formatDate,
	formatIP,
	convertToPercentage,
	isValidURLYT,
	isResourceIsChannel,
	isResourceIsPlaylist,
	getChannelIdOrUser,
	getPlaylistId,
	getMin,
} from '../src/js/global'

describe('Normalize count', () => {
	test('it should return number with spaces', () => {
		expect(normalizeCount(10000)).toEqual('10 000')
		expect(normalizeCount('100')).toEqual('100')
		expect(normalizeCount('1000000')).toEqual('1 000 000')
		expect(normalizeCount(21543273)).toEqual('21 543 273')
	})
})

describe('Convert seconds to duration', () => {
	test('it should return normal video duration like YT', () => {
		expect(convertSecondsToDuration(60)).toEqual('1:00')
		expect(convertSecondsToDuration('123')).toEqual('2:03')
		expect(convertSecondsToDuration('3601')).toEqual('01:00:01')
		expect(convertSecondsToDuration(1265)).toEqual('21:05')
		expect(convertSecondsToDuration('02:13:19')).toEqual('02:13:19')
	})
})

describe('Convert duration to seconds', () => {
	test('it should return seconds', () => {
		expect(convertDurationToSeconds('1:00')).toEqual(60)
		expect(convertDurationToSeconds('2:03')).toEqual(123)
		expect(convertDurationToSeconds('01:00:01')).toEqual(3601)
		expect(convertDurationToSeconds('21:05')).toEqual(1265)
	})
})

describe('Is empty?', () => {
	test('check if el is empty', () => {
		expect(isEmpty(null)).toEqual(true)
		expect(isEmpty('')).toEqual(true)
		expect(isEmpty(12)).toEqual(false)
		expect(isEmpty('empty')).toEqual(false)
	})
})

describe('Format duration', () => {
	test("delete each char but 0-9 and ':", () => {
		expect(formatDuration('12:t.32')).toEqual('12:32')
		expect(formatDuration('1:00')).toEqual('1:00')
		expect(formatDuration('r/Y1:12u')).toEqual('1:12')
	})
})

describe('Format date', () => {
	test("reverse default date and replace ':' with '-'", () => {
		expect(formatDate('2021-05-01')).toEqual('01.05.2021')
		expect(formatDate('2010-01-21')).toEqual('21.01.2010')
		expect(formatDate('2015-12-30')).toEqual('30.12.2015')
	})
})

describe('Format IP', () => {
	test("delete each char but 0-9 and '.'", () => {
		expect(formatIP('12:t.32')).toEqual('12.32')
		expect(formatIP('127.0.0.1')).toEqual('127.0.0.1')
		expect(formatIP('r/Y1:12u')).toEqual('112')
	})
})

describe('Convert to percentage', () => {
	test('convert to percentage using 2 args', () => {
		expect(convertToPercentage(10, 100)).toEqual(10)
		expect(convertToPercentage(2, 50)).toEqual(4)
	})
})

describe('Is valid YT URL?', () => {
	test('check if string is yt url', () => {
		expect(isValidURLYT('youtube.com/bla')).toBe(true)
		expect(isValidURLYT('https://youtube.com/?watch=v')).toBe(true)
		expect(isValidURLYT('youtube.cm/?watch=v')).toBe(null)
	})
})

describe('Is Channel YT URL', () => {
	test('check if string is yt url referring to channel', () => {
		expect(isResourceIsChannel('https://youtube.com/channel/')).toBe(true)
		expect(isResourceIsChannel('https://youtube.com/c/')).toBe(true)
	})
})

describe('Is Channel YT URL', () => {
	test('check if string is yt url referring to playlist', () => {
		expect(isResourceIsPlaylist('youtube.com/playlist?list=')).toBe(true)
		expect(isResourceIsPlaylist('http://youtu.be/playlist?list=')).toBe(true)
	})
})

describe('Get id of yt channel', () => {
	test('it should return id of yt channel from given url', () => {
		expect(getChannelIdOrUser('youtube.com/channel/15')).toEqual('15')
		expect(getChannelIdOrUser('youtube.com/user/Blender')).toEqual('Blender')
		expect(getChannelIdOrUser('http://youtube.com/c/123')).toEqual('123')
	})
})

describe('Get id of yt playlist', () => {
	test('it should return id of yt playlist from given url', () => {
		expect(getPlaylistId('youtube.com/playlist?list=15')).toEqual('15')
		expect(getPlaylistId('youtube.com/playlist?list=123')).toEqual('123')
	})
})

const getMin = (a, b) => (a > b ? b : a)

describe('Get min of both', () => {
	test('', () => {
		expect(getMin(2, 10)).toEqual(2)
		expect(getMin(100, 10)).toEqual(10)
	})
})
