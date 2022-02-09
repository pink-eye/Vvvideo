import { getSelector, scrollToTop, getDurationTimeout } from 'Global/utils'
import { AppStorage } from 'Global/AppStorage'
import { YoutubeHelper } from 'Global/YoutubeHelper'
import { resetGrid, resetGridAuthorCard } from 'Components/grid'
import { activateSidebarBtn, deactivateLastSidebarBtn } from 'Components/sidebar'
import { openWinSettings, resetWinSettings } from 'Layouts/win-settings'
import { openWinHistory } from 'Layouts/win-history'
import { openWinSubs } from 'Layouts/win-subscriptions'
import { prepareWinVideo, resetWinVideo } from 'Layouts/win-video'
import { prepareWinPlaylist, resetWinPlaylist } from 'Layouts/win-playlist'
import { prepareWinChannel, resetWinChannel } from 'Layouts/win-channel'
import { openWinTrending } from 'Layouts/win-trending'
import { openWinSearchResults } from 'Layouts/win-search-results'
import { openWinLatest } from 'Layouts/win-latest'

const resetWin = win => {
	if (
		win.classList.contains('search-results') ||
		win.classList.contains('trending') ||
		win.classList.contains('history') ||
		win.classList.contains('latest')
	) {
		resetGrid(win)
		return
	}

	if (win.classList.contains('subscriptions')) {
		resetGridAuthorCard()
		return
	}

	if (win.classList.contains('video')) {
		resetWinVideo()
		return
	}

	if (win.classList.contains('playlist')) {
		resetWinPlaylist()
		return
	}

	if (win.classList.contains('channel')) {
		resetWinChannel()
		return
	}

	if (win.classList.contains('settings')) {
		resetWinSettings()
		return
	}
}

const startFillingWin = ({ win, btnWin, id, lastWin }) => {
	const appStorage = new AppStorage()
	const { settings } = appStorage.get()

	switch (win) {
		case 'trending':
			openWinTrending(settings.regionTrending)
			break

		case 'latest':
			openWinLatest()
			break

		case 'subscriptions':
			openWinSubs()
			break

		case 'video':
			prepareWinVideo(btnWin, id)
			break

		case 'channel':
			prepareWinChannel(btnWin, id)
			break

		case 'playlist':
			prepareWinPlaylist(btnWin, id)
			break

		case 'search-results':
			openWinSearchResults()
			break

		case 'history':
			openWinHistory()
			break

		case 'settings':
			openWinSettings()
			break
	}
}

const showWin = ({ win, winSelector, id }) => {
	let mainContent = getSelector('.main__content')

	mainContent.dataset.activeWin = win
	mainContent.dataset.activeWinId = id
	winSelector.classList.add('_active')

	const afterActiveWin = () => {
		winSelector.classList.add('_anim-win')

		mainContent = null
	}

	setTimeout(afterActiveWin, 15)
}

const hideWin = win => {
	let givenWin = win

	if (!givenWin) return

	const timeout = getDurationTimeout()

	const closeWin = () => {
		givenWin.classList.remove('_active')

		givenWin = null
	}

	givenWin.classList.remove('_anim-win')

	timeout > 0 ? givenWin.addEventListener('transitionend', closeWin, { once: true }) : closeWin()
}

export const manageWin = async ({ target }) => {
	let btnWin = target.dataset.win ? target : target.closest('[data-win]')

	if (btnWin && !btnWin.disabled) {
		let { win, id } = btnWin.dataset
		let mainContent = getSelector('.main__content')
		let winSelector = mainContent.querySelector(`.${win}`)
		let lastWinSelector = mainContent.querySelector(`.win._active`)
		let lastWin = mainContent.dataset.activeWin
		let lastWinId = mainContent.dataset.activeWinId
		const timeout = getDurationTimeout()

		if (win === 'search-results') {
			let searchBar = getSelector('.search__bar')
			const { value } = searchBar
			const yh = new YoutubeHelper()

			if (API.isYTVideoURL(value)) {
				win = 'video'
				id = API.getVideoId(value)
				winSelector = getSelector('.video')
			}

			if (yh.isPlaylist(value)) {
				win = 'playlist'
				winSelector = getSelector('.playlist')
				id = yh.getPlaylistId(value)
			}

			if (yh.isChannel(value)) {
				win = 'channel'
				winSelector = getSelector('.channel')
				id = yh.getChannelId(value)
			}

			btnWin = null
			searchBar = null
		}

		if (winSelector.classList.contains('_active')) {
			resetWin(lastWinSelector)
			startFillingWin({
				win,
				id,
				btnWin,
				lastWin: {
					type: lastWin,
					id: lastWinId,
				},
			})

			mainContent = null
			winSelector = null
			lastWinSelector = null
			btnWin &&= null
		} else {
			if (btnWin?.classList.contains('sidebar__btn')) {
				deactivateLastSidebarBtn()
				activateSidebarBtn(btnWin)
			} else deactivateLastSidebarBtn()

			const openWin = () => {
				scrollToTop()

				startFillingWin({
					win,
					id,
					btnWin,
					lastWin: {
						type: lastWin,
						id: lastWinId,
					},
				})

				showWin({ win, winSelector, id })

				const resetLastWin = () => {
					resetWin(lastWinSelector)

					lastWinSelector = null
					winSelector = null
				}

				timeout > 0
					? winSelector.addEventListener('transitionend', resetLastWin, { once: true })
					: resetLastWin()

				mainContent = null
				btnWin &&= null
			}

			hideWin(lastWinSelector)

			timeout > 0
				? lastWinSelector.addEventListener('transitionend', openWin, { once: true })
				: openWin()
		}
	}
}
