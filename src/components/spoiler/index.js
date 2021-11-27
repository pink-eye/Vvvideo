const toggleSpoiler = event => {
	let spoiler = event.currentTarget.closest('.spoiler')

	if (spoiler.classList.contains('_opened')) {
		spoiler.removeAttribute('style')
		spoiler.classList.remove('_opened')
	} else {
		let heightContent = spoiler.querySelector('.spoiler__content').offsetHeight

		spoiler.style.setProperty('--height-content', `${heightContent}px`)
		spoiler.classList.add('_opened')

		heightContent = null
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