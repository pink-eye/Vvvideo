const toggleSpoiler = ({ currentTarget }) => {
	let spoiler = currentTarget.closest('.spoiler')

	if (spoiler.classList.contains('_opened')) {
		spoiler.removeAttribute('style')
		spoiler.classList.remove('_opened')
	} else {
		const { offsetHeight } = spoiler.querySelector('.spoiler__content')

		spoiler.style.setProperty('--height-content', `${offsetHeight}px`)
		spoiler.classList.add('_opened')
	}

	spoiler = null
}

export const initSpoiler = spoiler => {
	const spoilerHead = spoiler.querySelector('.spoiler__head')

	spoilerHead.addEventListener('click', toggleSpoiler)
}

export const destroySpoiler = spoiler => {
	let spoilerHead = spoiler.querySelector('.spoiler__head')

	spoiler.removeAttribute('style')
	spoiler.classList.remove('_opened')

	spoilerHead.removeEventListener('click', toggleSpoiler)

	spoilerHead = null
}
