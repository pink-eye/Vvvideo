const CacheSelectors = () => {
	const selectors = {}

	const set = (key, value) => {
		if (typeof value === 'undefined') return selectors[key]

		selectors[key] = value
	}

	const get = selector => {
		if (!set(selector)) set(selector, document.querySelector(selector))
		return set(selector)
	}

	return { get }
}

const cs = CacheSelectors()

export default cs
