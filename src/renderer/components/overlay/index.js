const Overlay = () => {
	const overlayAll = document.querySelectorAll('.overlay')
	let isVisible = false

	const show = () => {
		if (isVisible) return

		isVisible = true

		queueMicrotask(() => {
			for (let index = 0, { length } = overlayAll; index < length; index += 1) {
				let overlay = overlayAll[index]
				overlay.classList.add('_active')
				overlay = null
			}
		})
	}

	const hide = () => {
		if (!isVisible) return

		isVisible = false

		queueMicrotask(() => {
			for (let index = 0, { length } = overlayAll; index < length; index += 1) {
				let overlay = overlayAll[index]
				overlay.classList.remove('_active')
				overlay = null
			}
		})
	}

	return { show, hide }
}

const overlay = Overlay()

export default overlay
