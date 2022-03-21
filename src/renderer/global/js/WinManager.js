import cs from 'Global/CacheSelectors'
import { scrollToTop, getDurationTimeout } from 'Global/utils'
import YoutubeHelper from 'Global/YoutubeHelper'
import sidebar from 'Components/sidebar'
import winSettings from 'Layouts/win-settings'
import winHistory from 'Layouts/win-history'
import winSubscriptions from 'Layouts/win-subscriptions'
import winVideo from 'Layouts/win-video'
import winPlaylist from 'Layouts/win-playlist'
import winChannel from 'Layouts/win-channel'
import winTrending from 'Layouts/win-trending'
import winSearchResults from 'Layouts/win-search-results'
import winLatest from 'Layouts/win-latest'

const WinManager = () => {
	const mainContent = cs.get('.main__content')

	const analyzeSearchBar = value => {
		const yh = new YoutubeHelper()

		let win = null
		let id = null
		let winEl = null

		if (API.isYTVideoURL(value)) {
			win = 'video'
			id = API.getVideoId(value)
			winEl = cs.get('.video')
		}

		if (yh.isPlaylist(value)) {
			win = 'playlist'
			winEl = cs.get('.playlist')
			id = yh.getPlaylistId(value)
		}

		if (yh.isChannel(value)) {
			win = 'channel'
			winEl = cs.get('.channel')
			id = yh.getChannelId(value)
		}

		if (win) return { win, id, winEl }
	}

	const getRequiredWinInstance = win => {
		switch (win) {
			case 'trending':
				return winTrending

			case 'latest':
				return winLatest

			case 'subscriptions':
				return winSubscriptions

			case 'video':
				return winVideo

			case 'channel':
				return winChannel

			case 'playlist':
				return winPlaylist

			case 'search-results':
				return winSearchResults

			case 'history':
				return winHistory

			case 'settings':
				return winSettings
		}
	}

	const show = ({ win, id, element }) => {
		mainContent.dataset.activeWin = win
		mainContent.dataset.activeWinId = id

		const config = {
			attributes: true,
			attributeFilter: ['class'],
		}

		const handleDisplayWin = (mutationsList, observer) => {
			observer.disconnect()

			setTimeout(() => {
				element.classList.add('_anim-win')
			}, 0)
		}

		const observer = new MutationObserver(handleDisplayWin)
		observer.observe(element, config)

		element.classList.add('_active')
	}

	const hide = element => {
		if (!element) return

		const timeout = getDurationTimeout()

		const closeWin = () => {
			element.classList.remove('_active')
		}

		element.classList.remove('_anim-win')

		timeout > 0
			? element.addEventListener('transitionend', closeWin, { once: true })
			: closeWin()
	}

	const flip = ({ target }) => {
		const btnWin = target.dataset.win ? target : target.closest('[data-win]')

		if (btnWin && !btnWin.disabled) {
			let { win, id } = btnWin.dataset
			let winEl = mainContent.querySelector(`.${win}`)

			if (!winEl) return

			const lastWinEl = mainContent.querySelector('.win._active._anim-win')
			const lastWin = mainContent.dataset.activeWin
			const lastWinId = mainContent.dataset.activeWinId
			const timeout = getDurationTimeout()

			if (win === 'search-results') {
				const searchBar = cs.get('.search__bar')
				const newInstance = analyzeSearchBar(searchBar.value)

				if (newInstance) {
					win = newInstance.win
					id = newInstance.id
					winEl = newInstance.winEl
				}
			}

			if (winEl.classList.contains('_active')) {
				reset(lastWin)
				fill({
					win,
					id,
					btnWin,
					lastWin: {
						type: lastWin,
						id: lastWinId,
					},
				})

				winEl = null
			} else {
				if (btnWin?.classList.contains('sidebar__btn')) {
					sidebar.deactivateLastBtn()
					sidebar.activateBtn(btnWin)
				} else sidebar.deactivateLastBtn()

				const openWin = () => {
					scrollToTop()

					fill({
						win,
						id,
						btnWin,
						lastWin: {
							type: lastWin,
							id: lastWinId,
						},
					})

					show({ win, element: winEl, id })

					const resetLastWin = () => {
						reset(lastWin)

						winEl = null
					}

					timeout > 0
						? winEl.addEventListener('transitionend', resetLastWin, {
								once: true,
						  })
						: resetLastWin()
				}

				if (timeout > 0) {
					lastWinEl.addEventListener('transitionend', openWin, { once: true })
					hide(lastWinEl)
				} else {
					hide(lastWinEl)
					openWin()
				}
			}
		}
	}

	const fill = params => {
		const winInstance = getRequiredWinInstance(params.win)

		winInstance?.init(params)
	}

	const reset = win => {
		const winInstance = getRequiredWinInstance(win)

		winInstance?.reset()
	}

	return { flip }
}

const winManager = WinManager()

export default winManager
