import { getSelector } from 'Global/utils'

const resetIndicator = () => {
	queueMicrotask(() => {
		let indicator = getSelector('.indicator')

		if (indicator.classList.contains('_visible')) {
			indicator.classList.remove('_visible')
		}

		indicator = null
	})
}

const startIndicator = () => {
	queueMicrotask(() => {
		let indicator = getSelector('.indicator')

		if (!indicator.classList.contains('_visible')) {
			indicator.classList.add('_visible')
		}

		indicator = null
	})
}

export { startIndicator, resetIndicator }
