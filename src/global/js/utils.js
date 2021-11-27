import { AppStorage } from 'Global/app-storage'
import { showToast } from 'Components/toast'

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

export const isEmpty = el => el === null || el === undefined || el === '' || el === 'undefined' || el === 'null'

export const convertToPercentage = (firstNum, secondNum) => (firstNum * 100) / secondNum

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

export const normalizeCount = count => {
	if (typeof count === 'string') return count.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

	if (typeof count === 'number' && !Number.isNaN(count)) return count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

	if (Number.isNaN(count)) return 0

	return undefined
}

export const convertSecondsToDuration = lengthSeconds => {
	if (isEmpty(lengthSeconds)) return undefined

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
	if (isEmpty(duration)) return undefined

	if (!duration.includes(':')) return undefined

	if (duration.length === 5 || duration.length === 4) {
		const [minutes, seconds] = duration.split(':')
		return Number(minutes) * 60 + Number(seconds)
	}

	if (duration.length === 8 || duration.length === 7) {
		const [hours, minutes, seconds] = duration.split(':')
		return Number(hours) * 60 * 60 + Number(minutes) * 60 + Number(seconds)
	}

	return undefined
}

export const getDurationTimeout = (timeout = 300) =>
	new AppStorage().getStorage().settings.disableTransition ? 0 : timeout

export const handleClickLink = event => {
	event.preventDefault()

	let element = event.target
	let reference = element?.href

	if (!reference) return

	navigator.clipboard.writeText(reference).then(
		() => {
			showToast('info', `'${reference}' was copied to clipboard`)
		},
		() => {
			showToast('error', `Fail! '${reference}' wasn't copied to clipboard`)
		}
	)

	API.openExternalLink(reference)

	element = null
}
