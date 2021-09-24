const getChannelInfoLocalScraper = channelId => new Promise(async resolve => {
	try {
		const data = await API.scrapeChannelInfo(channelId)
		resolve(data)
	} catch (error) { showToast('error', error.message) }
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
				avatarSkeleton.classList.add('_removing');

				setTimeout(_ => {
					avatarSkeleton.hidden = true
					channelAvatar = null
					avatarSkeleton = null
				}, getDurationTimeout())
			}
		}

		if (data.authorBanners) {
			channelBannerImg.src = data.authorBanners.at(-1).url
			channelBannerImg.onload = _ => {
				bannerSkeleton.classList.add('_removing');

				setTimeout(_ => {
					bannerSkeleton.hidden = true
					channelBannerImg = null
					bannerSkeleton = null
				}, getDurationTimeout())
			}
		} else if (data.authorThumbnails) {
			channelBanner.style.setProperty('--bg-image', `url(${data.authorThumbnails.at(-1).url})`)
			bannerSkeleton.classList.add('_removing');
		} else {
			channelBanner.style.setProperty('--bg-image', '#fff')
			bannerSkeleton.classList.add('_removing');
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
		avatarSkeleton.classList.remove('_removing');
		avatarSkeleton.hidden = false
		bannerSkeleton.classList.remove('_removing');
		bannerSkeleton.hidden = false
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
