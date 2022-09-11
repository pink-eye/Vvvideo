import { removeSkeleton } from 'Components/skeleton'
import { handleErrorImage } from 'Components/card/helper'

export const fillChannelCard = (channel, index, data) => {
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

	const onLoadImage = () => {
		removeSkeleton(imageSkeleton)

		channelImage = null
		imageSkeleton = null
	}

	channelImage.addEventListener('load', onLoadImage, { once: true })
	channelImage.addEventListener('error', handleErrorImage, { once: true })

	channelTitle.textContent = info.name
	removeSkeleton(titleSkeleton)

	channelDescr.textContent = info.descriptionShort
	channelSubs.textContent = `${info.subscribers} • `
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

export const resetChannelCard = card => {
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
