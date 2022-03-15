import cs from 'Global/cacheSelectors'
import { hideOverlay } from 'Components/overlay'
import toggleMenu from 'Components/burger'
import { hasFocus } from 'Global/utils'
import { scrapeInfoToSwitchPage, nextPage, prevPage } from 'Components/grid-btns'
import { hideSuggestions } from 'Components/suggestions'

const handleKeyDown = event => {
	// ESC
	if (event.keyCode === 27) {
		document.activeElement.blur()

		hideOverlay()
		hideSuggestions()

		let winActive = cs.get('.main__content').querySelector('.win._active')
		let firstCard = null

		if (winActive.classList.contains('subscriptions')) {
			firstCard = winActive.querySelector('.author')
		} else if (winActive.classList.contains('channel')) {
			let tabsPanelActive = winActive.querySelector('.tabs__panel._active')

			firstCard = tabsPanelActive.querySelector('.card')

			tabsPanelActive = null
		} else firstCard = winActive.querySelector('.card')

		firstCard ? firstCard.focus() : document.activeElement.blur()

		winActive = null
		firstCard = null
	}

	// CTRL + F
	if (event.ctrlKey && event.keyCode === 70) {
		let header = cs.get('.header')

		if (header.classList.contains('_hidden')) header.classList.remove('_hidden')

		cs.get('.search__bar').focus()

		header = null
	}

	// CTRL + B
	if (event.ctrlKey && event.keyCode === 66) toggleMenu()

	// SHIFT
	if (event.shiftKey && (event.keyCode === 75 || event.keyCode === 74)) {
		let winActive = cs.get('.main__content').querySelector('.win._active')

		if (
			winActive &&
			!winActive.classList.contains('settings') &&
			!winActive.classList.contains('video')
		) {
			let { cardAll, btnNextPage, btnPrevPage, typeCard, tabsPanelActive } =
				scrapeInfoToSwitchPage(winActive)

			tabsPanelActive && (winActive = tabsPanelActive)

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
	if (event.keyCode === 32 && !hasFocus(cs.get('.search__bar'))) {
		let winActive = cs.get('.main__content').querySelector('.win._active')

		if (winActive.classList.contains('video')) event.preventDefault()

		winActive = null
	}
}

export default handleKeyDown
