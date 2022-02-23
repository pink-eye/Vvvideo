import { getSelector } from 'Global/utils'

const decorationArray = ['play', 'pause', 'load']

export const hideDecoration = action => {
	let icon = getSelector(`#${action}`)

	if (!icon.hidden) {
		const endAnimation = () => {
			icon.hidden ||= true

			icon = null
		}

		const startAnimation = () => {
			if (icon.classList.contains('_active')) icon.classList.remove('_active')

			setTimeout(endAnimation, 300)
		}

		setTimeout(startAnimation, 300)
	}
}

export const showDecoration = (action, doHide) => {
	let icon = getSelector(`#${action}`)

	if (!icon.hidden) return

	icon.hidden = false

	const startAnimation = () => {
		if (!icon.classList.contains('_active')) icon.classList.add('_active')

		icon = null
	}

	setTimeout(startAnimation, 15)

	doHide && hideDecoration(action)
}

export const resetDecorations = () => {
	for (let index = 0, { length } = decorationArray; index < length; index += 1) {
		const decoration = decorationArray[index]

		let decorationSelector = getSelector(`#${decoration}`)
		decorationSelector.hidden ||= true

		if (decorationSelector.classList.contains('_active'))
			decorationSelector.classList.remove('_active')

		decorationSelector = null
	}
}
