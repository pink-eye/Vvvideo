import { getSelector } from 'Global/utils'

const decorationArray = ['play', 'pause', 'load']

export const hideDecoration = action => {
	let icon = getSelector(`#${action}`)

	if (icon.classList.contains('_active')) {
		icon.addEventListener(
			'transitionend',
			() => {
				icon.classList.remove('_active')
				icon = null
			},
			{ once: true }
		)
	} else icon = null
}

export const showDecoration = (action, doHide) => {
	let icon = getSelector(`#${action}`)

	if (!icon.classList.contains('_active')) {
		icon.classList.add('_active')

		doHide && hideDecoration(action)
	}

	icon = null
}

export const resetDecorations = () => {
	for (let index = 0, { length } = decorationArray; index < length; index += 1) {
		const decoration = decorationArray[index]

		let decorationSelector = getSelector(`#${decoration}`)

		if (decorationSelector.classList.contains('_active'))
			decorationSelector.classList.remove('_active')

		decorationSelector = null
	}
}
