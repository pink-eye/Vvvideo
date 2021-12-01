export const formatDate = str => str.split('-').reverse().join('.')

export const normalizeVideoDescription = text => {
	if (typeof text !== 'string' || text.length == 0) return undefined

	let patternHashtag        = /#[A-ZА-ЯЁ]*[0-9]*[-\.]?[A-ZА-ЯЁ]*[0-9]*/gim
	let patternEmail          = /[A-Z0-9._%+-]+@[A-Z0-9-]+.+.[A-Z]{2,4}/gim
	let patternTimecodeMMSS   = /\b(?<!>)([0-5]?[0-9]):([0-5][0-9])(?!<)\b/gm
	let patternTimecodeHHMMSS = /\b(2[0-3]|[0-1]?[\d]):[0-5][\d]:[0-5][\d]\b/gm
	let patternURL            = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/gi

	return text
		.replace(patternHashtag, '')
		.replace(patternURL, link => `<a href='${link}'>${link}</a>`)
		.replace(patternEmail, address => `<a href='mailto:${address}'>${address}</a>`)
		.replace(patternTimecodeHHMMSS, timecode => `<button class='timecode btn-reset'>${timecode}</button>`)
		.replace(patternTimecodeMMSS, timecode => `<button class='timecode btn-reset'>${timecode}</button>`)
		.replace(/\n/gi, '<br>')
}

export const roundNum = num => {
	let numStr = num.toString().replace(/[^0-9.]/g, '')

	if (numStr < 1000) return numStr

	let si = [
		{ v: 1e3, s: 'K' },
		{ v: 1e6, s: 'M' },
		{ v: 1e9, s: 'B' },
		{ v: 1e12, s: 'T' },
		{ v: 1e15, s: 'P' },
		{ v: 1e18, s: 'E' },
	]

	let index

	for (index = si.length - 1; index > 0; index -= 1) {
		if (numStr >= si[index].v) break
	}

	return (numStr / si[index].v).toFixed(2).replace(/\.0+$|(\.[0-9]*[1-9])0+$/, '$1') + si[index].s
}
