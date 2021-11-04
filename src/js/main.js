document.addEventListener('DOMContentLoaded', async _ => {

	// MAIN SELECTORS

	const header = _io_q('.header');
	const sidebar = _io_q('.sidebar');
	const mainContent = _io_q('.main__content');

	const headerSearch = header.querySelector('.search');
	const searchBar = headerSearch.querySelector('.search__bar');
	const searchBtn = headerSearch.querySelector('.search__btn');

	const onReadStorage = async data => {
		Object.assign(storage, JSON.parse(data))

		fillWinSettings()

		openWinLatest()

		initSuggests(headerSearch)

		if (storage.settings.disableSearchSuggestions)
			searchBar.addEventListener('blur', hideOverlay);
	}

	await API.readStorage(onReadStorage)

	// HIDE ON SCROLL

	hideOnScroll(header, 0)
	hideOnScroll(sidebar, 767)

	// MANAGE WINDOWS

	const showWin = win => {
		win.classList.add('_active');

		const afterActiveWin = _ => {
			win.classList.add('_anim-win');
		}

		setTimeout(afterActiveWin, 15)
	}

	const hideLastWin = async _ => {
		let lastWin = mainContent.querySelector('.win._active._anim-win');

		if (lastWin) {
			lastWin.classList.remove('_anim-win');

			if (lastWin.classList.contains('video'))
				rememberWatchedTime()

			const onHideLastWin = _ => {
				lastWin.classList.remove('_active');

				const afterOpenWin = _ => {
					if (lastWin.classList.contains('search-results') ||
						lastWin.classList.contains('trending') ||
						lastWin.classList.contains('history') ||
						lastWin.classList.contains('latest'))
						resetGrid(lastWin)

					if (lastWin.classList.contains('subscriptions'))
						resetGridAuthorCard()

					if (lastWin.classList.contains('video')) {
						resetVideoPlayer()
						resetVideo()
					}

					if (lastWin.classList.contains('playlist'))
						resetPlaylist()

					if (lastWin.classList.contains('channel'))
						resetChannel()

					if (lastWin.classList.contains('settings'))
						resetWinSettings()

					lastWin = null;
				}

				setTimeout(afterOpenWin, 200);
			}

			setTimeout(onHideLastWin, getDurationTimeout(200));
		}
	}

	const activateSidebarBtn = btn => {
		btn.classList.add('_active');
	}

	const deactivateLastSidebarBtn = _ => {
		let lastActiveSidebarBtn = sidebar.querySelector('.sidebar__btn._active');

		if (lastActiveSidebarBtn)
			lastActiveSidebarBtn.classList.remove('_active');

		lastActiveSidebarBtn = null;
	}

	const manageWin = async e => {
		if (e.target.dataset.win || e.target.closest('[data-win]')) {
			const btnWin = e.target.dataset.win ? e.target : e.target.closest('[data-win]');
			const reqWinString = btnWin.dataset.win
			const reqID = btnWin.dataset.id

			if (!btnWin.disabled) {
				let reqWin = mainContent.querySelector(`.${reqWinString}`);

				if (!reqWin.classList.contains('_active') || reqWin.classList.contains('search-results')) {
					hideLastWin()

					if (btnWin.classList.contains('sidebar__btn')) {
						deactivateLastSidebarBtn();
						activateSidebarBtn(btnWin);
					} else deactivateLastSidebarBtn()

					const afterHideLastWin = _ => {

						scrollToTop()

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

								break;

							case 'history':
								openWinHistory()
								break;

							case 'settings':
								openWinSettings()
								break;
						}

						showWin(reqWin)
						reqWin = null;
					}

					setTimeout(afterHideLastWin, getDurationTimeout(200));
				}
			}
		}
	}

	sidebar.addEventListener('click', manageWin);

	const handleClickSearch = e => {
		if (!isEmpty(searchBar.value))
			manageWin(e)
	}

	searchBtn.addEventListener('click', handleClickSearch);

	searchBar.addEventListener('focus', showOverlay);

	// HOT KEYS ON SEARCH

	const handleKeyDownSearch = e => {

		// ARROWS
		if (e.keyCode === 40 || e.keyCode === 38) {
			resetSelected(headerSearch)
			chooseSuggest(headerSearch, e.keyCode)
		}

		// ESC || ENTER
		if (e.keyCode === 27 || e.keyCode === 13)
			searchBar.blur()

		// ENTER
		if (e.keyCode === 13 && !isEmpty(searchBar.value))
			manageWin(e)

	}

	searchBar.addEventListener('keydown', handleKeyDownSearch);

	mainContent.addEventListener('click', manageWin);

	const handleClickWindow = e => {
		if (!e.target.closest('.dropdown'))
			hideLastDropdown()
		if (!e.target.closest('.search')) {
			hideSuggest(headerSearch)
			hideOverlay()
		}
	}

	window.addEventListener('click', handleClickWindow);

	// DROPDOWN

	const settings = _io_q('.settings');
	const themeDropdown = settings.querySelector('.option__theme');
	const protocolDropdown = settings.querySelector('.option__protocol');
	const qualityDropdown = settings.querySelector('.option__quality');
	const formatDropdown = settings.querySelector('.option__format');

	initDropdown(themeDropdown, btn => {
		setTheme(btn.dataset.choice)
		storage.settings.theme = btn.dataset.choice
		API.writeStorage(storage)
	})

	initDropdown(qualityDropdown, btn => {
		storage.settings.defaultQuality = btn.dataset.choice
		API.writeStorage(storage)
	})

	initDropdown(protocolDropdown, btn => {
		storage.settings.proxy.protocol = btn.textContent.toLowerCase()
		API.writeStorage(storage)
	})

	initDropdown(formatDropdown, btn => {
		storage.settings.defaltVideoFormat = btn.textContent
		API.writeStorage(storage)
	})
});
