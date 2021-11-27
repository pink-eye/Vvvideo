import { getSelector, isEmpty, normalizeCount, convertSecondsToDuration } from 'Global/utils'
import { AppStorage } from 'Global/app-storage'
import { resetGrid } from 'Components/grid'
import { showToast } from 'Components/toast'
import { fillVideoCard } from 'Components/card/card-video'
import { initPages, disablePages } from 'Components/grid-btns'
import { resetSkeleton, removeSkeleton } from 'Components/skeleton'
import { fillAuthorCard, resetAuthorCard } from 'Components/card/card-author'

const getPlaylistData = id => {
	const appStorage = new AppStorage()
	const { proxy, enableProxy } = appStorage.getStorage().settings

	return enableProxy ? API.scrapePlaylistVideosProxy(id, proxy) : API.scrapePlaylistVideos(id)
}

const openWinPlaylist = data => {
	let playlist = getSelector('.playlist')
	let playlistName = playlist.querySelector('.playlist__name span')
	let playlistViews = playlist.querySelector('.playlist__views')
	let playlistVideoCount = playlist.querySelector('.playlist__video-count')
	let playlistLastUpdated = playlist.querySelector('.playlist__last-upd')
	let playlistDuration = playlist.querySelector('.playlist__duration')
	let titleSkeleton = playlist.querySelector('.title-skeleton')
	let partSkeletonAll = playlist.querySelectorAll('.part-skeleton')
	let authorCard = playlist.querySelector('.author')

	const { title, estimatedItemCount, views, lastUpdated, items, author, continuation } = data

	if (playlistName.textContent !== title) playlistName.textContent = title

	removeSkeleton(titleSkeleton)

	playlistVideoCount.textContent = `${items.length} / ${estimatedItemCount} available videos`
	playlistViews.textContent = normalizeCount(views)

	playlistLastUpdated.textContent = lastUpdated

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
		name: author.name,
		avatarSrc: author.bestAvatar.url,
		id: author.channelID,
	}

	fillAuthorCard(authorParams)

	authorParams = null

	let videoAll = playlist.querySelectorAll('.card')

	items.length > videoAll.length
		? initPages(playlist, items, videoAll, 'video', continuation)
		: disablePages(playlist)

	for (let index = 0, { length } = videoAll; index < length; index += 1) {
		let video = videoAll[index]

		video.classList.add('_playlist-video')

		items[index] ? fillVideoCard(video, index, items) : (video.hidden = true)

		video = null
	}

	videoAll = null
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

export const resetWinPlaylist = _ => {
	let playlist = getSelector('.playlist')
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
	let playlist = getSelector('.playlist')
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

export const prepareWinPlaylist = async (btnWin, id) => {
	let params = {}

	if (btnWin) {
		params = {
			title: btnWin.querySelector('.card__title span').textContent,
			author: btnWin.querySelector('.card__channel').dataset.name,
			id: btnWin.querySelector('.card__channel').dataset.id,
		}
	}

	fillSomeInfoPlaylist(params)

	let data = null

	try {
		data = await getPlaylistData(id)
	} catch ({ message }) {
		showToast('error', message)
		return
	}

	openWinPlaylist(data)
}
