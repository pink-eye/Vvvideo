const hideLastTab = _ => {
	let channel = _io_q('.channel');
	let tabContentActive = channel.querySelector(`.tab-content._active`);

	if (tabContentActive && tabContentActive.classList.contains('_active')) {
		tabContentActive.classList.remove('_active');
		tabContentActive = null
	}

	let tabActive = channel.querySelector(`.body-channel__tab._active`);

	if (tabActive && tabActive.classList.contains('_active')) {
		tabActive.classList.remove('_active');

		switch (tabActive.dataset.tab) {
			case 'Videos':
				let channelTabContentVideos = channel.querySelector('.videos');
				resetGrid(channelTabContentVideos)
				channelTabContentVideos = null
				break;

			case 'Playlists':
				let channelTabContentPlaylists = channel.querySelector('.playlists');
				resetGrid(channelTabContentPlaylists)
				channelTabContentPlaylists = null
				break;
		}
	}

	channel = null
	tabActive = null
};

const showRequiredTab = async (tab) => {
	let channel = _io_q('.channel');
	if (tab && !tab.classList.contains('_active'))
		tab.classList.add('_active');

	let reqTabContent = channel.querySelector(`.tab-content[data-tab=${tab.dataset.tab}]`);

	if (reqTabContent && !reqTabContent.classList.contains('_active')) {
		reqTabContent.classList.add('_active');
		reqTabContent = null
	}

	switch (tab.dataset.tab) {
		case 'Videos':
			let channelTabContentVideos = channel.querySelector('.videos');

			const dataChannelVideos = await API.scrapeChannelVideos(channel.dataset.id)
			let videoAll = channelTabContentVideos.querySelectorAll('.card');

			dataChannelVideos.items.length > videoAll.length
				? initPages(channelTabContentVideos, dataChannelVideos.items, videoAll, 'video', dataChannelVideos.continuation)
				: disablePages(channelTabContentVideos)

			for (let index = 0, length = videoAll.length; index < length; index++) {
				let video = videoAll[index];

				dataChannelVideos.items[index]
					? fillVideoCard(video, index, dataChannelVideos.items)
					: video.hidden = true;

				video = null;
			}

			channelTabContentVideos = null
			videoAll = null

			break;

		case 'Playlists':
			let channelTabContentPlaylists = channel.querySelector('.playlists');

			const dataChannelPlaylists = await API.scrapeChannelPlaylists(channel.dataset.id)
			let playlistAll = channelTabContentPlaylists.querySelectorAll('.card');

			dataChannelPlaylists.items.length > playlistAll.length
				? initPages(channelTabContentPlaylists, dataChannelPlaylists.items, playlistAll, 'playlist', dataChannelPlaylists.continuation)
				: disablePages(channelTabContentPlaylists)

			for (let index = 0, length = playlistAll.length; index < length; index++) {
				let playlist = playlistAll[index];

				dataChannelPlaylists.items[index]
					? fillPlaylistCard(playlist, index, dataChannelPlaylists.items)
					: playlist.hidden = true;

				playlist = null;
			}

			channelTabContentPlaylists = null
			playlistAll = null
			break;
	}

	channel = null
};

const handleClickTab = async event => {
	let tab = event.target

	if (!tab.classList.contains('_active')) {
		hideLastTab();
		await showRequiredTab(tab)
	}

	tab = null
}

const initTabs = primary => {
	const tabAll = _io_q('.channel').querySelectorAll('.body-channel__tab');

	if (tabAll.length > 0)
		for (let index = 0, length = tabAll.length; index < length; index++) {
			const tab = tabAll[index],
				tabPrimary = tabAll[primary];

			showRequiredTab(tabPrimary)

			tab.addEventListener("click", handleClickTab)
		}
}

const destroyTabs = _ => {
	let tabAll = _io_q('.channel').querySelectorAll('.body-channel__tab');

	if (tabAll.length > 0)
		for (let index = 0, length = tabAll.length; index < length; index++) {
			const tab = tabAll[index]

			tab.removeEventListener("click", handleClickTab)
		}

	tabAll = null
}
