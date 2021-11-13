const fillVideoCard = (video, index, data) => {
	let videoImage = video.querySelector('.card__image img')
	let imageSkeleton = video.querySelector('.image-skeleton')
	let titleSkeleton = video.querySelector('.title-skeleton')
	let bottomSkeleton = video.querySelector('.bottom-skeleton')
	let videoTitle = video.querySelector('.card__title span')
	let videoViews = video.querySelector('.card__views')
	let videoDate = video.querySelector('.card__date')
	let videoChannel = video.querySelector('.card__channel')
	let videoDuration = video.querySelector('.card__duration')

	video.disabled &&= false;

	const info = data[index]

	video.dataset.id = info?.videoId ?? info.id

	if (info.hasOwnProperty('bestThumbnail'))
		videoImage.setAttribute('src', info.bestThumbnail.url)
	else if (info.videoThumbnails.find(el => el.quality === 'maxresdefault')) {
		let maxResImage = info.videoThumbnails.find(el => el.quality === 'maxresdefault')
		videoImage.setAttribute('src', maxResImage.url)
	} else {
		info.videoThumbnails.sort((a, b) => b.width - a.width)
		videoImage.setAttribute('src', info.videoThumbnails[0].url)
	}

	const onLoadImage = _ => {
		removeSkeleton(imageSkeleton)

		videoImage = null;
	}

	const onErrorImage = _ => {
		showToast('error', 'Could not load images :(')
	}

	videoImage.addEventListener('load', onLoadImage, { once: true });
	videoImage.addEventListener('error', onErrorImage, { once: true });

	videoTitle.textContent = info.title;

	removeSkeleton(titleSkeleton)

	videoViews.textContent = info.hasOwnProperty('viewCount')
		? normalizeCount(info.viewCount)
		: info.hasOwnProperty('views')
			? normalizeCount(info.views)
			: '...'

	if (info.liveNow || info.premiere || info.isLive)
		video.classList.add('_live');

	videoDate.textContent = info.viewCountText
		? info.premiere || info.viewCountText.includes('wait')
			? 'Premiere'
			: info.liveNow
				? 'Live'
				: info.publishedText
		: info.hasOwnProperty('publishedText')
			? info.publishedText
			: info.isLive
				? 'Live'
				: info.hasOwnProperty('uploadedAt')
					? info.uploadedAt
					: '...'

	videoChannel.textContent = info.author?.name ?? info.author

	videoChannel.dataset.name = info.author?.name ?? info.author

	videoChannel.dataset.id = info?.authorId ?? info.author.channelID

	videoDuration.textContent = info.hasOwnProperty('lengthSeconds')
		? info.lengthSeconds?.simpleText ?? convertSecondsToDuration(info.lengthSeconds)
		: convertSecondsToDuration(info.duration)

	removeSkeleton(bottomSkeleton)

	const videoId = video.dataset.id

	if (getWatchedtTime(videoId)) {
		let cardImage = video.querySelector('.card__image');
		let watchedProgress = calculateWatchedProgress(videoId)

		cardImage.style.setProperty('--watched-progress', watchedProgress)

		cardImage = null
	}

	videoTitle = null
	videoViews = null
	videoDate = null
	videoChannel = null
	videoDuration = null
	titleSkeleton = null
	bottomSkeleton = null
}

const fillPlaylistCard = (playlist, index, data) => {
	let playlistImage = playlist.querySelector('.card__image img')
	let imageSkeleton = playlist.querySelector('.image-skeleton')
	let titleSkeleton = playlist.querySelector('.title-skeleton')
	let bottomSkeleton = playlist.querySelector('.bottom-skeleton')
	let playlistTitle = playlist.querySelector('.card__title span')
	let playlistChannel = playlist.querySelector('.card__channel')
	let playlistCount = playlist.querySelector('.card__count')

	playlist.disabled &&= false;

	const info = data[index]

	playlist.dataset.id = info?.playlistID ?? info.playlistId

	let playlistImageSrc = info?.playlistThumbnail ?? info.firstVideo.bestThumbnail.url

	playlistImage.setAttribute('src', playlistImageSrc)

	const onLoadImage = _ => {
		removeSkeleton(imageSkeleton)

		playlistImage = null;
	}

	const onErrorImage = _ => {
		showToast('error', 'Could not load images :(')
	}

	playlistImage.addEventListener('load', onLoadImage, { once: true });
	playlistImage.addEventListener('error', onErrorImage, { once: true });

	playlistTitle.textContent = info.title;
	removeSkeleton(titleSkeleton)

	playlistCount.textContent = info?.videoCount ?? info.length

	playlistChannel.textContent = info?.author ?? info.owner.name

	playlistChannel.dataset.name = info?.author ?? info.owner.name

	playlistChannel.dataset.id = info?.authorId ?? info.owner.channelID

	removeSkeleton(bottomSkeleton)

	playlistTitle = null
	playlistChannel = null
	playlistCount = null
	titleSkeleton = null
	bottomSkeleton = null
}

const fillChannelCard = (channel, index, data) => {
	let channelImage = channel.querySelector('.card__image img')
	let imageSkeleton = channel.querySelector('.image-skeleton')
	let titleSkeleton = channel.querySelector('.title-skeleton')
	let bottomSkeleton = channel.querySelector('.bottom-skeleton')
	let channelTitle = channel.querySelector('.card__title span')
	let channelDescr = channel.querySelector('.card__channel-descr')
	let channelSubs = channel.querySelector('.card__subs')
	let channelVideoCount = channel.querySelector('.card__video-count')

	channel.disabled &&= false;

	const info = data[index]

	channel.dataset.id = info.channelID
	channel.dataset.name = info.name

	channelImage.setAttribute('src', info.bestAvatar.url)

	const onLoadImage = _ => {
		removeSkeleton(imageSkeleton)

		channelImage = null;
	}

	const onErrorImage = _ => {
		showToast('error', 'Could not load images :(')
	}

	channelImage.addEventListener('load', onLoadImage, { once: true });
	channelImage.addEventListener('error', onErrorImage, { once: true });

	channelTitle.textContent = info.name;
	removeSkeleton(titleSkeleton)

	channelDescr.textContent = info.descriptionShort;
	channelSubs.textContent = info.subscribers;
	channelVideoCount.textContent = `${info.videos} video`;

	removeSkeleton(bottomSkeleton)

	channelTitle = null
	channelDescr = null
	channelSubs = null
	channelVideoCount = null
	titleSkeleton = null
	bottomSkeleton = null
}

const resetCard = card => {
	let skeletonAll = card.querySelectorAll('.skeleton');
	let cardTitle = card.querySelector('.card__title span');
	let cardImg = card.querySelector('.card__image img');

	if (skeletonAll.length > 0) {
		for (let index = 0, length = skeletonAll.length; index < length; index++) {
			const skeleton = skeletonAll[index];
			resetSkeleton(skeleton)
		}
	}

	card.removeAttribute('data-id')
	cardTitle.textContent = '...'
	cardImg.removeAttribute('src')

	switch (card.dataset.win) {
		case 'video':
			resetVideoCard(card)
			break;

		case 'channel':
			resetChannelCard(card)
			break;

		case 'playlist':
			resetPlaylistCard(card)
			break;
	}

	card.disabled ||= true
	card.hidden &&= false;

	let recentWin = card.closest('.win')

	if (recentWin && recentWin.classList.contains('search-results')) {
		const typeArray = ['_video', '_playlist', '_channel']

		typeArray.forEach(type => {
			if (card.classList.contains(type)) {
				card.classList.remove(type);
				return
			}
		});
	}

	skeletonAll = null
	recentWin = null
	cardTitle = null
	cardImg = null
}

const resetVideoCard = card => {
	let videoViews = card.querySelector('.card__views')
	let videoDate = card.querySelector('.card__date')
	let videoChannel = card.querySelector('.card__channel')
	let videoDuration = card.querySelector('.card__duration')
	let videoImg = card.querySelector('.card__image');

	if (card.classList.contains('_live'))
		card.classList.remove('_live');

	if (videoImg.hasAttribute('style'))
		videoImg.removeAttribute('style')

	videoViews.textContent = ''
	videoDate.textContent = ''
	videoChannel.textContent = ''
	videoDuration.textContent = ''
	videoChannel.removeAttribute('data-id')
	videoChannel.removeAttribute('data-name')

	videoViews = null
	videoDate = null
	videoChannel = null
	videoDuration = null
	videoImg = null
}

const resetChannelCard = card => {
	let channelDescr = card.querySelector('.card__channel-descr')
	let channelSubs = card.querySelector('.card__subs')
	let channelVideoCount = card.querySelector('.card__video-count')

	channelDescr.textContent = ''
	channelSubs.textContent = ''
	channelVideoCount.textContent = ''

	channelDescr = null
	channelSubs = null
	channelVideoCount = null
}

const resetPlaylistCard = card => {
	let playlistChannel = card.querySelector('.card__channel')
	let playlistCount = card.querySelector('.card__count')

	playlistChannel.textContent = ''
	playlistCount.textContent = ''
	playlistChannel.removeAttribute('data-id')
	playlistChannel.removeAttribute('data-name')

	playlistChannel = null
	playlistCount = null
}
