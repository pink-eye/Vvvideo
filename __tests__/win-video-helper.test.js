import { roundNum, formatDate } from 'Layouts/win-video/helper';

describe('Round number', () => {
	test('E.g. 1000 -> 1k', () => {
		expect(roundNum('1230')).toEqual('1.23K')
		expect(roundNum('1050000')).toEqual('1.05M')
	})
})

describe('Make date be friendly', () => {
	test('E.g. 2021-01-01 -> 01.01.2021', () => {
		expect(formatDate('2020-13-11')).toEqual('11.13.2020')
		expect(formatDate('1999-12-30')).toEqual('30.12.1999')
	})
})
