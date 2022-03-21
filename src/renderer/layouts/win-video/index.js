import cs from 'Global/CacheSelectors'
import { normalizeCount, isEmpty } from 'Global/utils'
import { formatDate } from 'Layouts/win-video/helper'
import { fillAuthorCard, resetAuthorCard } from 'Components/card/card-author'
import { saveVideoInHistory } from 'Layouts/win-history/helper'
import Spoiler from 'Components/spoiler'
import showToast from 'Components/toast'
import { resetSkeleton, removeSkeleton } from 'Components/skeleton'
import SubscribeBtn from 'Components/subscribe'
import AppStorage from 'Global/AppStorage'
import { initVideoPlayer, handleClickTimecode, resetVideoPlayer } from 'Components/video-controls'
import { normalizeVideoDescription, roundNum } from 'Layouts/win-video/helper'
import { handleClickLink } from 'Global/utils'

const WinVideo = () => {
	const spoiler = Spoiler()
	const appStorage = new AppStorage()
	let subscribeBtn = null

	const videoParent = cs.get('.video')

	const displayPlaylistBtn = playlistId => {
		const actionsPlaylist = videoParent.querySelector('.info-actions__playlist')

		actionsPlaylist.hidden &&= false
		actionsPlaylist.dataset.id = playlistId
	}

	const fetchData = id => {
		const storage = appStorage.get()

		const { enableProxy, proxy } = storage.settings
		return enableProxy ? API.scrapeVideoProxy(id, proxy) : API.scrapeVideo(id)
	}

	const handleClickContent = event => {
		handleClickLink(event)
		handleClickTimecode(event)
	}

	const fill = (data, lastWin) => {
		const videoPoster = videoParent.querySelector('.video__poster img')
		const videoInfo = videoParent.querySelector('.video-info')
		const videoTitle = videoInfo.querySelector('.video-info__title span')
		const videoViews = videoInfo.querySelector('.video-info__views')
		const videoDate = videoInfo.querySelector('.video-info__date')
		const spoilerContent = videoInfo.querySelector('.spoiler__content')
		const titleSkeleton = videoInfo.querySelector('.title-skeleton')
		const partSkeletonAll = videoInfo.querySelectorAll('.part-skeleton')
		const videoLikes = videoInfo.querySelector('.video-info__likes')
		const authorCard = videoInfo.querySelector('.author')
		const subscribeBtnEl = videoInfo.querySelector('.subscribe')

		// SPOILER

		const spoilerEl = videoInfo.querySelector('.spoiler')
		spoiler.init({ element: spoilerEl })

		// FILL WIN

		const { videoDetails } = data

		if (videoDetails.isLive) videoParent.classList.add('_live')

		videoParent.dataset.id = videoDetails.videoId

		subscribeBtn ||= new SubscribeBtn({
			element: subscribeBtnEl,
			channelId: videoDetails.author.id,
			name: videoDetails.author.name,
		})

		spoilerContent.addEventListener('click', handleClickContent)

		// FILL VIDEO INFO

		if (videoDetails.title !== videoTitle.textContent)
			videoTitle.textContent = videoDetails.title

		removeSkeleton(titleSkeleton)

		if (videoDetails.thumbnails) videoPoster.src = videoDetails.thumbnails.at(-1).url

		if (videoViews.textContent === 'Unknown')
			videoViews.textContent = normalizeCount(videoDetails.viewCount)

		if (videoDate.textContent === 'Unknown')
			videoDate.textContent = formatDate(videoDetails.publishDate)

		if (videoDate.textContent === 'Premiere') {
			const { reason: datePremiere } = data.player_response.playabilityStatus
			videoDate.textContent = datePremiere

			const controls = cs.get('.controls')
			controls.hidden = true
		}

		videoLikes.textContent = normalizeCount(videoDetails.likes)

		if (partSkeletonAll.length) {
			for (let index = 0, { length } = partSkeletonAll; index < length; index += 1) {
				const partSkeleton = partSkeletonAll[index]

				removeSkeleton(partSkeleton)
			}
		}

		const authorParams = {
			parent: authorCard,
			name: videoDetails.author.name,
			subs: `${roundNum(videoDetails.author.subscriber_count)} subscribers`,
			id: videoDetails.author.id,
			avatarSrc: videoDetails.author.thumbnails
				? videoDetails.author.thumbnails.at(-1).url
				: '',
		}

		fillAuthorCard(authorParams)

		spoilerContent.innerHTML = normalizeVideoDescription(videoDetails.description)

		saveVideoInHistory(data)
	}

	const fillPart = params => {
		const { title = '', views = '', date = '', author = '', authorId = '' } = params

		const videoInfo = videoParent.querySelector('.video-info')
		const videoTitle = videoInfo.querySelector('.video-info__title span')
		const videoViews = videoInfo.querySelector('.video-info__views')
		const videoDate = videoInfo.querySelector('.video-info__date')
		const authorCard = videoInfo.querySelector('.author')
		const subscribeBtnEl = videoInfo.querySelector('.subscribe')
		const titleSkeleton = videoInfo.querySelector('.title-skeleton')
		const partSkeletonAll = videoInfo.querySelectorAll('.part-skeleton')

		if (!isEmpty(title) && title !== '...') {
			videoTitle.textContent = title
			removeSkeleton(titleSkeleton)
		}
		if (!isEmpty(views) && views !== 'Unknown') {
			videoViews.textContent = views
			removeSkeleton(partSkeletonAll[0])
		}
		if (!isEmpty(date) && date !== 'Unknown') {
			videoDate.textContent = date
			removeSkeleton(partSkeletonAll[1])
		}

		if ('playlistId' in params) displayPlaylistBtn(params.playlistId)

		let authorParams = {
			parent: authorCard,
			name: author,
			id: authorId,
		}

		fillAuthorCard(authorParams)

		subscribeBtn = new SubscribeBtn({
			element: subscribeBtnEl,
			channelId: authorId,
			name: author,
		})
	}

	const init = ({ btnWin, id }) => {
		let params = {}

		if (btnWin) {
			params = {
				title: btnWin.querySelector('.card__title span').textContent,
				views: btnWin.querySelector('.card__views').textContent,
				date: btnWin.querySelector('.card__date').textContent,
				author: btnWin.querySelector('.card__channel').dataset.name,
				authorId: btnWin.querySelector('.card__channel').dataset.id,
			}

			if (btnWin?.dataset?.playlistId) params.playlistId = btnWin.dataset.playlistId

			fillPart(params)
		}

		fetchData(id)
			.then(data => {
				if (videoParent.classList.contains('_active')) {
					if ('playlistId' in params) data.videoDetails.playlistId = params.playlistId

					fill(data)

					initVideoPlayer(data)
				}
			})
			.catch(({ message }) => showToast('error', message))
	}

	const reset = () => {
		resetVideoPlayer()

		const skeletonAll = videoParent.querySelectorAll('.skeleton')
		const videoInfo = videoParent.querySelector('.video-info')
		const videoTitle = videoInfo.querySelector('.video-info__title span')
		const videoLikes = videoInfo.querySelector('.video-info__likes')
		const spoilerContent = videoInfo.querySelector('.spoiler__content')
		const videoViews = videoInfo.querySelector('.video-info__views')
		const videoDate = videoInfo.querySelector('.video-info__date')
		const actionsPlaylist = videoInfo.querySelector('.info-actions__playlist')
		const authorCard = videoInfo.querySelector('.author')

		if (videoParent.classList.contains('_live')) {
			videoParent.classList.remove('_live')
		}

		videoParent.dataset.id = ''

		subscribeBtn.reset()
		spoilerContent.removeEventListener('click', handleClickContent)

		videoTitle.textContent = '...'
		videoLikes.textContent = '...'
		videoViews.textContent = 'Unknown'
		videoDate.textContent = 'Unknown'
		spoilerContent.textContent = '...'

		if (skeletonAll.length) {
			for (let index = 0, { length } = skeletonAll; index < length; index += 1) {
				const skeleton = skeletonAll[index]

				resetSkeleton(skeleton)
			}
		}

		spoiler.reset()

		actionsPlaylist.hidden ||= true

		resetAuthorCard(authorCard)
	}

	return {
		init,
		reset,
	}
}

const winVideo = WinVideo()

export default winVideo
