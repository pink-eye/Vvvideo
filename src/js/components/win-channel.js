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

	// SUBSCRIBE BTN

	const channelSubscribeBtn = channel.querySelector('.subscribe');

	channelSubscribeBtn.addEventListener('click', handleClickSubscribeBtn);

	// FILL WIN

	channel.dataset.id = id

	try {
		const data = await getChannelInfoLocalScraper(id)

		if (data.author !== channelAuthor.textContent)
			channelAuthor.textContent = data.author

		channelSubscribeBtn.dataset.name = data.author
		channelSubscribeBtn.dataset.channelId = id

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

		hideLastTab();
		initTabs(0);

	} catch (error) {
		showToast('error', error.message)
		resetIndicator()
	} finally {
		channel = null
		channelBanner = null
		channelFollowers = null
		channelDescription = null
	}
}

const resetChannel = _ => {
	let channel = _io_q('.channel');
	let channelBanner = channel.querySelector('.channel__banner');
	let channelBannerImg = channel.querySelector('.channel__banner img');
	let channelTabContentVideos = channel.querySelector('.videos');
	let channelFollowers = channel.querySelector('.heading-channel__followers');
	let channelTabContentPlaylists = channel.querySelector('.playlists');
	let bannerSkeleton = channel.querySelector('.banner-skeleton');
	let avatarSkeleton = channel.querySelector('.avatar-skeleton');
	let channelDescription = channel.querySelector('.about__description');

	channel.dataset.id = ''

	// SUBSCRIBE BTN

	let channelSubscribeBtn = channel.querySelector('.subscribe');

	channelSubscribeBtn.removeEventListener('click', handleClickSubscribeBtn);

	channelBanner.style.setProperty('--bg-image', 'none center')
	channelBannerImg.removeAttribute('src')
	channelSubscribeBtn.removeAttribute('data-channel-id')
	channelSubscribeBtn.removeAttribute('data-name')
	channelFollowers.textContent = '... subscribers'

	if (avatarSkeleton.classList.contains('_removing')) {
		resetSkeleton(avatarSkeleton)
		resetSkeleton(bannerSkeleton)
	}

	resetGrid(channelTabContentVideos)
	resetGrid(channelTabContentPlaylists)

	destroyTabs()

	channelDescription.textContent = null

	channel = null;
	channelSubscribeBtn = null
	channelBannerImg = null;
	channelFollowers = null
	channelBanner = null;
	channelTabContentVideos = null
	channelTabContentPlaylists = null
	bannerSkeleton = null;
	avatarSkeleton = null;
}

const fillSomeInfoChannel = (title, authorId) => {
	let channel = _io_q('.channel');
	let channelTitle = channel.querySelector('.heading-channel__author');
	let channelSubscribeBtn = channel.querySelector('.subscribe');
	let channelSubscribeText = channel.querySelector('.subscribe__text');

	channelTitle.textContent = title
	channelSubscribeBtn.dataset.channelId = authorId
	channelSubscribeBtn.dataset.name = title

	if (hasSubscription(authorId)) {
		channelSubscribeBtn.classList.add('_subscribed')
		channelSubscribeText.textContent = 'Unsubscribe'
	} else {
		channelSubscribeBtn.classList.remove('_subscribed')
		channelSubscribeText.textContent = 'Subscribe'
	}

	channel = null
	channelTitle = null
	channelSubscribeBtn = null
	channelSubscribeText = null
}

const prepareChannelWin = (btnWin, id) => {
	if (btnWin !== null) {
		let channelTitle = btnWin.classList.contains('card')
			? btnWin.querySelector('.card__title span')
			: btnWin.querySelector('.author__name')

		let channelId = btnWin.classList.contains('card') && !btnWin.classList.contains('_channel')
			? btnWin.querySelector('.card__channel').dataset.id
			: btnWin.dataset.id

		fillSomeInfoChannel(channelTitle.textContent, channelId)

		channelTitle = null
	} else fillSomeInfoChannel('-', '')

	openWinChannel(id)
}

