let lastSelected = null;

const createSuggestHTML = textContent => `<button class="search__suggest">${textContent}</button>`

const addSuggest = (parent, data) => {
	let searchDropdown = parent.querySelector('.search__dropdown');
	let searchBar = parent.querySelector('.search__bar');

	if (!searchDropdown.firstChild) {
		for (let index = 0, length = 10; index < length; index++) {
			const query = searchBar.value.trim()

			if (!isEmpty(data[index]) && query.length > 0)
				searchDropdown.insertAdjacentHTML('afterBegin', createSuggestHTML(data[index]))
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
	let searchBar = parent.querySelector('.search__bar');

	if (searchBar) searchBar.value = suggest

	searchBar = null
}

const chooseSuggest = (parent, last, direction) => {
	let suggestAll = parent.querySelectorAll('.search__suggest');

	if (suggestAll.length > 0) {
		if (last !== null) {
			if (direction === 40) {
				if (suggestAll[last + 1]) {
					suggestAll[last + 1].classList.add('_selected');
					lastSelected = last + 1
				} else {
					suggestAll[0].classList.add('_selected');
					lastSelected = 0
				}
			} else if (direction === 38) {
				if (suggestAll[last - 1]) {
					suggestAll[last - 1].classList.add('_selected');
					lastSelected = last - 1
				} else {
					suggestAll[suggestAll.length - 1].classList.add('_selected');
					lastSelected = suggestAll.length - 1
				}
			}
		} else {
			suggestAll[0].classList.add('_selected');
			lastSelected = 0
		}

		let selectedSuggest = parent.querySelector('._selected');

		if (selectedSuggest)
			insertSelectedSuggest(parent, selectedSuggest.textContent)

		selectedSuggest = null
	}
	suggestAll = null
}

const initSuggests = parent => {
	let searchBar = parent.querySelector('.search__bar');

	if (searchBar && !storage.settings.disableSearchSuggestions) {

		const handleInpt = async _ => {
			showOverlay()

			lastSelected = null
			let query = searchBar.value.trim();

			if (query.length > 0) {
				try {
					let data = storage.settings.enableProxy
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
							insertSelectedSuggest(parent, suggest.textContent)
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

		const handleBlur = _ => {
			hideSuggest(parent)
			hideOverlay()
		}

		searchBar.addEventListener('input', handleInpt);
		searchBar.addEventListener('blur', handleBlur)

	} else searchBar = null
}
