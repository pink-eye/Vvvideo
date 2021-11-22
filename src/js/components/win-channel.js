const getChannelData = id => API.scrapeChannelInfo(id)

const openWinChannel = data => {
	let channel = _io_q('.channel')
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
	let subscribeBtn = channel.querySelector('.subscribe')

	// FILL WIN

	const { author, authorId, authorThumbnails, authorBanners, subscriberText, description } = data

	channel.dataset.id = authorId

	if (author !== channelAuthor.textContent) channelAuthor.textContent = author

	removeSkeleton(titleSkeleton)

	prepareSubscribeBtn(subscribeBtn, authorId, author)

	if (authorThumbnails) {
		channelAvatar.src = authorThumbnails.at(-1).url

		const onLoadAvatar = _ => {
			removeSkeleton(avatarSkeleton)

			channelAvatar = null
			avatarSkeleton = null
		}

		channelAvatar.addEventListener('load', onLoadAvatar, { once: true })
	}

	if (authorBanners) {
		channelBannerImg.src = authorBanners.at(-1).url

		const onLoadBanner = _ => {
			removeSkeleton(bannerSkeleton)

			channelBannerImg = null
			bannerSkeleton = null
		}

		channelBannerImg.addEventListener('load', onLoadBanner, { once: true })
	} else if (authorThumbnails) {
		channelBanner.style.setProperty('--bg-image', `url(${authorThumbnails.at(-1).url})`)
		removeSkeleton(bannerSkeleton)

		channelBannerImg = null
		bannerSkeleton = null
	} else {
		channelBanner.style.setProperty('--bg-image', '#fff')
		removeSkeleton(bannerSkeleton)

		channelBannerImg = null
		bannerSkeleton = null
	}

	channelFollowers.textContent = subscriberText
	removeSkeleton(followersSkeleton)

	if (description) channelDescription.innerHTML = `${normalizeDesc(description)}`

	hideLastTab()
	initTabs(0)

	channel = null
	channelBanner = null
	channelFollowers = null
	channelDescription = null
	subscribeBtn = null
	channelAuthor = null
	titleSkeleton = null
	followersSkeleton = null
}

const resetChannel = _ => {
	let channel = _io_q('.channel')
	let channelBanner = channel.querySelector('.channel__banner')
	let channelBannerImg = channel.querySelector('.channel__banner img')
	let channelTabContentVideos = channel.querySelector('.videos')
	let channelAuthor = channel.querySelector('.heading-channel__author span')
	let channelFollowers = channel.querySelector('.heading-channel__followers span')
	let channelTabContentPlaylists = channel.querySelector('.playlists')
	let skeletonAll = channel.querySelectorAll('.skeleton')
	let channelDescription = channel.querySelector('.about__description')

	channel.dataset.id = ''

	// SUBSCRIBE BTN
	let subscribeBtn = channel.querySelector('.subscribe')
	destroySubscribeBtn(subscribeBtn)

	channelBanner.style.setProperty('--bg-image', 'none center')
	channelBannerImg.removeAttribute('src')
	channelFollowers.textContent = '...'
	channelAuthor.textContent = '...'

	if (skeletonAll.length > 0) {
		for (let index = 0, { length } = skeletonAll; index < length; index += 1) {
			const skeleton = skeletonAll[index]
			resetSkeleton(skeleton)
		}
	}

	resetGrid(channelTabContentVideos)
	resetGrid(channelTabContentPlaylists)

	destroyTabs()

	channelDescription.textContent = null

	channel = null
	subscribeBtn = null
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
	let channel = _io_q('.channel')
	let channelName = channel.querySelector('.heading-channel__author span')
	let subscribeBtn = channel.querySelector('.subscribe')
	let titleSkeleton = channel.querySelector('.title-skeleton')

	if (!isEmpty(name)) {
		channelName.textContent = name
		removeSkeleton(titleSkeleton)
	}

	prepareSubscribeBtn(subscribeBtn, id, name)

	channel = null
	channelName = null
	subscribeBtn = null
	titleSkeleton = null
}

const prepareWinChannel = async (btnWin, id) => {
	const params = btnWin.dataset || {}

	fillSomeInfoChannel(params)

	let data = null

	try {
		data = await getChannelData(id)
	} catch ({ message }) {
		showToast('error', message)
		return
	}

	openWinChannel(data)
}

export { prepareWinChannel }
