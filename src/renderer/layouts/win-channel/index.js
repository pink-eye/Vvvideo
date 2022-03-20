import cs from 'Global/CacheSelectors'
import { isEmpty, handleClickLink } from 'Global/utils'
import showToast from 'Components/toast'
import { removeSkeleton, resetSkeleton } from 'Components/skeleton'
import { resetGrid } from 'Components/grid'
import SubscribeBtn from 'Components/subscribe'
import tabs from 'Components/tabs'
import { normalizeAbout } from 'Layouts/win-channel/helper'

const getChannelData = id => API.scrapeChannelInfo(id)

let subscribeBtn = null

const openWinChannel = data => {
	let channel = cs.get('.channel')
	let channelBannerImg = channel.querySelector('.channel__banner img')
	let channelBanner = channel.querySelector('.channel__banner')
	let channelAvatar = channel.querySelector('.heading-channel__avatar img')
	let channelAuthor = channel.querySelector('.heading-channel__author span')
	let channelFollowers = channel.querySelector('.heading-channel__followers span')
	let channelDescription = channel.querySelector('.about__description')
	let bannerSkeleton = channel.querySelector('.banner-skeleton')
	let avatarSkeleton = channel.querySelector('.avatar-skeleton')
	let titleSkeleton = channel.querySelector('.title-skeleton')
	let followersSkeleton = channel.querySelector('.followers-skeleton')
	let subscribe = channel.querySelector('.subscribe')

	// FILL WIN

	const { author, authorId, authorThumbnails, authorBanners, subscriberText, description } = data

	channel.dataset.id = authorId

	if (author !== channelAuthor.textContent) channelAuthor.textContent = author

	removeSkeleton(titleSkeleton)

	subscribeBtn ||= new SubscribeBtn({ element: subscribe, channelId: authorId, name: author })

	if (authorThumbnails) {
		channelAvatar.src = authorThumbnails.at(-1).url

		const onLoadAvatar = () => {
			removeSkeleton(avatarSkeleton)

			channelAvatar = null
			avatarSkeleton = null
		}

		channelAvatar.addEventListener('load', onLoadAvatar, { once: true })
	}

	if (authorBanners) {
		channelBannerImg.src = authorBanners.at(-1).url

		const onLoadBanner = () => {
			removeSkeleton(bannerSkeleton)

			channelBannerImg = null
			bannerSkeleton = null
		}

		channelBannerImg.addEventListener('load', onLoadBanner, { once: true })
	} else {
		authorThumbnails
			? channelBanner.style.setProperty('--bg-image', `url(${authorThumbnails.at(-1).url})`)
			: channelBanner.style.setProperty('--bg-image', '#fff')

		removeSkeleton(bannerSkeleton)

		channelBannerImg = null
		bannerSkeleton = null
	}

	channelFollowers.textContent = subscriberText
	removeSkeleton(followersSkeleton)

	channelDescription.innerHTML = !isEmpty(description)
		? `${normalizeAbout(description)}`
		: 'No information...'

	channelDescription.addEventListener('click', handleClickLink)

	tabs.init()

	channel = null
	channelBanner = null
	channelFollowers = null
	channelDescription = null
	subscribe = null
	channelAuthor = null
	titleSkeleton = null
	followersSkeleton = null
}

export const resetWinChannel = () => {
	let channel = cs.get('.channel')
	let channelBanner = channel.querySelector('.channel__banner')
	let channelBannerImg = channel.querySelector('.channel__banner img')
	let channelTabContentVideos = channel.querySelector('.videos')
	let channelAuthor = channel.querySelector('.heading-channel__author span')
	let channelFollowers = channel.querySelector('.heading-channel__followers span')
	let channelTabContentPlaylists = channel.querySelector('.playlists')
	let skeletonAll = channel.querySelectorAll('.skeleton')
	let channelDescription = channel.querySelector('.about__description')

	channel.dataset.id = ''

	subscribeBtn.reset()

	channelBanner.style.setProperty('--bg-image', 'none center')
	channelBannerImg.removeAttribute('src')
	channelFollowers.textContent = 'subscribers'
	channelAuthor.textContent = '...'

	if (skeletonAll.length > 0) {
		for (let index = 0, { length } = skeletonAll; index < length; index += 1) {
			let skeleton = skeletonAll[index]

			resetSkeleton(skeleton)

			skeleton = null
		}
	}

	resetGrid(channelTabContentVideos)
	resetGrid(channelTabContentPlaylists)

	tabs.reset()

	channelDescription.textContent = null

	channelDescription.removeEventListener('click', handleClickLink)

	channel = null
	channelBannerImg = null
	channelFollowers = null
	channelDescription = null
	skeletonAll = null
	channelAuthor = null
	channelBanner = null
	channelTabContentVideos = null
	channelTabContentPlaylists = null
}

const fillSomeInfoChannel = ({ name = '', id = '' }) => {
	let channel = cs.get('.channel')
	let channelName = channel.querySelector('.heading-channel__author span')
	let subscribe = channel.querySelector('.subscribe')
	let titleSkeleton = channel.querySelector('.title-skeleton')

	if (!isEmpty(name)) {
		channelName.textContent = name
		removeSkeleton(titleSkeleton)
	}

	subscribeBtn = new SubscribeBtn({ element: subscribe, channelId: id, name })

	channel = null
	channelName = null
	subscribe = null
	titleSkeleton = null
}

export const prepareWinChannel = async (btnWin, id) => {
	const params = btnWin.dataset || {}

	fillSomeInfoChannel(params)

	let data = null

	try {
		data = await getChannelData(id)
	} catch ({ message }) {
		showToast('error', message)
		return
	}

	let channel = cs.get('.channel')

	if (channel.classList.contains('_active')) openWinChannel(data)

	channel = null
}
