import { normalizeCount, convertSecondsToDuration, handleErrorImage } from 'Global/utils'
import { removeSkeleton } from 'Components/skeleton'
import { calculateWatchedProgress, getWatchedTime } from 'Layouts/win-history/helper'

export const fillVideoCard = (video, index, data) => {
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

	const onLoadImage = () => {
		removeSkeleton(imageSkeleton)

		videoImage = null
		imageSkeleton = null
	}

	videoImage.addEventListener('load', onLoadImage, { once: true })
	videoImage.addEventListener('error', handleErrorImage, { once: true })

	videoTitle.textContent = info.title

	removeSkeleton(titleSkeleton)

	videoViews.textContent =
		normalizeCount(info.viewCount) ?? normalizeCount(info.views) ?? 'Unknown'

	if (info.liveNow || info.premiere || info.isLive) videoCard.classList.add('_live')

	let date = null

	info?.publishedText && (date = info.publishedText)

	info?.uploadedAt && (date = info.uploadedAt)

	if (info?.liveNow || info?.isLive) date = 'LIVE'

	if (info?.premiere || info?.viewCountText?.includes('wait')) date = 'Premiere'

	videoDate.textContent = date ?? 'Unknown'

	videoChannel.textContent = info.author?.name ?? info.author

	videoChannel.dataset.name = info.author?.name ?? info.author

	videoChannel.dataset.id = info?.authorId ?? info.author.channelID

	videoDuration.textContent =
		info.lengthSeconds?.simpleText ??
		convertSecondsToDuration(info.lengthSeconds) ??
		convertSecondsToDuration(info.duration)

	removeSkeleton(bottomSkeleton)

	const videoId = videoCard.dataset.id

	if (getWatchedTime(videoId)) {
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

export const resetVideoCard = card => {
	let videoCard = card
	let videoViews = videoCard.querySelector('.card__views')
	let videoDate = videoCard.querySelector('.card__date')
	let videoChannel = videoCard.querySelector('.card__channel')
	let videoDuration = videoCard.querySelector('.card__duration')
	let videoImg = videoCard.querySelector('.card__image')

	if (videoCard.classList.contains('_live')) videoCard.classList.remove('_live')

	if (videoImg.hasAttribute('style')) videoImg.removeAttribute('style')

	if (videoImg.hasAttribute('data-playlist-id')) videoImg.removeAttribute('data-playlist-id')

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
