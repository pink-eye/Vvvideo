export const removePreloader = () => {
	let preloader = document.querySelector('.preloader')

	const handleTransitionEnd = () => {
		preloader.remove()
		preloader = null
	}

	preloader.addEventListener('transitionend', handleTransitionEnd, { once: true })

	preloader.classList.add('_hidden')
}
