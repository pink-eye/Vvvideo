'use strict'

import { AppStorage } from './components/app-storage'

export const cacheSelector = (key, value) => {
	if (typeof value === 'undefined') return cacheSelector[key]

	cacheSelector[key] = value
}

export const getSelector = selector => {
	if (!cacheSelector(selector)) cacheSelector(selector, document.querySelector(selector))

	return cacheSelector(selector)
}

export const reloadApp = _ => {
	window.location.reload()
}

export const closeApp = _ => {
	window.close()
}

export const scrollToTop = _ => {
	window.scrollTo(0, 0)
}

export const scrollToElem = y => {
	let header = getSelector('.header')

	header && window.scrollTo(0, y - header.offsetHeight - 20)

	header = null
}

export const getCoordY = el => el.getBoundingClientRect().top + window.pageYOffset

export const hasFocus = el => document.activeElement === el

export const hideOnScroll = (selector, mq) => {
	const sidebar = getSelector('.sidebar')
	const header = getSelector('.header')
	const searchBar = header.querySelector('.search__bar')

	let lastScrollValue = 0

	const handleScroll = _ => {
		if (window.innerWidth <= mq || mq === 0) {
			let scrollDistance = window.scrollY

			if (sidebar.classList.contains('_active')) return

			if (selector === header && hasFocus(searchBar)) return

			if (scrollDistance === 0) selector.classList.remove('_hidden')

			scrollDistance > lastScrollValue ? selector.classList.add('_hidden') : selector.classList.remove('_hidden')

			lastScrollValue = scrollDistance
		}
	}

	window.addEventListener('scroll', handleScroll)
}

export const isEmpty = el => el === null || el === undefined || el === '' || el === 'undefined' || el === 'null'

export const normalizeCount = count => {
	if (isEmpty(count)) return null

	if (typeof count === 'string') return count.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
	if (typeof count === 'number' && !Number.isNaN(count)) return count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
	if (Number.isNaN(count)) return 0
}

export const convertSecondsToDuration = lengthSeconds => {
	if (isEmpty(lengthSeconds)) return null

	if (typeof lengthSeconds === 'string' && lengthSeconds.includes(':')) return lengthSeconds

	let seconds = +lengthSeconds
	let minutes = Math.floor(seconds / 60)
	let hours = ''

	if (minutes > 59) {
		hours = Math.floor(minutes / 60)
		hours = hours >= 10 ? hours : `0${hours}`
		minutes = minutes - hours * 60
		minutes = minutes >= 10 ? minutes : `0${minutes}`
	}

	seconds = Math.floor(seconds % 60)
	seconds = seconds >= 10 ? seconds : `0${seconds}`

	if (hours !== '') return `${hours}:${minutes}:${seconds}`

	return `${minutes}:${seconds}`
}

export const convertDurationToSeconds = duration => {
	if (isEmpty(duration)) return null

	if (!duration.includes(':')) return null

	if (duration.length === 5 || duration.length === 4) {
		const [minutes, seconds] = duration.split(':')
		return Number(minutes) * 60 + Number(seconds)
	} else if (duration.length === 8 || duration.length === 7) {
		const [hours, minutes, seconds] = duration.split(':')
		return Number(hours) * 60 * 60 + Number(minutes) * 60 + Number(seconds)
	}
}

export const uuidv4 = _ =>
	'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
		let r = (Math.random() * 16) | 0,
			v = c === 'x' ? r : (r & 0x3) | 0x8
		return v.toString(16)
	})

export const normalizeDesc = text => {
	if (typeof text === 'string') {
		let patternHashtag = /#[A-ZА-ЯЁ]*[0-9]*[-\.]?[A-ZА-ЯЁ]*[0-9]*/gim
		let patternTimecodeMSS = /^[0-9]:[0-5][0-9]/gim
		let patternTimecodeMMSS = /^[0-5][0-9]:[0-5][0-9]/gim
		let patternTimecodeHMMSS = /^[0-9]:[0-5][0-9]:[0-5][0-9]/gim
		let patternTimecodeHHMMSS = /^[0-2][0-9]:[0-5][0-9]:[0-5][0-9]/gim
		let patternURL = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/gi

		return text
			.replace(patternHashtag, '')
			.replace(patternURL, link => `<a href='${link}' onclick='handleClickLink(event)'>${link}</a>`)
			.replace(patternTimecodeHHMMSS, timecode => `<button class='timecode btn-reset'>${timecode}</button>`)
			.replace(patternTimecodeHMMSS, timecode => `<button class='timecode btn-reset'>${timecode}</button>`)
			.replace(patternTimecodeMMSS, timecode => `<button class='timecode btn-reset'>${timecode}</button>`)
			.replace(patternTimecodeMSS, timecode => `<button class='timecode btn-reset'>${timecode}</button>`)
			.replace(/\n/gi, '<br>')
	}
}

export const formatDuration = str => str.replace(/[^0-9:]/gim, '')

export const formatDate = str => str.split('-').reverse().join('.')

export const formatIP = str => str.replace(/[^0-9.]/gim, '')

export const formatPort = str => str.replace(/[^0-9]/gim, '')

export const convertToPercentage = (firstNum, secondNum) => (firstNum * 100) / secondNum

export const calculatePublishedDate = publishedText => {
	const date = new Date()

	if (publishedText === 'Live') return publishedText

	const textSplit = publishedText.split(' ')

	if (textSplit[0].toLowerCase() === 'streamed') textSplit.shift()

	const timeFrame = textSplit[1]
	const timeAmount = +textSplit[0]
	let timeSpan = null

	const timeUnits = {
		second: 1000,
		minute: 60000,
		hour: 3600000,
		day: 86400000,
		week: 604800000,
		month: 2592000000,
		year: 31556952000,
	}

	const timeUnitArray = Object.entries(timeUnits)

	for (const [key, value] of timeUnitArray) {
		if (timeFrame.includes(`${key}`)) timeSpan = timeAmount * value
	}

	return date.getTime() - timeSpan
}

export const isValidURLYT = url => {
	const regExp = /^(https?\:\/\/)?((www\.)?youtube\.com|youtu\.?be)\/.+$/
	return url.match(regExp) && url.match(regExp).length > 0
}

export const isResourceIsChannel = url =>
	isValidURLYT(url) && (url.includes('/user/') || url.includes('/channel/') || url.includes('/c/'))

export const isResourceIsPlaylist = url => isValidURLYT(url) && url.includes('playlist?list=')

export const getChannelIdOrUser = url => {
	const regExpUser = /(channel|user|c)\/([a-zA-Z0-9\-_]*.)/.exec(url)

	if (regExpUser)
		return regExpUser[2].endsWith('/') ? regExpUser[2].substring(0, regExpUser[2].length - 1) : regExpUser[2]

	return null
}

export const getPlaylistId = url => {
	const regExp = /[&?]list=([a-z0-9_]+)/i
	const match = regExp.exec(url)

	if (match && match[1].length > 0) return match[1]

	return null
}

export const getProxyOptions = _ => new AppStorage().getStorage().settings.proxy

export const getDurationTimeout = (timeout = 300) =>
	new AppStorage().getStorage().settings.disableTransition ? 0 : timeout

export const getMin = (a, b) => (a > b ? b : a)

export const round = (n, d) => Number(~~(n + 'e' + d) + 'e-' + d)

export const getPosStroryboard = (videoDuration, currentTime, count) => {
	const interval = round(videoDuration / count, 2)
	const currentFrame = Math.floor(currentTime / interval)

	let column = currentFrame
	let row = 0

	if (currentFrame > 9 && currentFrame < 90) {
		while (column > 9) {
			column -= 9
			row += 1
		}
	} else if (currentFrame >= 90 && currentFrame <= 99) {
		column = 9
		row = 9
	}

	const posX = 160 * column
	const posY = 90 * row

	return { posX, posY }
}

export const handleClickLink = event => {
	event.preventDefault()
	API.openExternalLink(event.target.href)
}

export const getHighestVideo = formats => API.YTDLChooseFormat(formats, 'highestvideo')

export const getHighestAudio = formats => API.YTDLChooseFormat(formats, 'highestaudio')

export const filterFormats = (formats, fn) => Object.values(formats).filter(fn)

export const filterVideoWebm = formats =>
	filterFormats(
		formats,
		format => format.container === 'webm' && format.hasVideo && !format.isDashMPD && !format?.type
	)

export const filterVideoMP4NoAudio = formats =>
	filterFormats(
		formats,
		format =>
			format.container === 'mp4' && format.hasVideo && !format.hasAudio && !format.isDashMPD && !format?.type
	)

export const filterVideoAndAudio = formats => filterFormats(formats, format => format.hasAudio && format.hasVideo)

export const filterHLS = formats => filterFormats(formats, format => format.isHLS && format.hasAudio && format.hasVideo)

export const getPreferedQuality = formats => {
	if (formats.length === 0) return null

	const appStorage = new AppStorage()
	const storage = appStorage.getStorage()
	const { defaultQuality } = storage.settings

	return defaultQuality === 'highest'
		? getHighestVideo(formats)
		: formats.find(el => el.qualityLabel.includes(defaultQuality))
}

export const filterSearchResults = arr =>
	arr.filter(el => el.type === 'video' || el.type === 'playlist' || el.type === 'channel')
