import cs from 'Global/CacheSelectors'

const Indicator = () => {
	const indicator = cs.get('.indicator')
	let isVisible = false

	const hide = () => {
		if (!isVisible) return

		isVisible = false

		queueMicrotask(() => {
			indicator.classList.remove('_visible')
		})
	}

	const show = () => {
		if (isVisible) return

		isVisible = true

		queueMicrotask(() => {
			indicator.classList.add('_visible')
		})
	}

	return { show, hide }
}

const indicator = Indicator()

export default indicator
