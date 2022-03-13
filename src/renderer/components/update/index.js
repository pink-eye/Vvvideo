const handleClickUpdateComponent = event => {
	const RELEASE_LATEST_URL = 'https://github.com/pink-eye/vvvideo/releases/latest'

	API.openExternalLink(RELEASE_LATEST_URL)
	event.currentTarget.classList.remove('_active')
}

const initUpdateComponent = () => {
	let update = document.querySelector('.update')

	update.classList.add('_active')
	update.addEventListener('click', handleClickUpdateComponent, { once: true })

	update = null
}

export default initUpdateComponent
