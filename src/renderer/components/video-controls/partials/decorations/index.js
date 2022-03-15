import cs from 'Global/cacheSelectors'
const decorationArray = ['play', 'pause', 'load']

export const hideDecoration = action => {
	let icon = cs.get(`#${action}`)

	const removeActive = () => {
		icon.classList.remove('_active')
		icon = null
	}

	if (icon.classList.contains('_active')) {
		icon.id === 'load'
			? removeActive()
			: icon.addEventListener('transitionend', removeActive, { once: true })
	} else icon = null
}

export const showDecoration = (action, doHide) => {
	let icon = cs.get(`#${action}`)

	if (!icon.classList.contains('_active')) {
		icon.classList.add('_active')

		doHide && hideDecoration(action)
	}

	icon = null
}

export const resetDecorations = () => {
	for (let index = 0, { length } = decorationArray; index < length; index += 1) {
		const decoration = decorationArray[index]

		let decorationSelector = cs.get(`#${decoration}`)

		if (decorationSelector.classList.contains('_active'))
			decorationSelector.classList.remove('_active')

		decorationSelector = null
	}
}
