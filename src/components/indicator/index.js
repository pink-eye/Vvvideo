import { getSelector } from 'Global/utils'

const resetIndicator = _ => {
	let indicator = getSelector('.indicator')

	if (indicator.classList.contains('_visible')) {
		indicator.classList.remove('_visible')
	}

	indicator = null
}

const startIndicator = _ => {
	let indicator = getSelector('.indicator')

	if (!indicator.classList.contains('_visible')) {
		indicator.classList.add('_visible')
	}

	indicator = null
}

export { startIndicator, resetIndicator }
