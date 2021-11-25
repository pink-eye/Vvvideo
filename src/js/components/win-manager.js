import { resetGrid, resetGridAuthorCard } from './grid'
import {
	getSelector,
	scrollToTop,
	isResourceIsChannel,
	isResourceIsPlaylist,
	getDurationTimeout,
	getPlaylistId,
	getChannelIdOrUser,
} from '../global'
import { activateSidebarBtn, deactivateLastSidebarBtn } from './sidebar'
import { openWinSettings, resetWinSettings } from './win-settings'
import { openWinHistory, rememberWatchedTime } from './win-history'
import { resetVideoPlayer } from './video-player'
import { prepareWinPlaylist, resetWinPlaylist } from './win-playlist'
import { prepareWinChannel, resetWinChannel } from './win-channel'
import { openWinTrending } from './win-trending'
import { openWinSubs } from './win-subscriptions'
import { openWinSearchResults } from './win-search-results'
import { openWinLatest } from './win-latest'
import { prepareWinVideo, resetWinVideo } from './win-video'
import { AppStorage } from './app-storage'

const resetWin = win => {
	if (
		win.classList.contains('search-results') ||
		win.classList.contains('trending') ||
		win.classList.contains('history') ||
		win.classList.contains('latest')
	)
		resetGrid(win)

	if (win.classList.contains('subscriptions')) resetGridAuthorCard()

	if (win.classList.contains('video')) {
		resetVideoPlayer()
		resetWinVideo()
	}

	if (win.classList.contains('playlist')) resetWinPlaylist()

	if (win.classList.contains('channel')) resetWinChannel()

	if (win.classList.contains('settings')) resetWinSettings()
}

const startFillingWin = ({ win, btnWin, id }) => {
	const appStorage = new AppStorage()
	const { settings } = appStorage.getStorage()

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

const showWin = win => {
	win.classList.add('_active')

	const afterActiveWin = _ => {
		win.classList.add('_anim-win')
	}

	setTimeout(afterActiveWin, 15)
}

const hideWin = win => {
	if (win) {
		win.classList.remove('_anim-win')

		if (win.classList.contains('video')) rememberWatchedTime()

		const onHideLastWin = _ => {
			win.classList.remove('_active')

			const afterOpenWin = _ => {
				resetWin(win)
			}

			setTimeout(afterOpenWin, 200)
		}

		setTimeout(onHideLastWin, getDurationTimeout(200))
	}
}

export const manageWin = async event => {
	let btnWin = event.target.dataset.win ? event.target : event.target.closest('[data-win]')

	if (btnWin && !btnWin.disabled) {
		let { win, id } = btnWin.dataset
		let mainContent = getSelector('.main__content')
		let winSelector = mainContent.querySelector(`.${win}`)

		if (win === 'search-results') {
			let searchBar = getSelector('.search__bar')
			const { value } = searchBar

			if (API.isYTVideoURL(value)) {
				win = 'video'
				id = API.getVideoId(value)
				winSelector = getSelector('.video')
			}

			if (isResourceIsPlaylist(value)) {
				win = 'playlist'
				winSelector = getSelector('.playlist')
				id = getPlaylistId(value)
			}

			if (isResourceIsChannel(value)) {
				win = 'channel'
				winSelector = getSelector('.channel')
				id = getChannelIdOrUser(value)
			}

			btnWin = null
			searchBar = null
		}

		let lastWin = mainContent.querySelector('.win._active._anim-win')

		if (winSelector.classList.contains('_active')) {
			resetWin(lastWin)
			startFillingWin({
				win,
				id,
				btnWin,
			})

			mainContent = null
			winSelector = null
			lastWin = null
			btnWin &&= null
		} else {
			hideWin(lastWin)

			if (btnWin?.classList.contains('sidebar__btn')) {
				deactivateLastSidebarBtn()
				activateSidebarBtn(btnWin)
			} else deactivateLastSidebarBtn()

			const afterHideLastWin = _ => {
				scrollToTop()

				startFillingWin({
					win,
					id,
					btnWin,
				})

				showWin(winSelector)

				mainContent = null
				winSelector = null
				lastWin = null
				btnWin &&= null
			}

			setTimeout(afterHideLastWin, getDurationTimeout(200))
		}
	}
}
