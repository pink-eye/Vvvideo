import cs from 'Global/CacheSelectors'

const Indicator = () => {
	const indicator = cs.get('.indicator')
	let isVisible = false

	const hide = () => {
		queueMicrotask(() => {
			if (isVisible) {
				indicator.classList.remove('_visible')
				isVisible = false
			}
		})
	}

	const show = () => {
		queueMicrotask(() => {
			if (!isVisible) {
				indicator.classList.add('_visible')
				isVisible = true
			}
		})
	}

	return { start, reset }
}

const indicator = Indicator()

export default indicator
