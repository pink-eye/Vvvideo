const handleKeyDown = e => {

	// CTRL + F
	if (e.ctrlKey && e.keyCode === 70)
		_io_q('.search__bar').focus()

	// CTRL + B
	if (e.ctrlKey && e.keyCode === 66)
		toggleMenu()

	// `
	if (e.keyCode === 192) {
		if (!document.activeElement.closest('.search')) {
			let winActive = _io_q('.main__content').querySelector('.win._active')
			let firstCard = winActive.querySelector('.card');

			firstCard ? firstCard.focus() : document.activeElement.blur()

			winActive = null
			firstCard = null
		}
	}

	// SHIFT + K
	if (e.shiftKey && e.keyCode === 75) {
		let winActive = _io_q('.main__content').querySelector('.win._active')

		if (!winActive.classList.contains('settings') &&
			!winActive.classList.contains('video')) {

			let { cardAll, btnNextPage, btnPrevPage, typeCard, tabContentActive } = scrapeInfoToSwitchPage(winActive)

			if (tabContentActive) winActive = tabContentActive

			if (btnNextPage && !btnNextPage.disabled)
				nextPage(winActive, cardAll, typeCard, btnNextPage, btnPrevPage)

			cardAll = null
			btnNextPage = null
			btnPrevPage = null
			typeCard = null
		}
		winActive = null
	}

	// SHIFT + J
	if (e.shiftKey && e.keyCode === 74) {
		let winActive = _io_q('.main__content').querySelector('.win._active')

		if (!winActive.classList.contains('settings') &&
			!winActive.classList.contains('video')) {

			let { cardAll, btnNextPage, btnPrevPage, typeCard, tabContentActive } = scrapeInfoToSwitchPage(winActive)

			if (tabContentActive) winActive = tabContentActive

			if (btnPrevPage && !btnPrevPage.disabled)
				prevPage(winActive, cardAll, typeCard, btnNextPage, btnPrevPage)

			cardAll = null
			btnNextPage = null
			btnPrevPage = null
			typeCard = null
		}
		winActive = null
	}

	if (e.keyCode === 32 && document.activeElement !== _io_q('.search__bar')) {
		let winActive = _io_q('.main__content').querySelector('.win._active')

		if (winActive.classList.contains('video'))
			e.preventDefault()

		winActive = null
	}
}

document.addEventListener('keydown', handleKeyDown);
