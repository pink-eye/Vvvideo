const showOverlay = _ => {
	let overlayAll = document.querySelectorAll('.overlay')

	for (let index = 0, { length } = overlayAll; index < length; index += 1) {
		const overlay = overlayAll[index]

		if (!overlay.classList.contains('_active')) overlay.classList.add('_active')
		else break
	}

	overlayAll = null
}

const hideOverlay = _ => {
	let overlayAll = document.querySelectorAll('.overlay')

	for (let index = 0, { length } = overlayAll; index < length; index += 1) {
		const overlay = overlayAll[index]

		if (overlay.classList.contains('_active')) overlay.classList.remove('_active')
		else break
	}

	overlayAll = null
}
