const resetWin = win => {

	if (win.classList.contains('search-results') ||
		win.classList.contains('trending') ||
		win.classList.contains('history') ||
		win.classList.contains('latest'))
		resetGrid(win)

	if (win.classList.contains('subscriptions'))
		resetGridAuthorCard()

	if (win.classList.contains('video')) {
		resetVideoPlayer()
		resetVideo()
	}

	if (win.classList.contains('playlist'))
		resetPlaylist()

	if (win.classList.contains('channel'))
		resetChannel()

	if (win.classList.contains('settings'))
		resetWinSettings()
}

const startFillingWin = ({ reqWinString, btnWin, reqID, reqWin }) => {

	switch (reqWinString) {
		case 'trending':
			openWinTrending(storage.settings.regionTrending)
			break;

		case 'latest':
			openWinLatest()
			break;

		case 'subscriptions':
			openWinSubs()
			break;

		case 'video':
			prepareVideoWin(btnWin, reqID)

			break;

		case 'channel':
			prepareChannelWin(btnWin, reqID)

			break;

		case 'playlist':
			preparePlaylistWin(btnWin, reqID)

			break;

		case 'search-results':

			let searchBar = _io_q('.search__bar');

			if (API.YTDLvalidateURL(searchBar.value)) {
				reqWin = _io_q('.video')
				prepareVideoWin(null, API.YTDLgetVideoID(searchBar.value))
			} else if (isResourceIsPlaylist(searchBar.value)) {
				reqWin = _io_q('.playlist')
				preparePlaylistWin(null, getPlaylistId(searchBar.value))
			} else if (isResourceIsChannel(searchBar.value)) {
				reqWin = _io_q('.channel')
				prepareChannelWin(null, getChannelIdOrUser(searchBar.value))
			} else openWinSearchResults()

			searchBar = null

			break;

		case 'history':
			openWinHistory()
			break;

		case 'settings':
			openWinSettings()
			break;
	}

	return reqWin
}

const showWin = win => {
	win.classList.add('_active');

	const afterActiveWin = _ => {
		win.classList.add('_anim-win');
	}

	setTimeout(afterActiveWin, 15)
}

const hideWin = win => {

	if (win) {
		win.classList.remove('_anim-win');

		if (win.classList.contains('video'))
			rememberWatchedTime()

		const onHideLastWin = _ => {
			win.classList.remove('_active');

			const afterOpenWin = _ => {
				resetWin(win)

				win = null;
			}

			setTimeout(afterOpenWin, 200);
		}

		setTimeout(onHideLastWin, getDurationTimeout(200));
	}
}

const manageWin = async e => {
	let btnWin = e.target.dataset.win ? e.target : e.target.closest('[data-win]');

	if (btnWin && !btnWin.disabled) {
		const reqWinString = btnWin.dataset.win
		const reqID = btnWin.dataset.id
		let mainContent = _io_q('.main__content');
		let reqWin = mainContent.querySelector(`.${reqWinString}`);
		let lastWin = mainContent.querySelector('.win._active._anim-win');

		if (reqWin.classList.contains('_active')) {
			resetWin(lastWin)
			startFillingWin({ reqWinString, reqWin, reqID, btnWin })

			mainContent = null
			reqWin = null
			lastWin = null
			btnWin = null
		} else {
			hideWin(lastWin)

			if (btnWin.classList.contains('sidebar__btn')) {
				deactivateLastSidebarBtn();
				activateSidebarBtn(btnWin);
			} else deactivateLastSidebarBtn()

			const afterHideLastWin = _ => {
				scrollToTop()

				reqWin = startFillingWin({ reqWinString, reqWin, reqID, btnWin })

				showWin(reqWin)

				mainContent = null
				reqWin = null
				lastWin = null
				btnWin = null
			}

			setTimeout(afterHideLastWin, getDurationTimeout(200));
		}
	}
}
