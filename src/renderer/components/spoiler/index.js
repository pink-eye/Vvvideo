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

// const toggleSpoiler = ({ currentTarget }) => {
// 	let spoiler = currentTarget.closest('.spoiler')

// 	if (spoiler.classList.contains('_opened')) {
// 		spoiler.removeAttribute('style')
// 		spoiler.classList.remove('_opened')
// 	} else {
// 		const { offsetHeight } = spoiler.querySelector('.spoiler__content')

// 		spoiler.style.setProperty('--height-content', `${offsetHeight}px`)
// 		spoiler.classList.add('_opened')
// 	}

// 	spoiler = null
// }

// export const initSpoiler = spoiler => {
// 	let spoilerHead = spoiler.querySelector('.spoiler__head')

// 	spoilerHead.addEventListener('click', toggleSpoiler)

// 	spoilerHead = null
// }

// export const destroySpoiler = spoiler => {
// 	let spoilerHead = spoiler.querySelector('.spoiler__head')

// 	spoiler.removeAttribute('style')
// 	spoiler.classList.remove('_opened')

// 	spoilerHead.removeEventListener('click', toggleSpoiler)

// 	spoilerHead = null
// }
