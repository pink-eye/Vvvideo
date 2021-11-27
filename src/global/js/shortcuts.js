import { hideOverlay } from 'Components/overlay'
import { toggleMenu } from 'Components/burger'
import { getSelector, hasFocus } from 'Global/utils'
import { scrapeInfoToSwitchPage, nextPage, prevPage } from 'Components/grid-btns'

export const handleKeyDown = event => {
	// ESC
	if (event.keyCode === 27) {
		document.activeElement.blur()

		hideOverlay()

		let winActive = getSelector('.main__content').querySelector('.win._active')
		let firstCard = winActive.querySelector('.card')

		firstCard ? firstCard.focus() : document.activeElement.blur()

		winActive = null
		firstCard = null
	}

	// CTRL + F
	if (event.ctrlKey && event.keyCode === 70) {
		let header = getSelector('.header')

		if (header.classList.contains('_hidden')) header.classList.remove('_hidden')

		getSelector('.search__bar').focus()

		header = null
	}

	// CTRL + B
	if (event.ctrlKey && event.keyCode === 66) toggleMenu()

	// SHIFT
	if (event.shiftKey && (event.keyCode === 75 || event.keyCode === 74)) {
		let winActive = getSelector('.main__content').querySelector('.win._active')

		if (winActive && !winActive.classList.contains('settings') && !winActive.classList.contains('video')) {
			let { cardAll, btnNextPage, btnPrevPage, typeCard, tabContentActive } = scrapeInfoToSwitchPage(winActive)

			tabContentActive && (winActive = tabContentActive)

			let btns = btnNextPage.closest('.btns')

			if (btns && btns.hidden) return

			// K
			if (event.keyCode === 75) {
				if (btnNextPage && !btnNextPage.disabled)
					nextPage(winActive, cardAll, typeCard, btnNextPage, btnPrevPage)
			}

			// J
			if (event.keyCode === 74) {
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
	if (event.keyCode === 32 && !hasFocus(getSelector('.search__bar'))) {
		let winActive = getSelector('.main__content').querySelector('.win._active')

		if (winActive.classList.contains('video')) event.preventDefault()

		winActive = null
	}
}
