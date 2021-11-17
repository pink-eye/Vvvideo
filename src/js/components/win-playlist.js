const openWinPlaylist = async id => {
	let playlist = _io_q('.playlist')
	let playlistName = playlist.querySelector('.playlist__name span')
	let playlistViews = playlist.querySelector('.playlist__views')
	let playlistVideoCount = playlist.querySelector('.playlist__video-count')
	let playlistLastUpdated = playlist.querySelector('.playlist__last-upd')
	let playlistDuration = playlist.querySelector('.playlist__duration')
	let titleSkeleton = playlist.querySelector('.title-skeleton')
	let partSkeletonAll = playlist.querySelectorAll('.part-skeleton')
	let authorCard = playlist.querySelector('.author')

	try {
		const data = storage.settings.enableProxy
			? await API.scrapePlaylistVideosProxy(id, getProxyOptions())
			: await API.scrapePlaylistVideos(id)

		const { items } = data

		if (playlistName.textContent !== data.title) playlistName.textContent = data.title

		removeSkeleton(titleSkeleton)

		playlistVideoCount.textContent = `${items.length} / ${data.estimatedItemCount} available videos`
		playlistViews.textContent = normalizeCount(data.views)

		playlistLastUpdated.textContent = data.lastUpdated

		let duration = 0

		for (let index = 0, { length } = items; index < length; index += 1) {
			const video = items[index]
			duration += video.durationSec
		}

		playlistDuration.textContent = convertSecondsToDuration(duration)

		if (partSkeletonAll.length > 0) {
			for (let index = 0, { length } = partSkeletonAll; index < length; index += 1) {
				const partSkeleton = partSkeletonAll[index]
				removeSkeleton(partSkeleton)
			}
		}

		let authorParams = {
			parent: authorCard,
			name: data.author.name,
			avatarSrc: data.author.bestAvatar.url,
			id: data.author.channelID,
		}

		fillAuthorCard(authorParams)

		authorParams = null

		let videoAll = playlist.querySelectorAll('.card')

		items.length > videoAll.length
			? initPages(playlist, items, videoAll, 'video', data.continuation)
			: disablePages(playlist)

		for (let index = 0, { length } = videoAll; index < length; index += 1) {
			let video = videoAll[index]

			video.classList.add('_playlist-video')

			items[index] ? fillVideoCard(video, index, items) : (video.hidden = true)

			video = null
		}

		videoAll = null
	} catch (error) {
		showToast('error', error.message)
	} finally {
		playlist = null
		playlistViews = null
		playlistVideoCount = null
		playlistDuration = null
		partSkeletonAll = null
		playlistName = null
		playlistLastUpdated = null
		titleSkeleton = null
		authorCard = null
	}
}

const resetPlaylist = _ => {
	let playlist = _io_q('.playlist')
	let playlistName = playlist.querySelector('.playlist__name span')
	let playlistViews = playlist.querySelector('.playlist__views')
	let playlistVideoCount = playlist.querySelector('.playlist__video-count')
	let playlistLastUpdated = playlist.querySelector('.playlist__last-upd')
	let playlistDuration = playlist.querySelector('.playlist__duration')
	let titleSkeleton = playlist.querySelector('.title-skeleton')
	let partSkeletonAll = playlist.querySelectorAll('.part-skeleton')

	resetSkeleton(titleSkeleton)
	playlistName.textContent = ''

	if (partSkeletonAll.length > 0) {
		for (let index = 0, { length } = partSkeletonAll; index < length; index += 1) {
			const partSkeleton = partSkeletonAll[index]
			resetSkeleton(partSkeleton)
		}
	}

	playlistViews.textContent = ''
	playlistVideoCount.textContent = ''
	playlistDuration.textContent = ''
	playlistLastUpdated.textContent = ''

	resetGrid(playlist)

	playlist = null
	playlistViews = null
	playlistVideoCount = null
	playlistLastUpdated = null
	playlistDuration = null
	playlistName = null
	titleSkeleton = null
	partSkeletonAll = null
}

const fillSomeInfoPlaylist = ({ title = '', author = '', id = '' }) => {
	let playlist = _io_q('.playlist')
	let authorCard = playlist.querySelector('.author')
	let playlistName = playlist.querySelector('.playlist__name span')
	let titleSkeleton = playlist.querySelector('.title-skeleton')

	if (!isEmpty(title) && title !== '...') {
		playlistName.textContent = title
		removeSkeleton(titleSkeleton)
	}

	resetAuthorCard(authorCard)

	let authorParams = {
		parent: authorCard,
		name: author,
		id,
	}

	fillAuthorCard(authorParams)

	playlist = null
	playlistName = null
	authorCard = null
	titleSkeleton = null
	authorParams = null
}

const preparePlaylistWin = (btnWin, id) => {
	let params = {}

	if (btnWin) {
		params = {
			title: btnWin.querySelector('.card__title span').textContent,
			author: btnWin.querySelector('.card__channel').dataset.name,
			id: btnWin.querySelector('.card__channel').dataset.id,
		}
	}

	fillSomeInfoPlaylist(params)

	openWinPlaylist(id)
}
