import cs from 'Global/CacheSelectors'
const resetIndicator = () => {
	queueMicrotask(() => {
		let indicator = cs.get('.indicator')

		if (indicator.classList.contains('_visible')) {
			indicator.classList.remove('_visible')
		}

		indicator = null
	})
}

const startIndicator = () => {
	queueMicrotask(() => {
		let indicator = cs.get('.indicator')

		if (!indicator.classList.contains('_visible')) {
			indicator.classList.add('_visible')
		}

		indicator = null
	})
}

export { startIndicator, resetIndicator }
