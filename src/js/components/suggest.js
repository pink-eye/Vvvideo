let lastSelected = null;

const createSuggestHTML = textContent => `<button class="search__suggest suggest">
											<aside class="suggest__icon">
												<svg width="27px" height="27px">
													<use xlink:href='img/svg/actions.svg#search'></use>
												</svg>
											</aside>
											<span class="suggest__text">${textContent}</span>
										</button>`

const addSuggest = (parent, data) => {
	let searchDropdown = parent.querySelector('.search__dropdown');
	let searchBar = parent.querySelector('.search__bar');

	if (!searchDropdown.firstChild) {
		for (let index = 0, length = 10; index < length; index++) {
			const query = searchBar.value.trim()

			if (!isEmpty(data[index]) && query.length > 0 && hasFocus(searchBar))
				searchDropdown.insertAdjacentHTML('beforeEnd', createSuggestHTML(data[index]))
			else break
		}
	}

	searchDropdown = null
	searchBar = null
}

const hideSuggest = parent => {
	let searchDropdown = parent.querySelector('.search__dropdown');

	while (searchDropdown.firstChild)
		searchDropdown.firstChild.remove()

	searchDropdown = null
}

const resetSelected = parent => {
	let selectedSuggest = parent.querySelector('._selected');

	if (selectedSuggest)
		selectedSuggest.classList.remove('_selected');

	selectedSuggest = null;
}

const insertSelectedSuggest = (parent, suggest) => {
	let searchBar = parent.querySelector('.search__bar')
	let suggestText = suggest.querySelector('.suggest__text')

	if (searchBar) searchBar.value = suggestText.textContent

	searchBar = null
	suggestText = null
}

const chooseSuggest = (parent, direction) => {
	let suggestAll = parent.querySelectorAll('.search__suggest');

	if (suggestAll.length > 0) {

		if (lastSelected !== null) {
			const index = direction === 40 ? lastSelected + 1 : lastSelected - 1
			const sparedIndex = direction === 40 ? 0 : suggestAll.length - 1
			let nextSelect = suggestAll[index] ?? suggestAll[sparedIndex]

			nextSelect.classList.add('_selected');
			lastSelected = suggestAll[index] ? index : sparedIndex

			nextSelect = null
		} else {
			suggestAll[0].classList.add('_selected');
			lastSelected = 0
		}

		let selectedSuggest = parent.querySelector('._selected');

		if (selectedSuggest)
			insertSelectedSuggest(parent, selectedSuggest)

		selectedSuggest = null
	}

	suggestAll = null
}

const initSuggests = parent => {
	let searchBar = parent.querySelector('.search__bar');

	const { disableSearchSuggestions, enableProxy } = storage.settings

	if (disableSearchSuggestions) return

	if (searchBar) {
		const handleInpt = async _ => {
			showOverlay()

			lastSelected = null
			let query = searchBar.value.trim();

			if (query.length > 0) {
				try {
					let data = enableProxy
						? await API.scrapeSuggestsProxy(query, getProxyOptions())
						: await API.scrapeSuggests(query)

					resetSelected(parent)
					hideSuggest(parent)

					if (data.length > 0)
						addSuggest(parent, data)

					let suggestAll = parent.querySelectorAll('.search__suggest');

					for (let index = 0, length = suggestAll.length; index < length; index++) {
						const suggest = suggestAll[index];

						suggest.addEventListener('click', _ => {
							insertSelectedSuggest(parent, suggest)
							resetSelected(parent)
							lastSelected = null
							searchBar.focus()
						});
					}

				} catch (error) {
					showToast('error', error.message);
				} finally {
					query = null
				}
			} else {
				hideSuggest(parent)
				hideOverlay()
			}
		}

		searchBar.addEventListener('input', handleInpt);

		const handleBlur = _ => {
			setTimeout(_ => {
				if (!document.activeElement.closest('.search')) {
					hideSuggest(parent)
					hideOverlay()
				}
			}, 15);
		}

		searchBar.addEventListener('blur', handleBlur);

	} else searchBar = null
}
