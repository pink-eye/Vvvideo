import { removeSkeleton } from 'Components/skeleton'
import { handleErrorImage } from 'Global/utils'


export const fillPlaylistCard = (playlist, index, data) => {
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

	const onLoadImage = () => {
		removeSkeleton(imageSkeleton)

		playlistImage = null
		imageSkeleton = null
	}

	playlistImage.addEventListener('load', onLoadImage, { once: true })
	playlistImage.addEventListener('error', handleErrorImage, { once: true })

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

export const resetPlaylistCard = card => {
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
