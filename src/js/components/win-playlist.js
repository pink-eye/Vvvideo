const getPlaylist = async id => {
	let playlist = _io_q('.playlist');
	let playlistName = playlist.querySelector('.playlist__name');
	let playlistAuthor = playlist.querySelector('.author__name');
	let playlistViews = playlist.querySelector('.playlist__views span');
	let playlistVideoCount = playlist.querySelector('.playlist__video-count');
	let playlistLastUpdated = playlist.querySelector('.playlist__last-upd');
	let playlistAvatar = playlist.querySelector('.author__avatar img');
	let playlistDuration = playlist.querySelector('.playlist__duration span');
	let avatarSkeleton = playlist.querySelector('.avatar-skeleton');

	try {
		let data = storage.settings.enableProxy
			? await API.scrapePlaylistVideosProxy(id, getProxyOptions())
			: await API.scrapePlaylistVideos(id)

		console.log(data);

		if (playlistName.textContent !== data.title)
			playlistName.textContent = data.title

		if (playlistAuthor.textContent !== data.author.name)
			playlistAuthor.textContent = data.author.name

		playlistVideoCount.textContent = `${data.items.length} / ${data.estimatedItemCount} available videos`
		playlistViews.textContent = normalizeCount(data.views)

		playlistLastUpdated.textContent = data.lastUpdated

		let duration = 0
		for (let index = 0, length = data.items.length; index < length; index++) {
			const video = data.items[index];
			duration += video.durationSec
		}

		playlistDuration.textContent = normalizeDuration(duration)

		playlistAvatar.src = data.author.bestAvatar.url
		playlistAvatar.onload = _ => {
			avatarSkeleton.classList.add('_removing');

			playlistAvatar = null
			avatarSkeleton = null
		}

		let videoAll = _io_q('.playlist').querySelectorAll('.card');

		data.items.length > videoAll.length
			? initPages(playlist, data.items, videoAll, 'video', data.continuation)
			: disablePages(playlist)

		for (let index = 0, length = videoAll.length; index < length; index++) {
			let video = videoAll[index];

			video.classList.add('_playlist-video');

			data.items[index]
				? fillVideoCard(video, index, data.items)
				: video.hidden = true;

			video = null;
		}
	} catch (error) {
		showToast('error', error.message);
	} finally {
		playlist = null
		playlistViews = null
		playlistVideoCount = null
		playlistDuration = null
	}
}


const resetPlaylist = async _ => {
	let playlist = _io_q('.playlist');
	let playlistViews = playlist.querySelector('.playlist__views span');
	let playlistVideoCount = playlist.querySelector('.playlist__video-count');
	let playlistLastUpdated = playlist.querySelector('.playlist__last-upd');
	let playlistDuration = playlist.querySelector('.playlist__duration span');
	let avatarSkeleton = playlist.querySelector('.avatar-skeleton');

	if (avatarSkeleton.classList.contains('_removing'))
		avatarSkeleton.classList.remove('_removing')

	playlistViews.textContent = '...'
	playlistVideoCount.textContent = '...'
	playlistDuration.textContent = '...'
	playlistLastUpdated.textContent = '...'

	resetGrid(playlist)

	playlist = null;
	playlistViews = null;
	playlistDuration = null;
	avatarSkeleton = null;
}
