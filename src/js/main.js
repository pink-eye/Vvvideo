document.addEventListener('DOMContentLoaded', async _ => {

	// MAIN SELECTORS

	const video = _io_q('.video');
	const channel = _io_q('.channel');
	const playlist = _io_q('.playlist');
	const header = _io_q('.header');
	const sidebar = _io_q('.sidebar');
	const settings = _io_q('.settings');

	const videoInfo = video.querySelector('.video-info');
	const videoTitle = videoInfo.querySelector('.video-info__title');
	const videoViews = videoInfo.querySelector('.video-info__views span');
	const videoDate = videoInfo.querySelector('.video-info__date span');
	const videoChannel = videoInfo.querySelector('.author__name');
	const videoChannelBtn = videoInfo.querySelector('[data-win="channel"]');
	let videoSubscribeBtn = videoInfo.querySelector('.subscribe');
	let videoSubscribeText = videoInfo.querySelector('.subscribe__text');

	const channelTitle = channel.querySelector('.heading-channel__author');
	const channelTabContentVideos = channel.querySelector('.videos');
	const channelTabContentPlaylists = channel.querySelector('.playlists');
	let channelSubscribeBtn = channel.querySelector('.subscribe');
	let channelSubscribeText = channel.querySelector('.subscribe__text');

	const playlistName = playlist.querySelector('.playlist__name');
	const playlistChannel = playlist.querySelector('.author');
	const playlistAuthor = playlist.querySelector('.author__name');

	const headerSearch = header.querySelector('.search');
	const headerBtn = header.querySelector('.header__btn');
	const searchBar = headerSearch.querySelector('.search__bar');
	const searchBtn = headerSearch.querySelector('.search__btn');

	const themeDropdown = settings.querySelector('.option__theme');
	const protocolDropdown = settings.querySelector('.option__protocol');
	const qualityDropdown = settings.querySelector('.option__quality');
	const formatDropdown = settings.querySelector('.option__format');

	await API.readStorage(async data => {
		Object.assign(storage, JSON.parse(data))

		fillWinSettings()

		getLatest().then(_ => {
			showToast('good', 'Successfully')
		})

		initSuggests(headerSearch)
	})

	// HIDE ON SCROLL

	hideOnScroll(header, 0)
	hideOnScroll(sidebar, 767)

	// SPOILER

	const spoilerVideoDescr = videoInfo.querySelector('.spoiler');

	initSpoiler(spoilerVideoDescr)

	// DROPDOWN

	initDropdown(themeDropdown, params => {
		setTheme(params.btn.dataset.choice)
		storage.settings.theme = params.btn.dataset.choice
		API.writeStorage(storage)
	})

	initDropdown(qualityDropdown, params => {
		storage.settings.defaultQuality = params.btn.dataset.choice
		API.writeStorage(storage)
	})

	initDropdown(protocolDropdown, params => {
		storage.settings.proxy.protocol = params.btn.textContent.toLowerCase()
		API.writeStorage(storage)
	})

	initDropdown(formatDropdown, params => {
		storage.settings.defaltVideoFormat = params.btn.textContent
		API.writeStorage(storage)
	})

	// BURGER

	const burger = header.querySelector('.burger')

	burger.addEventListener('click', toggleMenu);

	// MANAGE WINDOWS

	const fillSomeInfoVideo = params => {
		videoTitle.textContent = params.title;
		videoViews.textContent = params.views !== '...' || !isEmpty(params.views) ? params.views : '...';
		videoDate.textContent = params.date !== '...' || !isEmpty(params.date) ? params.date : '...';
		videoChannel.textContent = params.author;
		videoChannelBtn.dataset.id = params.authorId;

		videoSubscribeBtn.dataset.channelId = params.authorId
		videoSubscribeBtn.dataset.name = params.author

		if (hasSubscription(params.authorId)) {
			videoSubscribeBtn.classList.add('_subscribed')
			videoSubscribeText.textContent = 'Unsubscribe'
		} else {
			videoSubscribeBtn.classList.remove('_subscribed')
			videoSubscribeText.textContent = 'Subscribe'
		}
	}

	const fillSomeInfoChannel = (title, authorId) => {
		channelTitle.textContent = title
		channelSubscribeBtn.dataset.channelId = authorId
		channelSubscribeBtn.dataset.name = title
	}

	const fillSomeInfoPlaylist = params => {
		playlistName.textContent = params.title
		playlistAuthor.textContent = params.author
		playlistChannel.dataset.id = params.id
	}

	const prepareVideoWin = (btnWin, id) => {
		if (btnWin !== null) {
			let params = {
				title: btnWin.querySelector('.card__title span').textContent,
				views: btnWin.querySelector('.card__views').textContent,
				date: btnWin.querySelector('.card__date').textContent,
				author: btnWin.querySelector('.card__channel').textContent,
				authorId: btnWin.querySelector('.card__channel').dataset.id
			}

			fillSomeInfoVideo(params);
		} else {
			fillSomeInfoVideo({
				title: 'Title',
				views: '...',
				date: '...',
				author: 'Author',
				authorId: ''
			});
		}

		getVideo(id).then(initVideoPlayer)

		if (!storage.settings.disableSponsorblock)
			getSegmentsSB(id)
	}

	const prepareChannelWin = (btnWin, id) => {
		getChannel(id)

		if (btnWin !== null) {
			let channelTitle = btnWin.classList.contains('card')
				? btnWin.querySelector('.card__title span')
				: btnWin.querySelector('.author__name')

			let channelId = btnWin.classList.contains('card') && !btnWin.classList.contains('_channel')
				? btnWin.querySelector('.card__channel').dataset.id
				: btnWin.dataset.id

			fillSomeInfoChannel(channelTitle.textContent, channelId)

			channelTitle = null
		} else fillSomeInfoChannel('Author', '')
	}

	const preparePlaylistWin = (btnWin, id) => {
		getPlaylist(id)

		if (btnWin !== null) {
			let params = {
				title: btnWin.querySelector('.card__title span').textContent,
				author: btnWin.querySelector('.card__channel').textContent,
				id: btnWin.querySelector('.card__channel').dataset.id
			}

			fillSomeInfoPlaylist(params)

			params = null
		} else {
			fillSomeInfoPlaylist({
				title: 'Title',
				author: 'Author',
				id: ''
			})
		}
	}

	const showWin = win => {
		win.classList.add('_active');
		setTimeout(_ => { win.classList.add('_anim-win'); }, 15)
	}

	const hideLastWin = async _ => {
		let lastWin = _io_q('.main__content').querySelector('.win._active._anim-win');

		if (lastWin) {
			lastWin.classList.remove('_anim-win');

			setTimeout(_ => {
				lastWin.classList.remove('_active');

				if (lastWin.classList.contains('search-results'))
					resetGrid(_io_q('.search-results'))

				if (lastWin.classList.contains('trending'))
					resetGrid(_io_q('.trending'))

				if (lastWin.classList.contains('latest')) {
					resetIndicator()
					resetGrid(_io_q('.latest'))
				}

				if (lastWin.classList.contains('subscriptions'))
					resetGridAuthorCard()

				if (lastWin.classList.contains('video'))
					resetVideo()

				if (lastWin.classList.contains('playlist'))
					resetPlaylist()

				if (lastWin.classList.contains('channel'))
					resetChannel(channelTabContentVideos, channelTabContentPlaylists)

				lastWin = null;
			}, getDurationTimeout());

		}
	}

	const activateSidebarBtn = btn => {
		btn.classList.add('_active');
	}

	const deactivateLastSidebarBtn = _ => {
		let lastActiveSidebarBtn = sidebar.querySelector('.sidebar__btn._active');

		if (lastActiveSidebarBtn) {
			lastActiveSidebarBtn.classList.remove('_active');
			lastActiveSidebarBtn = null;
		}
	}

	const manageWin = async e => {
		if (e.target.dataset.win || e.target.closest('[data-win]')) {
			let btnWin = e.target.dataset.win ? e.target : e.target.closest('[data-win]');
			if (!btnWin.disabled) {
				let reqWin = _io_q('.main__content').querySelector(`.${btnWin.dataset.win}`);
				if (!reqWin.classList.contains('_active') || reqWin.classList.contains('search-results')) {

					if (btnWin.classList.contains('sidebar__btn')) {
						deactivateLastSidebarBtn();
						activateSidebarBtn(btnWin);
					} else deactivateLastSidebarBtn()

					switch (btnWin.dataset.win) {
						case 'trending':
							setTimeout(scrollToTop, getDurationTimeout())
							getTrending(storage.settings.regionTrending)
							break;

						case 'latest':
							setTimeout(scrollToTop, getDurationTimeout())
							getLatest()
							break;

						case 'subscriptions':
							setTimeout(scrollToTop, getDurationTimeout())
							showSubscriptions()
							break;

						case 'video':
							if (!isEmpty(btnWin.dataset.id)) {
								setTimeout(scrollToTop, getDurationTimeout())
								prepareVideoWin(btnWin, btnWin.dataset.id)
							} else return

							break;

						case 'channel':
							if (!isEmpty(btnWin.dataset.id)) {
								setTimeout(scrollToTop, getDurationTimeout())
								prepareChannelWin(btnWin, btnWin.dataset.id)
							} else return

							break;

						case 'playlist':
							if (!isEmpty(btnWin.dataset.id)) {
								setTimeout(scrollToTop, getDurationTimeout())
								preparePlaylistWin(btnWin, btnWin.dataset.id)
							} else return

							break;

						case 'search-results':
							setTimeout(scrollToTop, getDurationTimeout())

							if (API.YTDLvalidateURL(searchBar.value)) {
								reqWin = _io_q('.video')
								prepareVideoWin(null, API.YTDLgetVideoID(searchBar.value))
							} else if (isResourceIsPlaylist(searchBar.value)) {
								reqWin = _io_q('.playlist')
								preparePlaylistWin(null, await API.YTPLgetPlaylistID(searchBar.value))
							} else if (isResourceIsChannel(searchBar.value)) {
								reqWin = _io_q('.channel')
								prepareChannelWin(null, getChannelIdOrUser(searchBar.value))
							} else getSearchResults()

							break;

					}

					hideLastWin()

					setTimeout(_ => {
						showWin(reqWin)
						reqWin = null;
					}, getDurationTimeout());
				}
			}
		}
	}

	sidebar.addEventListener('click', manageWin);

	searchBtn.addEventListener('click', e => {
		if (!isEmpty(searchBar.value))
			manageWin(e)
	});

	// HOT KEYS ON SEARCH

	searchBar.onkeydown = e => {

		// ARROWS
		if (e.keyCode === 40 || e.keyCode === 38) {
			resetSelected(headerSearch)
			chooseSuggest(headerSearch, lastSelected, e.keyCode)
		}

		// ESC
		if (e.keyCode === 27) {
			hideSuggest(headerSearch)
			searchBar.blur()
		}

		// ENTER
		if (e.keyCode === 13 && !isEmpty(searchBar.value)) {
			hideSuggest(headerSearch)
			manageWin(e)
		}
	}

	_io_q('.main__content').addEventListener('click', manageWin);

	// SUBSCRIBE LISTENERS

	videoSubscribeBtn.addEventListener('click', _ => {
		if (videoSubscribeText.textContent === 'Subscribe' &&
			!videoSubscribeBtn.classList.contains('_subscribed')) {
			onClickSubscribe(videoSubscribeBtn, videoSubscribeText)
		} else if (videoSubscribeText.textContent === 'Unsubscribe' &&
			videoSubscribeBtn.classList.contains('_subscribed')) {
			onClickUnsubscribe(videoSubscribeBtn, videoSubscribeText)
		}
	});

	channelSubscribeBtn.addEventListener('click', _ => {
		if (channelSubscribeText.textContent === 'Subscribe' &&
			!channelSubscribeBtn.classList.contains('_subscribed')) {
			onClickSubscribe(channelSubscribeBtn, channelSubscribeText)
		} else if (channelSubscribeText.textContent === 'Unsubscribe' &&
			channelSubscribeBtn.classList.contains('_subscribed')) {
			onClickUnsubscribe(channelSubscribeBtn, channelSubscribeText)
		}
	});

	window.addEventListener('click', async e => {
		if (!e.target.closest('.dropdown'))
			hideLastDropdown()
		if (!e.target.closest('.search'))
			hideSuggest(headerSearch)
	});

	// REFRESH BTN

	headerBtn.addEventListener('click', _ => { location.reload() });

	// IMPLEMENT IMPORT

	const impExpBody = settings.querySelector('.imp-exp'),
		impExpBtn = settings.querySelector('.imp-exp__btn.btn-accent'),
		impExpField = settings.querySelector('.imp-exp__field'),
		impExpTip = settings.querySelector('.imp-exp__tip');

	let invalidTip = "I've not found a JSON file.\n Ensure you interacted this area",
		validTip = "Succesfully! Wait for refresh...",
		proccessTip = "I've got a",
		failTip = "Fail... :(";

	const validImport = _ => {
		if (!impExpBody.classList.contains('_valid')) {
			impExpBody.classList.add('_valid');
			impExpTip.textContent = validTip
		}
	}

	const invalidImport = tip => {
		if (!impExpBody.classList.contains('_invalid')) {
			impExpBody.classList.add('_invalid');
			impExpTip.textContent = tip
		}
	}

	const readInputFile = async _ => {
		let reader = new FileReader();
		reader.readAsText(impExpField.files[0]);
		reader.onload = async _ => {
			let data = JSON.parse(reader.result)

			if (!data.hasOwnProperty('subscriptions'))
				invalidImport(failTip);
			else {
				buildStorage(data)
				await API.writeStorage(storage);
				validImport();

				setTimeout(_ => { document.location.reload() }, 3000)
			}
		}
	}

	impExpField.addEventListener('change', _ => {
		impExpBody.classList.remove('_valid')
		impExpBody.classList.remove('_invalid')
		impExpTip.textContent = `${proccessTip} '${impExpField.files[0].name}'. You can press 'Import' now`
	});

	impExpBtn.addEventListener('click', _ => {
		impExpField.value === '' || (/\.(json)$/i).test(impExpField.files[0].name) === false
			? invalidImport(invalidTip)
			: readInputFile()
	});

	// // WIN SETTINGS

	// CHECKBOXES

	const checkboxAll = settings.querySelectorAll('input[type="checkbox"]');

	for (let index = 0, length = checkboxAll.length; index < length; index++) {
		const checkbox = checkboxAll[index];

		checkbox.addEventListener('change', _ => {
			switch (checkbox.id) {
				case 'disableTransition':
					toggleTransition(checkbox.checked)
					storage.settings.disableTransition = checkbox.checked
					break;

				case 'enableProxy':
					storage.settings.enableProxy = checkbox.checked

					checkbox.checked
						? showToast('good', 'Restart app after the fields is filled in')
						: showToast('good', 'Restart app')
					break;

				case 'disableSponsorblock':
					toggleSponsorblock(checkbox.checked)
					storage.settings.disableSponsorblock = checkbox.checked
					break;

				case 'notifySkipSegment':
					storage.settings.notifySkipSegment = checkbox.checked
					break;

				case 'autoplay':
					storage.settings.autoplay = checkbox.checked
					break;

				case 'disableSeparatedStreams':
					storage.settings.disableSeparatedStreams = checkbox.checked
					break;

				case 'notAdaptContent':
					storage.settings.notAdaptContent = checkbox.checked

					if (checkbox.checked)
						_io_q('.main__content').style.setProperty('--margin', '0')
					break;

				case 'disableSearchSuggestions':
					storage.settings.disableSearchSuggestions = checkbox.checked
					showToast('good', 'Refresh app')
					break;

			}

			API.writeStorage(storage)
		});
	}

	// INPUTS

	const inputAll = settings.querySelectorAll('input[type="text"]');

	for (let index = 0, length = inputAll.length; index < length; index++) {
		const input = inputAll[index];

		input.addEventListener('input', _ => {
			switch (input.id) {
				case 'host':
					input.value = formatIP(input.value)
					storage.settings.proxy.host = input.value
					break;

				case 'port':
					input.value = formatPort(input.value)
					storage.settings.proxy.port = +input.value
					break;

				case 'regionTrending':
					storage.settings.regionTrending = input.value
					break;
			}

			API.writeStorage(storage)
		});
	}

	// EXIT

	const btnExit = sidebar.querySelector('.btn-exit');
	btnExit.addEventListener('click', _ => { window.close() });

});
