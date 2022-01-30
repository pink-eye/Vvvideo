const handleClickUpdateComponent = () => {
	const modal = new GraphModal()
	modal.open('update')
}

export const initUpdateComponent = () => {
	let update = document.querySelector('.update')

	update.addEventListener('click', handleClickUpdateComponent)
}
