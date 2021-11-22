const resetIndicator = _ => {
	let indicator = _io_q('.indicator')

	if (indicator.classList.contains('_visible')) {
		indicator.classList.remove('_visible')
	}

	indicator = null
}

const startIndicator = _ => {
	let indicator = _io_q('.indicator')

	if (!indicator.classList.contains('_visible')) {
		indicator.classList.add('_visible')
	}

	indicator = null
}

export { startIndicator, resetIndicator }
