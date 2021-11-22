import { resetSkeleton, removeSkeleton } from './skeleton'
import { normalizeCount, convertSecondsToDuration } from '../global'
import { calculateWatchedProgress } from './win-history'

const fillVideoCard = (video, index, data) => {
	let videoCard = video
	let videoImage = videoCard.querySelector('.card__image img')
	let imageSkeleton = videoCard.querySelector('.image-skeleton')
	let titleSkeleton = videoCard.querySelector('.title-skeleton')
	let bottomSkeleton = videoCard.querySelector('.bottom-skeleton')
	let videoTitle = videoCard.querySelector('.card__title span')
	let videoViews = videoCard.querySelector('.card__views')
	let videoDate = videoCard.querySelector('.card__date')
	let videoChannel = videoCard.querySelector('.card__channel')
	let videoDuration = videoCard.querySelector('.card__duration')

	videoCard.disabled &&= false

	const info = data[index]

	videoCard.dataset.id = info?.videoId ?? info.id

	const thumbnail =
		info?.bestThumbnail ??
		info.videoThumbnails.find(el => el.quality === 'maxresdefault') ??
		info.videoThumbnails.at(-1)

	videoImage.src = thumbnail.url

	const onLoadImage = _ => {
		removeSkeleton(imageSkeleton)

		videoImage = null
	}

	const onErrorImage = _ => {
		showToast('error', 'Could not load images :(')
	}

	videoImage.addEventListener('load', onLoadImage, { once: true })
	videoImage.addEventListener('error', onErrorImage, { once: true })

	videoTitle.textContent = info.title

	removeSkeleton(titleSkeleton)

	videoViews.textContent = normalizeCount(info.viewCount) ?? normalizeCount(info.views) ?? '...'

	if (info.liveNow || info.premiere || info.isLive) videoCard.classList.add('_live')

	let date = null

	info?.publishedText && (date = info.publishedText)

	info?.uploadedAt && (date = info.uploadedAt)

	if (info?.liveNow || info?.isLive) date = 'Live'

	if (info?.premiere || info?.viewCountText?.includes('wait')) date = 'Premiere'

	videoDate.textContent = date

	videoChannel.textContent = info.author?.name ?? info.author

	videoChannel.dataset.name = info.author?.name ?? info.author

	videoChannel.dataset.id = info?.authorId ?? info.author.channelID

	videoDuration.textContent =
		info.lengthSeconds?.simpleText ??
		convertSecondsToDuration(info.lengthSeconds) ??
		convertSecondsToDuration(info.duration)

	removeSkeleton(bottomSkeleton)

	const videoId = videoCard.dataset.id

	if (getWatchedtTime(videoId)) {
		let cardImage = videoCard.querySelector('.card__image')
		let watchedProgress = calculateWatchedProgress(videoId)

		cardImage.style.setProperty('--watched-progress', watchedProgress)

		cardImage = null
	}

	videoCard = null
	videoTitle = null
	videoViews = null
	videoDate = null
	videoChannel = null
	videoDuration = null
	titleSkeleton = null
	bottomSkeleton = null
}

const fillPlaylistCard = (playlist, index, data) => {
	let playlistCard = playlist
	let playlistImage = playlistCard.querySelector('.card__image img')
	let imageSkeleton = playlistCard.querySelector('.image-skeleton')
	let titleSkeleton = playlistCard.querySelector('.title-skeleton')
	let bottomSkeleton = playlistCard.querySelector('.bottom-skeleton')
	let playlistTitle = playlistCard.querySelector('.card__title span')
	let playlistChannel = playlistCard.querySelector('.card__channel')
	let playlistCount = playlistCard.querySelector('.card__count')

	playlistCard.disabled &&= false

	const info = data[index]

	playlistCard.dataset.id = info?.playlistID ?? info.playlistId

	let playlistImageSrc = info?.playlistThumbnail ?? info.firstVideo.bestThumbnail.url

	playlistImage.setAttribute('src', playlistImageSrc)

	const onLoadImage = _ => {
		removeSkeleton(imageSkeleton)

		playlistImage = null
	}

	const onErrorImage = _ => {
		showToast('error', 'Could not load images :(')
	}

	playlistImage.addEventListener('load', onLoadImage, { once: true })
	playlistImage.addEventListener('error', onErrorImage, { once: true })

	playlistTitle.textContent = info.title
	removeSkeleton(titleSkeleton)

	playlistCount.textContent = info?.videoCount ?? info.length

	playlistChannel.textContent = info?.author ?? info.owner.name

	playlistChannel.dataset.name = info?.author ?? info.owner.name

	playlistChannel.dataset.id = info?.authorId ?? info.owner.channelID

	removeSkeleton(bottomSkeleton)

	playlistCard = null
	playlistTitle = null
	playlistChannel = null
	playlistCount = null
	titleSkeleton = null
	bottomSkeleton = null
}

const fillChannelCard = (channel, index, data) => {
	let channelCard = channel
	let channelImage = channelCard.querySelector('.card__image img')
	let imageSkeleton = channelCard.querySelector('.image-skeleton')
	let titleSkeleton = channelCard.querySelector('.title-skeleton')
	let bottomSkeleton = channelCard.querySelector('.bottom-skeleton')
	let channelTitle = channelCard.querySelector('.card__title span')
	let channelDescr = channelCard.querySelector('.card__channel-descr')
	let channelSubs = channelCard.querySelector('.card__subs')
	let channelVideoCount = channelCard.querySelector('.card__video-count')

	channelCard.disabled &&= false

	const info = data[index]

	channelCard.dataset.id = info.channelID
	channelCard.dataset.name = info.name

	channelImage.setAttribute('src', info.bestAvatar.url)

	const onLoadImage = _ => {
		removeSkeleton(imageSkeleton)

		channelImage = null
	}

	const onErrorImage = _ => {
		showToast('error', 'Could not load images :(')
	}

	channelImage.addEventListener('load', onLoadImage, { once: true })
	channelImage.addEventListener('error', onErrorImage, { once: true })

	channelTitle.textContent = info.name
	removeSkeleton(titleSkeleton)

	channelDescr.textContent = info.descriptionShort
	channelSubs.textContent = info.subscribers
	channelVideoCount.textContent = `${info.videos} video`

	removeSkeleton(bottomSkeleton)

	channelCard = null
	channelTitle = null
	channelDescr = null
	channelSubs = null
	channelVideoCount = null
	titleSkeleton = null
	bottomSkeleton = null
}

const resetCard = card => {
	let givenCard = card
	let skeletonAll = givenCard.querySelectorAll('.skeleton')
	let cardTitle = givenCard.querySelector('.card__title span')
	let cardImg = givenCard.querySelector('.card__image img')

	if (skeletonAll.length > 0) {
		for (let index = 0, { length } = skeletonAll; index < length; index += 1) {
			const skeleton = skeletonAll[index]
			resetSkeleton(skeleton)
		}
	}

	givenCard.removeAttribute('data-id')
	cardTitle.textContent = '...'
	cardImg.removeAttribute('src')

	switch (givenCard.dataset.win) {
		case 'video':
			resetVideoCard(givenCard)
			break

		case 'channel':
			resetChannelCard(givenCard)
			break

		case 'playlist':
			resetPlaylistCard(givenCard)
			break
	}

	givenCard.disabled ||= true
	givenCard.hidden &&= false

	let recentWin = givenCard.closest('.win')

	if (recentWin && recentWin.classList.contains('search-results')) {
		const typeArray = ['_video', '_playlist', '_channel']

		typeArray.forEach(type => {
			if (givenCard.classList.contains(type)) {
				givenCard.classList.remove(type)
				return
			}
		})
	}

	givenCard = null
	skeletonAll = null
	recentWin = null
	cardTitle = null
	cardImg = null
}

const resetVideoCard = card => {
	let videoCard = card
	let videoViews = videoCard.querySelector('.card__views')
	let videoDate = videoCard.querySelector('.card__date')
	let videoChannel = videoCard.querySelector('.card__channel')
	let videoDuration = videoCard.querySelector('.card__duration')
	let videoImg = videoCard.querySelector('.card__image')

	if (videoCard.classList.contains('_live')) videoCard.classList.remove('_live')

	if (videoImg.hasAttribute('style')) videoImg.removeAttribute('style')

	videoViews.textContent = ''
	videoDate.textContent = ''
	videoChannel.textContent = ''
	videoDuration.textContent = ''
	videoChannel.removeAttribute('data-id')
	videoChannel.removeAttribute('data-name')

	videoCard = null
	videoViews = null
	videoDate = null
	videoChannel = null
	videoDuration = null
	videoImg = null
}

const resetChannelCard = card => {
	let channelCard = card
	let channelDescr = channelCard.querySelector('.card__channel-descr')
	let channelSubs = channelCard.querySelector('.card__subs')
	let channelVideoCount = channelCard.querySelector('.card__video-count')

	channelDescr.textContent = ''
	channelSubs.textContent = ''
	channelVideoCount.textContent = ''

	channelCard = null
	channelDescr = null
	channelSubs = null
	channelVideoCount = null
}

const resetPlaylistCard = card => {
	let playlistCard = card
	let playlistChannel = playlistCard.querySelector('.card__channel')
	let playlistCount = playlistCard.querySelector('.card__count')

	playlistChannel.textContent = ''
	playlistCount.textContent = ''
	playlistChannel.removeAttribute('data-id')
	playlistChannel.removeAttribute('data-name')

	playlistCard = null
	playlistChannel = null
	playlistCount = null
}

export {
	fillVideoCard,
	fillPlaylistCard,
	fillChannelCard,
	resetCard,
	resetVideoCard,
	resetChannelCard,
	resetPlaylistCard,
}
