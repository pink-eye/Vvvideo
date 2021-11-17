const openWinChannel = async id => {
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

	channel.dataset.id = id

	try {
		const data = await API.scrapeChannelInfo(id)

		if (data.author !== channelAuthor.textContent) channelAuthor.textContent = data.author

		removeSkeleton(titleSkeleton)

		prepareSubscribeBtn(subscribeBtn, id, data.author)

		if (data.authorThumbnails) {
			channelAvatar.src = data.authorThumbnails.at(-1).url

			const onLoadAvatar = _ => {
				removeSkeleton(avatarSkeleton)

				channelAvatar = null
				avatarSkeleton = null
			}

			channelAvatar.addEventListener('load', onLoadAvatar, { once: true })
		}

		if (data.authorBanners) {
			channelBannerImg.src = data.authorBanners.at(-1).url

			const onLoadBanner = _ => {
				removeSkeleton(bannerSkeleton)

				channelBannerImg = null
				bannerSkeleton = null
			}

			channelBannerImg.addEventListener('load', onLoadBanner, { once: true })
		} else if (data.authorThumbnails) {
			channelBanner.style.setProperty('--bg-image', `url(${data.authorThumbnails.at(-1).url})`)
			removeSkeleton(bannerSkeleton)

			channelBannerImg = null
			bannerSkeleton = null
		} else {
			channelBanner.style.setProperty('--bg-image', '#fff')
			removeSkeleton(bannerSkeleton)

			channelBannerImg = null
			bannerSkeleton = null
		}

		channelFollowers.textContent = `${normalizeCount(data.subscriberCount)} subscribers`
		removeSkeleton(followersSkeleton)

		if (data.description) channelDescription.innerHTML = `${normalizeDesc(data.description)}`

		hideLastTab()
		initTabs(0)
	} catch (error) {
		showToast('error', error.message)
		resetIndicator()
	} finally {
		channel = null
		channelBanner = null
		channelFollowers = null
		channelDescription = null
		subscribeBtn = null
		channelAuthor = null
		titleSkeleton = null
		followersSkeleton = null
	}
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

const prepareChannelWin = (btnWin, id) => {
	const params = btnWin.dataset || {}

	fillSomeInfoChannel(params)

	openWinChannel(id)
}
