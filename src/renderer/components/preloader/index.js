export const handleLoadWindow = () => {
	let preloader = document.querySelector('.preloader')

	const removePreloader = () => {
		preloader.remove()
		preloader = null
	}

	preloader.addEventListener('transitionend', removePreloader, { once: true })

	preloader.classList.add('_hidden')
}
