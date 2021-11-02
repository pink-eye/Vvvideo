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

	video.dataset.id = data[index].hasOwnProperty('videoId')
		? data[index].videoId
		: data[index].id

	if (data[index].hasOwnProperty('bestThumbnail'))
		videoImage.setAttribute('src', data[index].bestThumbnail.url)
	else if (data[index].videoThumbnails.find(el => el.quality === 'maxresdefault')) {
		let maxResImage = data[index].videoThumbnails.find(el => el.quality === 'maxresdefault')
		videoImage.setAttribute('src', maxResImage.url)
	} else {
		data[index].videoThumbnails.sort((a, b) => b.width - a.width)
		videoImage.setAttribute('src', data[index].videoThumbnails[0].url)
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

	videoTitle.textContent = data[index].title;

	removeSkeleton(titleSkeleton)

	videoViews.textContent = data[index].hasOwnProperty('viewCount')
		? normalizeCount(data[index].viewCount)
		: data[index].hasOwnProperty('views')
			? normalizeCount(data[index].views)
			: '...'

	if (data[index].liveNow || data[index].premiere || data[index].isLive)
		video.classList.add('_live');

	videoDate.textContent = data[index].viewCountText
		? data[index].premiere || data[index].viewCountText.includes('wait')
			? 'Premiere'
			: data[index].liveNow
				? 'Live'
				: data[index].publishedText
		: data[index].hasOwnProperty('publishedText')
			? data[index].publishedText
			: data[index].isLive
				? 'Live'
				: data[index].hasOwnProperty('uploadedAt')
					? data[index].uploadedAt
					: '...'

	videoChannel.textContent = data[index].author.name
		? data[index].author.name
		: data[index].author

	videoChannel.dataset.name = data[index].author.name
		? data[index].author.name
		: data[index].author

	videoChannel.dataset.id = data[index].authorId
		? data[index].authorId
		: data[index].author.channelID

	videoDuration.textContent = data[index].hasOwnProperty('lengthSeconds')
		? data[index].hasOwnProperty('simpleText')
			? data[index].lengthSeconds.simpleText
			: convertSecondsToDuration(data[index].lengthSeconds)
		: convertSecondsToDuration(data[index].duration)

	removeSkeleton(bottomSkeleton)

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
	playlist.dataset.id = data[index].hasOwnProperty('playlistID')
		? data[index].playlistID
		: data[index].playlistId

	data[index].firstVideo
		? playlistImage.setAttribute('src', data[index].firstVideo.bestThumbnail.url)
		: playlistImage.setAttribute('src', data[index].playlistThumbnail)

	const onLoadImage = _ => {
		removeSkeleton(imageSkeleton)

		playlistImage = null;
	}

	const onErrorImage = _ => {
		showToast('error', 'Could not load images :(')
	}

	playlistImage.addEventListener('load', onLoadImage, { once: true });
	playlistImage.addEventListener('error', onErrorImage, { once: true });

	playlistTitle.textContent = data[index].title;
	removeSkeleton(titleSkeleton)

	playlistCount.textContent = data[index].hasOwnProperty('length')
		? data[index].length
		: data[index].videoCount

	playlistChannel.textContent = data[index].hasOwnProperty('owner')
		? data[index].owner.name
		: data[index].author

	playlistChannel.dataset.name = data[index].hasOwnProperty('owner')
		? data[index].owner.name
		: data[index].author

	playlistChannel.dataset.id = data[index].hasOwnProperty('owner')
		? data[index].owner.channelID
		: data[index].authorId

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
	channel.dataset.id = data[index].channelID
	channel.dataset.name = data[index].name

	channelImage.setAttribute('src', data[index].bestAvatar.url)

	const onLoadImage = _ => {
		removeSkeleton(imageSkeleton)

		channelImage = null;
	}

	const onErrorImage = _ => {
		showToast('error', 'Could not load images :(')
	}

	channelImage.addEventListener('load', onLoadImage, { once: true });
	channelImage.addEventListener('error', onErrorImage, { once: true });

	channelTitle.textContent = data[index].name;
	removeSkeleton(titleSkeleton)

	channelDescr.textContent = data[index].descriptionShort;
	channelSubs.textContent = data[index].subscribers;
	channelVideoCount.textContent = `${data[index].videos} video`;

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
		const typeAll = {
			video: '_video',
			playlist: '_playlist',
			channel: '_channel'
		}

		for (let key in typeAll) {
			if (card.classList.contains(typeAll[key])) {
				card.classList.remove(typeAll[key]);
				break;
			}
		}
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

	if (card.classList.contains('_live'))
		card.classList.remove('_live');

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
