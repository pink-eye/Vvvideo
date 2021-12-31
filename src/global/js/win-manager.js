import { getSelector, scrollToTop, getDurationTimeout, invokeFunctionByTimeout } from 'Global/utils'
import { AppStorage } from 'Global/app-storage'
import { YoutubeHelper } from 'Global/youtube-helper'
import { resetGrid, resetGridAuthorCard } from 'Components/grid'
import { activateSidebarBtn, deactivateLastSidebarBtn } from 'Components/sidebar'
import { openWinSettings, resetWinSettings } from 'Layouts/win-settings'
import { openWinHistory } from 'Layouts/win-history'
import { openWinSubs } from 'Layouts/win-subscriptions'
import { prepareWinVideo, resetWinVideo } from 'Layouts/win-video'
import { prepareWinPlaylist, resetWinPlaylist } from 'Layouts/win-playlist'
import { resetVideoPlayer } from 'Components/video-controls'
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

	const afterActiveWin = _ => win.classList.add('_anim-win')

	setTimeout(afterActiveWin, 15)
}

const hideWin = win => {
	if (win) {
		win.classList.remove('_anim-win')

		const onHideLastWin = _ => {
			win.classList.remove('_active')

			const afterOpenWin = _ => resetWin(win)

			setTimeout(afterOpenWin, 200)
		}

		const timeout = getDurationTimeout(200)
		invokeFunctionByTimeout(onHideLastWin, timeout)
	}
}

export const manageWin = async ({ target }) => {
	let btnWin = target.dataset.win ? target : target.closest('[data-win]')

	if (btnWin && !btnWin.disabled) {
		let { win, id } = btnWin.dataset
		let mainContent = getSelector('.main__content')
		let winSelector = mainContent.querySelector(`.${win}`)

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

			const timeout = getDurationTimeout(200)
			invokeFunctionByTimeout(afterHideLastWin, timeout)
		}
	}
}
