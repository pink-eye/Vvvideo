import cs from 'Global/CacheSelectors'
import { isEmpty, handleClickLink, handleErrorImage } from 'Global/utils'
import showToast from 'Components/toast'
import { removeSkeleton, resetSkeleton } from 'Components/skeleton'
import { resetGrid } from 'Components/grid'
import SubscribeBtn from 'Components/subscribe'
import tabs from 'Components/tabs'
import { normalizeAbout } from 'Layouts/win-channel/helper'

const WinChannel = () => {
	const channel = cs.get('.channel')
	let subscribeBtn = null

	const fetchData = id => API.scrapeChannelInfo(id)

	const fill = data => {
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

		const { author, authorId, authorThumbnails, authorBanners, subscriberText, description } =
			data

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
			channelAvatar.addEventListener('error', handleErrorImage, { once: true })
		}

		if (authorBanners) {
			channelBannerImg.src = authorBanners.at(-1).url

			const onLoadBanner = () => {
				removeSkeleton(bannerSkeleton)

				channelBannerImg = null
				bannerSkeleton = null
			}

			channelBannerImg.addEventListener('load', onLoadBanner, { once: true })
			channelBannerImg.addEventListener('error', handleErrorImage, { once: true })
		} else {
			if (authorThumbnails) {
				channelBanner.style.setProperty('--bg-image', `url(${authorThumbnails.at(-1).url})`)
			} else {
				channelBanner.style.setProperty('--bg-image', '#fff')
			}

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

		channelBanner = null
		channelFollowers = null
		channelDescription = null
		subscribe = null
		channelAuthor = null
		titleSkeleton = null
		followersSkeleton = null
	}

	const fillPart = ({ name = '', id = '' }) => {
		let channelName = channel.querySelector('.heading-channel__author span')
		let subscribe = channel.querySelector('.subscribe')
		let titleSkeleton = channel.querySelector('.title-skeleton')

		if (!isEmpty(name)) {
			channelName.textContent = name
			removeSkeleton(titleSkeleton)
		}

		subscribeBtn = new SubscribeBtn({ element: subscribe, channelId: id, name })

		channelName = null
		subscribe = null
		titleSkeleton = null
	}

	const init = ({ btnWin, id }) => {
		const params = btnWin.dataset || {}

		fillPart(params)

		fetchData(id)
			.then(data => {
				if (!channel.classList.contains('_active')) return

				fill(data)
			})
			.catch(({ message }) => showToast('error', message))
	}

	const reset = () => {
		let channelBanner = channel.querySelector('.channel__banner')
		let channelBannerImg = channel.querySelector('.channel__banner img')
		let tabPanelVideos = channel.querySelector('.videos')
		let channelAuthor = channel.querySelector('.heading-channel__author span')
		let channelFollowers = channel.querySelector('.heading-channel__followers span')
		let tabPanelPlaylists = channel.querySelector('.playlists')
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

		resetGrid(tabPanelVideos)
		resetGrid(tabPanelPlaylists)

		tabs.reset()

		channelDescription.textContent = null

		channelDescription.removeEventListener('click', handleClickLink)

		channelBannerImg = null
		channelFollowers = null
		channelDescription = null
		skeletonAll = null
		channelAuthor = null
		channelBanner = null
		tabPanelVideos = null
		tabPanelPlaylists = null
	}

	return { init, reset }
}

const winChannel = WinChannel()

export default winChannel
