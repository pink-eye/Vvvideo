const getChannelInfoLocalScraper = channelId => new Promise(async resolve => {
	try {
		resolve(await API.scrapeChannelInfo(channelId))
	} catch (error) {
		showToast('error', error.message)
	}
})

const openWinChannel = async id => {
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

	// SUBSCRIBE BTN

	const channelSubscribeBtn = channel.querySelector('.subscribe');
	const channelSubscribeText = channel.querySelector('.subscribe__text');

	const handleClickChannelSubscribeBtn = _ => handleClickSubscribeBtn(channelSubscribeBtn, channelSubscribeText)

	channelSubscribeBtn.addEventListener('click', handleClickChannelSubscribeBtn);

	// FILL WIN

	channel.dataset.id = id

	try {
		const data = await getChannelInfoLocalScraper(id)

		if (data.author !== channelAuthor.textContent)
			channelAuthor.textContent = data.author

		if (data.authorThumbnails) {
			channelAvatar.src = data.authorThumbnails.at(-1).url

			const onLoadAvatar = _ => {
				removeSkeleton(avatarSkeleton)

				channelAvatar = null
			}

			channelAvatar.addEventListener('load', onLoadAvatar, { once: true });
		}

		if (data.authorBanners) {
			channelBannerImg.src = data.authorBanners.at(-1).url

			const onLoadBanner = _ => {
				removeSkeleton(bannerSkeleton)

				channelBannerImg = null
			}

			channelBannerImg.addEventListener('load', onLoadBanner, { once: true });

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
