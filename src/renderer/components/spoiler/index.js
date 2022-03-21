const Spoiler = () => {
	let spoiler = null
	let spoilerHead = null
	let isFirstTime = true
	let isOpened = false

	const toggle = () => {
		if (isOpened) {
			spoiler.removeAttribute('style')
			spoiler.classList.remove('_opened')
		} else {
			const { offsetHeight } = spoiler.querySelector('.spoiler__content')

			spoiler.style.setProperty('--height-content', `${offsetHeight}px`)
			spoiler.classList.add('_opened')
		}

		isOpened = !isOpened
	}

	const init = config => {
		if (isFirstTime) {
			isFirstTime = false
			spoiler = config.element
			spoilerHead = spoiler.querySelector('.spoiler__head')
		}

		spoilerHead.addEventListener('click', toggle)
	}

	const reset = () => {
		if (isOpened) toggle()

		spoilerHead.removeEventListener('click', toggle)
	}

	return {
		init,
		reset,
	}
}

export default Spoiler
