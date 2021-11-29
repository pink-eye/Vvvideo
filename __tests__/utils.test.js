import {
	normalizeCount,
	convertSecondsToDuration,
	convertDurationToSeconds,
	isEmpty,
	convertToPercentage,
} from 'Global/utils'

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

describe('Convert to percentage', () => {
	test('convert to percentage using 2 args', () => {
		expect(convertToPercentage(10, 100)).toEqual(10)
		expect(convertToPercentage(2, 50)).toEqual(4)
	})
})
