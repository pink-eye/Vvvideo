'use strict'

const cache = (key, value) => {
	if (typeof value == 'undefined')
		return cache[key];

	cache[key] = value;
}

const _io_q = selector => {
	if (!cache(selector))
		cache(selector, document.querySelector(selector));

	return cache(selector);
}


const reloadApp = _ => { location.reload() }

const closeApp = _ => { window.close() }

const scrollToTop = _ => { window.scrollTo(0, 0); }

const scrollToElem = y => {
	let header = _io_q('.header');

	if (header) {
		window.scrollTo(0, y - header.offsetHeight - 20);
		header = null;
	}
}

const getCoordY = el => el.getBoundingClientRect().top + pageYOffset

const hideOnScroll = (selector, mq) => {
	const sidebar = _io_q('.sidebar');
	let lastScrollValue = 0;

	const handleScroll = _ => {

		if (innerWidth <= mq || mq === 0) {

			let scrollDistance = window.scrollY

			if (sidebar.classList.contains('_active')) return

			if (scrollDistance === 0) selector.classList.remove('_hidden')

			scrollDistance > lastScrollValue
				? selector.classList.add('_hidden')
				: selector.classList.remove('_hidden')

			lastScrollValue = scrollDistance
		}
	}

	window.addEventListener('scroll', handleScroll)
}

const normalizeCount = count => typeof count === 'string'
	? count.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
	: typeof count === 'number' && !isNaN(count)
		? count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
		: isNaN(count)
			? 0
			: 'Unknown'

const normalizeDuration = lengthSeconds => {
	if (typeof lengthSeconds !== 'string') {
		let minutes = Math.floor(lengthSeconds / 60),
			hours = '';

		if (minutes > 59) {
			hours = Math.floor(minutes / 60);
			hours = (hours >= 10) ? hours : `0${hours}`;
			minutes = minutes - (hours * 60);
			minutes = (minutes >= 10) ? minutes : `0${minutes}`;
		}

		lengthSeconds = Math.floor(lengthSeconds % 60);
		lengthSeconds = (lengthSeconds >= 10) ? lengthSeconds : `0${lengthSeconds}`;

		if (hours != '')
			return `${hours}:${minutes}:${lengthSeconds}`;

		return `${minutes}:${lengthSeconds}`;
	} else return lengthSeconds
}

const convertDurationToSeconds = duration => {
	if (duration.length === 5 || duration.length === 4) {
		const [minutes, seconds] = duration.split(':');
		return Number(minutes) * 60 + Number(seconds);
	}
	else if (duration.length === 8 || duration.length === 7) {
		const [hours, minutes, seconds] = duration.split(':');
		return Number(hours) * 60 * 60 + Number(minutes) * 60 + Number(seconds);
	}
};

const uuidv4 = _ => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
	let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
	return v.toString(16);
});

const normalizeDesc = text => {
	if (typeof text === 'string') {
		let patternHashtag = new RegExp(/#[A-ZА-ЯЁ]*[0-9]*[-\.]?[A-ZА-ЯЁ]*[0-9]*/gmi)
		let patternTimecodeMSS = new RegExp(/^[0-9]:[0-5][0-9]/gmi)
		let patternTimecodeMMSS = new RegExp(/^[0-5][0-9]:[0-5][0-9]/gmi)
		let patternTimecodeHMMSS = new RegExp(/^[0-9]:[0-5][0-9]:[0-5][0-9]/gmi)
		let patternTimecodeHHMMSS = new RegExp(/^[0-2][0-9]:[0-5][0-9]:[0-5][0-9]/gmi)
		let patternURL = new RegExp(/(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/gi)

		return text
			.replace(patternHashtag, '')
			.replace(patternURL, link => `<a href='${link}'>${link}</a>`)
			.replace(patternTimecodeHHMMSS, timecode => `<button class='timecode btn-reset'>${timecode}</button>`)
			.replace(patternTimecodeHMMSS, timecode => `<button class='timecode btn-reset'>${timecode}</button>`)
			.replace(patternTimecodeMMSS, timecode => `<button class='timecode btn-reset'>${timecode}</button>`)
			.replace(patternTimecodeMSS, timecode => `<button class='timecode btn-reset'>${timecode}</button>`)
			.replace(/\n/gi, '<br>')
	}
}

const isEmpty = el => el === null || el === undefined || el === ''

const formatDuration = str => str.replace(new RegExp(/[^0-9:]/gmi), '')

const formatDate = str => str.split('-').reverse().join('.')

const formatIP = str => str.replace(new RegExp(/[^0-9.]/gmi), '')

const formatPort = str => str.replace(new RegExp(/[^0-9]/gmi), '')

const convertToProc = (firstNum, secondNum) => firstNum * 100 / secondNum

const calculatePublishedDate = publishedText => {
	const date = new Date()

	if (publishedText === 'Live')
		return publishedText

	const textSplit = publishedText.split(' ')

	if (textSplit[0].toLowerCase() === 'streamed')
		textSplit.shift()

	const timeFrame = textSplit[1]
	const timeAmount = +textSplit[0]
	let timeSpan = null

	if (timeFrame.includes('second'))
		timeSpan = timeAmount * 1000
	else if (timeFrame.includes('minute'))
		timeSpan = timeAmount * 60000
	else if (timeFrame.includes('hour'))
		timeSpan = timeAmount * 3600000
	else if (timeFrame.includes('day'))
		timeSpan = timeAmount * 86400000
	else if (timeFrame.includes('week'))
		timeSpan = timeAmount * 604800000
	else if (timeFrame.includes('month'))
		timeSpan = timeAmount * 2592000000
	else if (timeFrame.includes('year'))
		timeSpan = timeAmount * 31556952000


	return date.getTime() - timeSpan
}

const isValidURLYT = url => {
	const regExp = /^(?:https?:\/\/)?(?:www\.)?youtube\.com(?:\S+)?$/;
	return url.match(regExp) && url.match(regExp).length > 0;
}

const isResourceIsChannel = url => (url.includes('/user/') || url.includes('/channel/')) && isValidURLYT(url)

const isResourceIsPlaylist = url => url.includes('playlist?list=') && isValidURLYT(url)

const getChannelIdOrUser = url => {
	const regExpUser = /(channel|user)\/([a-zA-Z0-9\-_]*.)/.exec(url)

	if (regExpUser)
		return regExpUser[2].endsWith('/') ? regExpUser[2].substring(0, regExpUser[2].length - 1) : regExpUser[2]

	return null
}

const getPlaylistId = url => {
	const regExp = new RegExp("[&?]list=([a-z0-9_]+)", "i");
	const match = regExp.exec(url);

	if (match && match[1].length > 0 && isValidURLYT(url))
		return match[1];

	return null;
}

const getProxyOptions = _ => storage.settings.proxy

const getDurationTimeout = (timeout = 300) => storage.settings.disableTransition ? 0 : timeout

const getMin = (a, b) => a > b ? b : a

const round = (n, d) => Number(~~(n + "e" + d) + "e-" + d);

const getPosStroryboard = (videoDuration, currentTime, count) => {
	const interval = round(videoDuration / count, 2)
	const currentFrame = Math.floor(currentTime / interval)

	let column = currentFrame
	let row = 0

	if (currentFrame > 9 && currentFrame < 90) {

		while (column > 9) {
			column -= 9
			row++
		}

	} else if (currentFrame >= 90 && currentFrame <= 99) {
		column = 9
		row = 9
	}

	const posX = 160 * column
	const posY = 90 * row

	return { posX, posY }
}
