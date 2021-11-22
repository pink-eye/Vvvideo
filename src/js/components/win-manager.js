import { resetGrid } from './grid'
import {
	isResourceIsChannel,
	isResourceIsPlaylist,
	getDurationTimeout,
	getPlaylistId,
	getChannelIdOrUser,
} from '../global'
import { activateSidebarBtn, deactivateLastSidebarBtn } from './sidebar'

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
		resetVideo()
	}

	if (win.classList.contains('playlist')) resetPlaylist()

	if (win.classList.contains('channel')) resetChannel()

	if (win.classList.contains('settings')) resetWinSettings()
}

const startFillingWin = ({ win, btnWin, id }) => {
	switch (win) {
		case 'trending':
			openWinTrending(storage.settings.regionTrending)
			break

		case 'latest':
			openWinLatest()
			break

		case 'subscriptions':
			openWinSubs()
			break

		case 'video':
			prepareVideoWin(btnWin, id)

			break

		case 'channel':
			prepareChannelWin(btnWin, id)

			break

		case 'playlist':
			preparePlaylistWin(btnWin, id)

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
		let mainContent = _io_q('.main__content')
		let winSelector = mainContent.querySelector(`.${win}`)

		if (win === 'search-results') {
			let searchBar = _io_q('.search__bar')
			const { value } = searchBar

			if (API.isYTVideoURL(value)) {
				win = 'video'
				id = API.getVideoId(value)
				winSelector = _io_q('.video')
			}

			if (isResourceIsPlaylist(value)) {
				win = 'playlist'
				winSelector = _io_q('.playlist')
				id = getPlaylistId(value)
			}

			if (isResourceIsChannel(value)) {
				win = 'channel'
				winSelector = _io_q('.channel')
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
