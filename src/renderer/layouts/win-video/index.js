import { getSelector, normalizeCount, isEmpty } from 'Global/utils'
import { formatDate } from 'Layouts/win-video/helper'
import { fillAuthorCard, resetAuthorCard } from 'Components/card/card-author'
import { saveVideoInHistory } from 'Layouts/win-history/helper'
import { initSpoiler, destroySpoiler } from 'Components/spoiler'
import { showToast } from 'Components/toast'
import { resetSkeleton, removeSkeleton } from 'Components/skeleton'
import { prepareSubscribeBtn, destroySubscribeBtn } from 'Components/subscribe'
import { AppStorage } from 'Global/app-storage'
import { initVideoPlayer, handleClickTimecode } from 'Components/video-controls'
import { normalizeVideoDescription, roundNum } from 'Layouts/win-video/helper'
import { handleClickLink } from 'Global/utils'

const appStorage = new AppStorage()
let storage = null

const getVideoData = id => {
	storage = appStorage.get()

	const { enableProxy, proxy } = storage.settings
	return enableProxy ? API.scrapeVideoProxy(id, proxy) : API.scrapeVideo(id)
}

const handleClickContent = event => {
	handleClickLink(event)
	handleClickTimecode(event)
}

const openWinVideo = data => {
	let video = getSelector('.video')
	let videoPoster = video.querySelector('.video__poster img')
	let topBarTitle = video.querySelector('.top-bar__title')
	let topBarAuthor = video.querySelector('.top-bar__author')
	let controls = getSelector('.controls')
	let storyboard = controls.querySelector('.seek-tooltip__storyboard')
	let videoInfo = video.querySelector('.video-info')
	let videoTitle = videoInfo.querySelector('.video-info__title span')
	let videoViews = videoInfo.querySelector('.video-info__views')
	let videoDate = videoInfo.querySelector('.video-info__date')
	let spoilerContent = videoInfo.querySelector('.spoiler__content')
	let titleSkeleton = videoInfo.querySelector('.title-skeleton')
	let partSkeletonAll = videoInfo.querySelectorAll('.part-skeleton')
	let videoLikes = videoInfo.querySelector('.video-info__likes')
	let videoDislikes = videoInfo.querySelector('.video-info__dislikes')
	let authorCard = videoInfo.querySelector('.author')
	let subscribeBtn = videoInfo.querySelector('.subscribe')
	let { settings } = storage

	// SPOILER

	const spoiler = videoInfo.querySelector('.spoiler')

	initSpoiler(spoiler)

	// FILL WIN

	const { videoDetails } = data

	if (videoDetails.isLive) video.classList.add('_live')

	video.dataset.id = videoDetails.videoId

	prepareSubscribeBtn(subscribeBtn, videoDetails.author.id, videoDetails.author.name)

	spoilerContent.addEventListener('click', handleClickContent)

	// FILL VIDEO INFO

	if (settings.disableStoryboard || videoDetails.storyboards.length === 0) storyboard.remove()

	if (storyboard && videoDetails?.storyboards && videoDetails.storyboards.length > 0)
		storyboard.style.setProperty('--url', `url(${videoDetails.storyboards.at(0).templateUrl})`)

	if (videoDetails.title !== videoTitle.textContent) videoTitle.textContent = videoDetails.title
	topBarTitle.textContent = videoDetails.title

	removeSkeleton(titleSkeleton)

	if (videoDetails.thumbnails) videoPoster.src = videoDetails.thumbnails.at(-1).url

	if (videoViews.textContent === '...')
		videoViews.textContent = normalizeCount(videoDetails.viewCount)

	if (videoDate.textContent === '...')
		videoDate.textContent = formatDate(videoDetails.publishDate)

	if (videoDate.textContent === 'Premiere') {
		const { reason: datePremiere } = data.player_response.playabilityStatus
		videoDate.textContent = datePremiere
		controls.hidden = true
	}

	videoDislikes.textContent = normalizeCount(videoDetails.dislikes)
	videoLikes.textContent = normalizeCount(videoDetails.likes)

	if (partSkeletonAll.length > 0) {
		for (let index = 0, { length } = partSkeletonAll; index < length; index += 1) {
			const partSkeleton = partSkeletonAll[index]
			removeSkeleton(partSkeleton)
		}
	}

	topBarAuthor.textContent = videoDetails.author.name

	let authorParams = {
		parent: authorCard,
		name: videoDetails.author.name,
		subs: `${roundNum(videoDetails.author.subscriber_count)} subscribers`,
		id: videoDetails.author.id,
		avatarSrc: videoDetails.author.thumbnails ? videoDetails.author.thumbnails.at(-1).url : '',
	}

	fillAuthorCard(authorParams)

	authorParams = null

	spoilerContent.innerHTML = normalizeVideoDescription(videoDetails.description)

	saveVideoInHistory(data)

	subscribeBtn = null
	videoInfo = null
	videoViews = null
	videoDate = null
	controls = null
	spoilerContent = null
	videoLikes = null
	topBarTitle = null
	topBarAuthor = null
	videoDislikes = null
	storyboard = null
	partSkeletonAll = null
	titleSkeleton = null
	authorCard = null
	videoTitle = null
	videoPoster = null
	video = null
}

export const resetWinVideo = () => {
	let video = getSelector('.video')
	let videoPoster = video.querySelector('.video__poster img')
	let skeletonAll = video.querySelectorAll('.skeleton')
	let videoInfo = video.querySelector('.video-info')
	let videoTitle = videoInfo.querySelector('.video-info__title span')
	let videoLikes = videoInfo.querySelector('.video-info__likes')
	let videoDislikes = videoInfo.querySelector('.video-info__dislikes')
	let spoilerContent = videoInfo.querySelector('.spoiler__content')
	let videoViews = videoInfo.querySelector('.video-info__views')
	let videoDate = videoInfo.querySelector('.video-info__date')

	video.dataset.id = ''

	let subscribeBtn = videoInfo.querySelector('.subscribe')
	destroySubscribeBtn(subscribeBtn)
	spoilerContent.removeEventListener('click', handleClickContent)

	if (video.classList.contains('_live')) video.classList.remove('_live')

	videoPoster.removeAttribute('src')
	videoPoster.closest('.video__poster').classList.remove('_hidden')
	videoTitle.textContent = '...'
	videoLikes.textContent = '...'
	videoDislikes.textContent = '...'
	videoViews.textContent = '...'
	videoDate.textContent = '...'
	spoilerContent.textContent = '...'

	if (skeletonAll.length > 0) {
		for (let index = 0, { length } = skeletonAll; index < length; index += 1) {
			const skeleton = skeletonAll[index]
			resetSkeleton(skeleton)
		}
	}

	let spoiler = videoInfo.querySelector('.spoiler')
	destroySpoiler(spoiler)

	video = null
	videoPoster = null
	videoLikes = null
	videoInfo = null
	skeletonAll = null
	videoDislikes = null
	spoiler = null
	spoilerContent = null
	videoViews = null
	videoTitle = null
	videoDate = null
	subscribeBtn = null
}

const fillSomeInfoVideo = ({ title = '', views = '', date = '', author = '', authorId = '' }) => {
	let video = getSelector('.video')
	let videoInfo = video.querySelector('.video-info')
	let videoTitle = videoInfo.querySelector('.video-info__title span')
	let videoViews = videoInfo.querySelector('.video-info__views')
	let videoDate = videoInfo.querySelector('.video-info__date')
	let authorCard = videoInfo.querySelector('.author')
	let subscribeBtn = videoInfo.querySelector('.subscribe')
	let titleSkeleton = videoInfo.querySelector('.title-skeleton')
	let partSkeletonAll = videoInfo.querySelectorAll('.part-skeleton')

	if (!isEmpty(title) && title !== '...') {
		videoTitle.textContent = title
		removeSkeleton(titleSkeleton)
	}
	if (!isEmpty(views) && views !== '...') {
		videoViews.textContent = views
		removeSkeleton(partSkeletonAll[0])
	}
	if (!isEmpty(date) && date !== '...') {
		videoDate.textContent = date
		removeSkeleton(partSkeletonAll[1])
	}

	resetAuthorCard(authorCard)

	let authorParams = {
		parent: authorCard,
		name: author,
		id: authorId,
	}

	fillAuthorCard(authorParams)

	prepareSubscribeBtn(subscribeBtn, authorId, author)

	video = null
	videoInfo = null
	videoTitle = null
	videoViews = null
	videoDate = null
	subscribeBtn = null
	titleSkeleton = null
	partSkeletonAll = null
	authorParams = null
	authorCard = null
}

export const prepareWinVideo = async (btnWin, id) => {
	let params = {}

	if (btnWin) {
		params = {
			title: btnWin.querySelector('.card__title span').textContent,
			views: btnWin.querySelector('.card__views').textContent,
			date: btnWin.querySelector('.card__date').textContent,
			author: btnWin.querySelector('.card__channel').dataset.name,
			authorId: btnWin.querySelector('.card__channel').dataset.id,
		}
	}

	fillSomeInfoVideo(params)

	if (!API.isYTVideoURL(`https://www.youtube.com/watch?v=${id}`)) return

	let data = null

	try {
		data = await getVideoData(id)
	} catch ({ message }) {
		showToast('error', message)
		return
	}

	let videoParent = getSelector('.video')

	if (videoParent.classList.contains('_active')) {
		openWinVideo(data)

		initVideoPlayer(data)
	}

	videoParent = null
}
