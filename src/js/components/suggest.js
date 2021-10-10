let lastSelected = null;

const showSuggest = (parent, data) => {
	let suggestAll = parent.querySelectorAll('.search__suggest');

	if (!parent.classList.contains('_has-suggest'))
		parent.classList.add('_has-suggest')

	if (suggestAll.length > 0) {
		for (let index = 0, length = suggestAll.length; index < length; index++) {
			let suggest = suggestAll[index];

			if (data[index]) {
				suggest.textContent = data[index]
				suggest.classList.add('_visible');
			}

			suggest = null
		}
	}

	suggestAll = null
}

const hideSuggest = parent => {
	if (parent.classList.contains('_has-suggest'))
		parent.classList.remove('_has-suggest')

	setTimeout(_ => { resetSuggest(parent) }, getDurationTimeout())

	hideOverlay()
}

const resetSelected = parent => {
	let selectedSuggest = parent.querySelector('.search__suggest._selected');

	if (selectedSuggest)
		selectedSuggest.classList.remove('_selected');

	selectedSuggest = null;
}


const resetSuggest = parent => {
	let suggestAll = parent.querySelectorAll('.search__suggest');

	if (suggestAll.length > 0) {
		for (let index = 0, length = suggestAll.length; index < length; index++) {
			let suggest = suggestAll[index];
			suggest.textContent = null

			if (suggest.classList.contains('_visible'))
				suggest.classList.remove('_visible');

			suggest = null
		}
	}

	suggestAll = null

	resetSelected(parent)
}


const insertSelectedSuggest = (parent, suggest) => {
	let searchBar = parent.querySelector('.search__bar');

	if (searchBar) searchBar.value = suggest

	searchBar = null
}

const chooseSuggest = (parent, last, direction) => {
	let visibleSuggestAll = parent.querySelectorAll('.search__suggest._visible');

	if (visibleSuggestAll.length > 0) {
		if (last !== null) {
			if (direction === 40) {
				if (visibleSuggestAll[last + 1]) {
					visibleSuggestAll[last + 1].classList.add('_selected');
					lastSelected = last + 1
				} else {
					visibleSuggestAll[0].classList.add('_selected');
					lastSelected = 0
				}
			} else if (direction === 38) {
				if (visibleSuggestAll[last - 1]) {
					visibleSuggestAll[last - 1].classList.add('_selected');
					lastSelected = last - 1
				} else {
					visibleSuggestAll[visibleSuggestAll.length - 1].classList.add('_selected');
					lastSelected = visibleSuggestAll.length - 1
				}
			}
		} else {
			visibleSuggestAll[0].classList.add('_selected');
			lastSelected = 0
		}

		let selectedSuggest = parent.querySelector('.search__suggest._selected');

		if (selectedSuggest)
			insertSelectedSuggest(parent, selectedSuggest.textContent)

		selectedSuggest = null
	}
	visibleSuggestAll = null
}

const initSuggests = parent => {

	let searchBar = parent.querySelector('.search__bar');

	if (searchBar && !storage.settings.disableSearchSuggestions) {
		searchBar.addEventListener('input', async _ => {
			lastSelected = null
			let query = searchBar.value.trim();

			if (query.length !== 0) {
				try {
					let data = storage.settings.enableProxy
						? await API.scrapeSuggestsProxy(query, getProxyOptions())
						: await API.scrapeSuggests(query)

					resetSuggest(parent)
					showSuggest(parent, data)

					let visibleSuggestAll = parent.querySelectorAll('.search__suggest._visible');

					for (let index = 0, length = visibleSuggestAll.length; index < length; index++) {
						const visibleSuggest = visibleSuggestAll[index];
						visibleSuggest.addEventListener('click', _ => {
							insertSelectedSuggest(parent, visibleSuggest.textContent)
							searchBar.focus()
						});
					}
				} catch (error) {
					showToast('error', error.message);
				} finally {
					query = null
				}

			} else hideSuggest(parent)
		});

		searchBar.onblur = _ => { hideSuggest(parent) }

	} else searchBar = null
}
