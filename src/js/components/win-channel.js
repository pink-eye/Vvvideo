const getChannelInfoLocalScraper = channelId => new Promise(async resolve => {
	try {
		resolve(await API.scrapeChannelInfo(channelId))
	} catch (error) {
		showToast('error', error.message)
	}
})

const getChannel = async id => {
	let channel = _io_q('.channel');
	let channelBannerImg = channel.querySelector('.channel__banner img');
	let channelBanner = channel.querySelector('.channel__banner');
	let channelAvatar = channel.querySelector('.heading-channel__avatar img');
	let channelAuthor = channel.querySelector('.heading-channel__author');
	let channelFollowers = channel.querySelector('.heading-channel__followers');
	let channelDescription = channel.querySelector('.about__description');
	let bannerSkeleton = channel.querySelector('.banner-skeleton');
	let avatarSkeleton = channel.querySelector('.avatar-skeleton');
	let subscribeBtn = channel.querySelector('.subscribe');
	let subscribeText = channel.querySelector('.subscribe__text');

	channel.dataset.id = id

	if (hasSubscription(id)) {
		subscribeBtn.classList.add('_subscribed')
		subscribeText.textContent = 'Unsubscribe'
	} else {
		subscribeBtn.classList.remove('_subscribed')
		subscribeText.textContent = 'Subscribe'
	}

	try {
		const data = await getChannelInfoLocalScraper(id)

		if (data.author !== channelAuthor.textContent)
			channelAuthor.textContent = data.author

		if (data.authorThumbnails) {
			channelAvatar.src = data.authorThumbnails.at(-1).url
			channelAvatar.onload = _ => {
				removeSkeleton(avatarSkeleton)

				channelAvatar = null
			}
		}

		if (data.authorBanners) {
			channelBannerImg.src = data.authorBanners.at(-1).url
			channelBannerImg.onload = _ => {
				removeSkeleton(bannerSkeleton)

				channelBannerImg = null
			}
		} else if (data.authorThumbnails) {
			channelBanner.style.setProperty('--bg-image', `url(${data.authorThumbnails.at(-1).url})`)
			removeSkeleton(bannerSkeleton)
		} else {
			channelBanner.style.setProperty('--bg-image', '#fff')
			removeSkeleton(bannerSkeleton)
		}

		channelFollowers.textContent = `${normalizeCount(data.subscriberCount)} subscribers`

		if (data.description)
			channelDescription.innerHTML = `${normalizeDesc(data.description)}`

		hideLastTab('.body-channel__tab', '.tab-content');
		switchTab('.body-channel__tab', '.tab-content', 0);

	} catch (error) {
		showToast('error', error.message)
		resetIndicator()
	} finally {
		channel = null
		channelBanner = null
		channelFollowers = null
		channelDescription = null
		subscribeBtn = null
		subscribeText = null
	}
}

const resetChannel = async (channelTabContentVideos, channelTabContentPlaylists) => {
	let channel = _io_q('.channel');
	let channelBanner = channel.querySelector('.channel__banner');
	let channelBannerImg = channel.querySelector('.channel__banner img');
	let bannerSkeleton = channel.querySelector('.banner-skeleton');
	let avatarSkeleton = channel.querySelector('.avatar-skeleton');
	let channelDescription = channel.querySelector('.about__description');
	let subscribeBtn = channel.querySelector('.subscribe');

	channelBanner.style.setProperty('--bg-image', 'none center')
	channelBannerImg.removeAttribute('src')
	subscribeBtn.removeAttribute('data-channel-id')
	subscribeBtn.removeAttribute('data-name')

	if (avatarSkeleton.classList.contains('_removing')) {
		resetSkeleton(avatarSkeleton)
		resetSkeleton(bannerSkeleton)
	}

	resetGrid(channelTabContentVideos)
	resetGrid(channelTabContentPlaylists)

	channelDescription.textContent = null

	channel = null;
	channelBannerImg = null;
	channelBanner = null;
	bannerSkeleton = null;
	avatarSkeleton = null;
	subscribeBtn = null;
}
