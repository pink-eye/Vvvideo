const showOverlay = () => {
	queueMicrotask(() => {
		let overlayAll = document.querySelectorAll('.overlay')

		for (let index = 0, { length } = overlayAll; index < length; index += 1) {
			let overlay = overlayAll[index]

			if (!overlay.classList.contains('_active')) overlay.classList.add('_active')
			else break

			overlay = null
		}

		overlayAll = null
	})
}

const hideOverlay = () => {
	queueMicrotask(() => {
		let overlayAll = document.querySelectorAll('.overlay')

		for (let index = 0, { length } = overlayAll; index < length; index += 1) {
			let overlay = overlayAll[index]

			if (overlay.classList.contains('_active')) overlay.classList.remove('_active')
			else break

			overlay = null
		}

		overlayAll = null
	})
}

export { showOverlay, hideOverlay }
