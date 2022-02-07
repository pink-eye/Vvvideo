const handleClickUpdateComponent = event => {
	event.preventDefault()

	let { currentTarget } = event

	API.openExternalLink(currentTarget.href)
	currentTarget.classList.remove('_active')

	currentTarget = null
}

export const initUpdateComponent = () => {
	let update = document.querySelector('.update')

	update.addEventListener('click', handleClickUpdateComponent, { once: true })

	update = null
}
