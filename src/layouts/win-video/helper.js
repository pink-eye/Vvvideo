export const formatDate = str => str.split('-').reverse().join('.')

export const normalizeVideoDescription = text => {
	if (typeof text !== 'string' || text.length == 0) return undefined

	let patternHashtag = /#[A-ZА-ЯЁ]*[0-9]*[-\.]?[A-ZА-ЯЁ]*[0-9]*/gim
	let patternEmail = /[A-Z0-9._%+-]+@[A-Z0-9-]+.+.[A-Z]{2,4}/igm
	let patternTimecodeMSS = /^[0-9]:[0-5][0-9]/gim
	let patternTimecodeMMSS = /^[0-5][0-9]:[0-5][0-9]/gim
	let patternTimecodeHMMSS = /^[0-9]:[0-5][0-9]:[0-5][0-9]/gim
	let patternTimecodeHHMMSS = /^[0-2][0-9]:[0-5][0-9]:[0-5][0-9]/gim
	let patternURL = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/gi

	return text
		.replace(patternHashtag, '')
		.replace(patternURL, link => `<a href='${link}'>${link}</a>`)
		.replace(patternEmail, address => `<a href='mailto:${address}'>${address}</a>`)
		.replace(patternTimecodeHHMMSS, timecode => `<button class='timecode btn-reset'>${timecode}</button>`)
		.replace(patternTimecodeHMMSS, timecode => `<button class='timecode btn-reset'>${timecode}</button>`)
		.replace(patternTimecodeMMSS, timecode => `<button class='timecode btn-reset'>${timecode}</button>`)
		.replace(patternTimecodeMSS, timecode => `<button class='timecode btn-reset'>${timecode}</button>`)
		.replace(/\n/gi, '<br>')
}
