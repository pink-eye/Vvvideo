const handleKeyDown = e => {
	// ESC
	if (e.keyCode === 27) {
		document.activeElement.blur()
		
		hideOverlay()

		let winActive = _io_q('.main__content').querySelector('.win._active')
		let firstCard = winActive.querySelector('.card')

		firstCard ? firstCard.focus() : document.activeElement.blur()

		winActive = null
		firstCard = null
	}

	// CTRL + F
	if (e.ctrlKey && e.keyCode === 70) {
		let header = _io_q('.header')

		if (header.classList.contains('_hidden')) header.classList.remove('_hidden')

		_io_q('.search__bar').focus()

		header = null
	}

	// CTRL + B
	if (e.ctrlKey && e.keyCode === 66) toggleMenu()

	// SHIFT
	if (e.shiftKey) {
		let winActive = _io_q('.main__content').querySelector('.win._active')

		if (winActive && !winActive.classList.contains('settings') && !winActive.classList.contains('video')) {
			let { cardAll, btnNextPage, btnPrevPage, typeCard, tabContentActive } = scrapeInfoToSwitchPage(winActive)

			tabContentActive && (winActive = tabContentActive)

			let btns = btnNextPage.closest('.btns')

			if (btns && btns.hidden) return

			if (e.keyCode === 75) {
				// K
				if (btnNextPage && !btnNextPage.disabled)
					nextPage(winActive, cardAll, typeCard, btnNextPage, btnPrevPage)
			}

			// J
			if (e.keyCode === 74) {
				if (btnPrevPage && !btnPrevPage.disabled)
					prevPage(winActive, cardAll, typeCard, btnNextPage, btnPrevPage)
			}

			cardAll = null
			btnNextPage = null
			btnPrevPage = null
			typeCard = null
		}

		winActive = null
	}

	// SPACE
	if (e.keyCode === 32 && !hasFocus(_io_q('.search__bar'))) {
		let winActive = _io_q('.main__content').querySelector('.win._active')

		if (winActive.classList.contains('video')) e.preventDefault()

		winActive = null
	}
}

document.addEventListener('keydown', handleKeyDown)
