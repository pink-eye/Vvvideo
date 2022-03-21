import cs from 'Global/CacheSelectors'
import overlay from 'Components/overlay'
import toggleMenu from 'Components/burger'
import { hasFocus } from 'Global/utils'
import suggestions from 'Components/suggestions'

const hasPages = winEl => {
	const btnsPrev = winEl.querySelector('.btns__prev')
	const btnsNext = winEl.querySelector('.btns__next')

	return { btnsNext, btnsPrev }
}

const handleKeyDown = event => {
	// ESC
	if (event.keyCode === 27) {
		overlay.hide()
		suggestions.hide()

		const winActive = cs.get('.main__content').querySelector('.win._active')

		const hasGrid =
			winActive &&
			!winActive.classList.contains('settings') &&
			!winActive.classList.contains('video')

		if (hasGrid) {
			let firstCard = null

			const isWinSubscriptions = winActive.classList.contains('subscriptions')
			const isWinChannel = winActive.classList.contains('channel')

			if (!isWinChannel && !isWinSubscriptions) {
				firstCard = winActive.querySelector('.card')
			}

			if (isWinSubscriptions) {
				firstCard = winActive.querySelector('.author')
			}

			if (isWinChannel) {
				const tabsPanelActive = winActive.querySelector('.tabs__panel._active')

				firstCard = tabsPanelActive.querySelector('.card')
			}

			if (firstCard) {
				firstCard.focus()
			} else {
				document.activeElement.blur()
			}
		} else {
			document.activeElement.blur()
		}
	}

	// CTRL + F
	if (event.ctrlKey && event.keyCode === 70) {
		const header = cs.get('.header')

		if (header.classList.contains('_hidden')) {
			header.classList.remove('_hidden')
		}

		cs.get('.search__bar').focus()
	}

	// CTRL + B
	if (event.ctrlKey && event.keyCode === 66) toggleMenu()

	// SHIFT
	if (event.shiftKey && (event.keyCode === 75 || event.keyCode === 74)) {
		const winActive = cs.get('.main__content').querySelector('.win._active')

		const hasGrid =
			winActive &&
			!winActive.classList.contains('settings') &&
			!winActive.classList.contains('video')

		if (hasGrid) {
			const { btnsNext, btnsPrev } = hasPages(winActive)

			if (!btnsNext || !btnsPrev) return

			const btns = btnsNext.closest('.btns')

			if (btns && btns.hidden) return

			// K
			if (event.keyCode === 75) {
				if (btnsNext && !btnsNext.disabled) btnsNext.click()
			}

			// J
			if (event.keyCode === 74) {
				if (btnsPrev && !btnsPrev.disabled) btnsPrev.click()
			}
		}
	}

	// SPACE
	if (event.keyCode === 32 && !hasFocus(cs.get('.search__bar'))) {
		const winActive = cs.get('.main__content').querySelector('.win._active')

		if (winActive.classList.contains('video')) {
			event.preventDefault()
		}
	}
}

export default handleKeyDown
