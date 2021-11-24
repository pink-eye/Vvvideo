import { getSelector, normalizeCount, normalizeDesc, formatDate, isEmpty, getProxyOptions } from '../global'
import { fillAuthorCard, resetAuthorCard } from './author-card'
import { saveVideoInHistory, scrapeVideoInfoFromData } from './win-history'
import { initSpoiler, destroySpoiler } from './spoiler'
import { showToast } from './toast'
import { resetSkeleton, removeSkeleton } from './skeleton'
import { prepareSubscribeBtn, destroySubscribeBtn } from './win-subscriptions'
import { AppStorage } from './app-storage'
import { initVideoPlayer } from './video-player'

const appStorage = new AppStorage()
const storage = appStorage.getStorage()

const getVideoData = id =>
	storage.settings.enableProxy ? API.scrapeVideoProxy(id, getProxyOptions()) : API.scrapeVideo(id)

const openWinVideo = data => {
	let video = getSelector('.video')
	let videoPoster = video.querySelector('.video__poster img')
	let topBarTitle = video.querySelector('.top-bar__title')
	let topBarAuthor = video.querySelector('.top-bar__author')
	let controls = getSelector('.controls')
	let progressStoryboard = controls.querySelector('.progress__storyboard')
	let videoInfo = video.querySelector('.video-info')
	let videoTitle = videoInfo.querySelector('.video-info__title span')
	let videoViews = videoInfo.querySelector('.video-info__views')
	let videoDate = videoInfo.querySelector('.video-info__date')
	let videoDesc = videoInfo.querySelector('.desc-video-info__text')
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

	if (video.classList.contains('_active')) {
		video.dataset.id = videoDetails.videoId

		prepareSubscribeBtn(subscribeBtn, videoDetails.author.id, videoDetails.author.name)

		// FILL VIDEO INFO

		if (settings.disableStoryboard || videoDetails.storyboards.length === 0) progressStoryboard.remove()

		if (progressStoryboard && videoDetails?.storyboards && videoDetails.storyboards.length > 0)
			progressStoryboard.style.setProperty('--url', `url(${videoDetails.storyboards.at(0).templateUrl})`)

		if (videoDetails.title !== videoTitle.textContent) videoTitle.textContent = videoDetails.title
		topBarTitle.textContent = videoDetails.title

		removeSkeleton(titleSkeleton)

		if (videoDetails.thumbnails) videoPoster.src = videoDetails.thumbnails.at(-1).url

		if (videoViews.textContent === '...') videoViews.textContent = normalizeCount(videoDetails.viewCount)

		if (videoDate.textContent === '...') videoDate.textContent = formatDate(videoDetails.publishDate)

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
			subs: `${normalizeCount(videoDetails.author.subscriber_count)} subscribers`,
			id: videoDetails.author.id,
			avatarSrc: videoDetails.author.thumbnails ? videoDetails.author.thumbnails.at(-1).url : '',
		}

		fillAuthorCard(authorParams)

		authorParams = null

		videoDesc.innerHTML = normalizeDesc(videoDetails.description)

		saveVideoInHistory(scrapeVideoInfoFromData, data)
	}

	subscribeBtn = null
	videoInfo = null
	videoViews = null
	videoDate = null
	controls = null
	videoDesc = null
	videoLikes = null
	topBarTitle = null
	topBarAuthor = null
	videoDislikes = null
	progressStoryboard = null
	partSkeletonAll = null
	titleSkeleton = null
	authorCard = null
}

export const resetWinVideo = _ => {
	let video = getSelector('.video')
	let videoPoster = video.querySelector('.video__poster img')
	let skeletonAll = video.querySelectorAll('.skeleton')
	let videoInfo = video.querySelector('.video-info')
	let videoTitle = videoInfo.querySelector('.video-info__title span')
	let videoLikes = videoInfo.querySelector('.video-info__likes')
	let videoDislikes = videoInfo.querySelector('.video-info__dislikes')
	let videoDesc = videoInfo.querySelector('.desc-video-info__text')
	let videoViews = videoInfo.querySelector('.video-info__views')
	let videoDate = videoInfo.querySelector('.video-info__date')

	video.dataset.id = ''

	let subscribeBtn = videoInfo.querySelector('.subscribe')
	destroySubscribeBtn(subscribeBtn)

	if (video.classList.contains('_live')) video.classList.remove('_live')

	videoPoster.removeAttribute('src')
	videoPoster.closest('.video__poster').classList.remove('_hidden')
	videoTitle.textContent = '...'
	videoLikes.textContent = '...'
	videoDislikes.textContent = '...'
	videoViews.textContent = '...'
	videoDate.textContent = '...'
	videoDesc.textContent = '...'

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
	skeletonAll = null
	videoDislikes = null
	videoDesc = null
	videoViews = null
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

	openWinVideo(data)

	initVideoPlayer(data)
}
