export const normalizeAbout = text => {
	if (typeof text !== 'string' || text.length == 0) return undefined

	let patternHashtag = /#[A-ZА-ЯЁ]*[0-9]*[-\.]?[A-ZА-ЯЁ]*[0-9]*/gim
	let patternEmail = /[A-Z0-9._%+-]+@[A-Z0-9-]+.+.[A-Z]{2,4}/gim
	let patternURL =
		/(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/gi

	return text
		.replace(patternHashtag, '')
		.replace(patternURL, link => `<a href='${link}'>${link}</a>`)
		.replace(patternEmail, address => `<a href='mailto:${address}'>${address}</a>`)
		.replace(/\n/gi, '<br>')
}
