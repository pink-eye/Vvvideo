import cs from 'Global/CacheSelectors'
import { isEmpty, normalizeCount, convertSecondsToDuration } from 'Global/utils'
import AppStorage from 'Global/AppStorage'
import { resetGrid } from 'Components/grid'
import showToast from 'Components/toast'
import { fillVideoCard } from 'Components/card/card-video'
import Pages from 'Components/grid-btns'
import { resetSkeleton, removeSkeleton } from 'Components/skeleton'
import { fillAuthorCard, resetAuthorCard } from 'Components/card/card-author'

const WinPlaylist = () => {
	const playlist = cs.get('.playlist')
	const pages = Pages()

	const fetchData = id => {
		const appStorage = new AppStorage()
		const { proxy, enableProxy } = appStorage.get().settings

		return enableProxy ? API.scrapePlaylistVideosProxy(id, proxy) : API.scrapePlaylistVideos(id)
	}

	const fill = data => {
		const playlistName = playlist.querySelector('.playlist__name span')
		const playlistViews = playlist.querySelector('.playlist__views')
		const playlistVideoCount = playlist.querySelector('.playlist__video-count')
		const playlistLastUpdated = playlist.querySelector('.playlist__last-upd')
		const playlistDuration = playlist.querySelector('.playlist__duration')
		const titleSkeleton = playlist.querySelector('.title-skeleton')
		const partSkeletonAll = playlist.querySelectorAll('.part-skeleton')
		const authorCard = playlist.querySelector('.author')

		const { title, estimatedItemCount, views, lastUpdated, items, author, continuation, id } =
			data

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

		if (partSkeletonAll.length) {
			for (let index = 0, { length } = partSkeletonAll; index < length; index += 1) {
				const partSkeleton = partSkeletonAll[index]

				removeSkeleton(partSkeleton)
			}
		}

		const authorParams = {
			parent: authorCard,
			name: author.name,
			avatarSrc: author.bestAvatar.url,
			id: author.channelID,
		}

		fillAuthorCard(authorParams)

		const videoAll = playlist.querySelectorAll('.card')

		if (items.length > videoAll.length) {
			pages.init({ element: playlist, data: items, type: 'video', continuation })
		}

		for (let index = 0, { length } = videoAll; index < length; index += 1) {
			const video = videoAll[index]

			if (items[index]) {
				video.classList.add('_playlist-video')
				video.dataset.playlistId = id
				fillVideoCard(video, index, items)
			} else {
				video.hidden = true
			}
		}
	}

	const fillPart = ({ title = '', author = '', id = '' }) => {
		const playlistName = playlist.querySelector('.playlist__name span')
		const titleSkeleton = playlist.querySelector('.title-skeleton')
		const authorCard = playlist.querySelector('.author')

		if (!isEmpty(title) && title !== '...') {
			playlistName.textContent = title
			removeSkeleton(titleSkeleton)
		}

		const authorParams = {
			parent: authorCard,
			name: author,
			id,
		}

		fillAuthorCard(authorParams)
	}

	const init = ({ btnWin, id }) => {
		if (btnWin?.classList.contains('card')) {
			const partialData = {
				title: btnWin.querySelector('.card__title span').textContent,
				author: btnWin.querySelector('.card__channel').dataset.name,
				id: btnWin.querySelector('.card__channel').dataset.id,
			}

			fillPart(partialData)
		}

		fetchData(id)
			.then(data => {
				if (playlist.classList.contains('_active')) fill(data)
			})
			.catch(({ message }) => showToast('error', message))
	}

	const reset = () => {
		const playlistName = playlist.querySelector('.playlist__name span')
		const playlistViews = playlist.querySelector('.playlist__views')
		const playlistVideoCount = playlist.querySelector('.playlist__video-count')
		const playlistLastUpdated = playlist.querySelector('.playlist__last-upd')
		const playlistDuration = playlist.querySelector('.playlist__duration')
		const titleSkeleton = playlist.querySelector('.title-skeleton')
		const partSkeletonAll = playlist.querySelectorAll('.part-skeleton')
		const authorCard = playlist.querySelector('.author')

		resetSkeleton(titleSkeleton)
		resetAuthorCard(authorCard)
		playlistName.textContent = '...'

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
		pages.reset()
	}

	return {
		init,
		reset,
	}
}

const winPlaylist = WinPlaylist()

export default winPlaylist
