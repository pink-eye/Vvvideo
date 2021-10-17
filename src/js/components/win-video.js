const createQualityItemHTML = quality => `<li class="dropdown__item">
											<button class="dropdown__btn btn-reset">${quality}</button>
										</li>`

const insertQualityList = videoFormatAll => {
	let qualityList = _io_q('.controls').querySelector('.quality__list');

	if (videoFormatAll.length > 0) {
		for (let index = 0, length = videoFormatAll.length; index < length; index++) {
			const videoFormat = videoFormatAll[index];
			qualityList.insertAdjacentHTML('afterBegin', createQualityItemHTML(videoFormat.qualityLabel))
		}
	}

	qualityList = null
}

const getHighestVideo = formats => API.YTDLChooseFormat(formats, 'highestvideo')

const getHighestAudio = formats => API.YTDLChooseFormat(formats, 'highestaudio')

const getDefaultFormat = formats => API.YTDLChooseFormat(formats, 'highest')

const filterFormats = (formats, fn) => Object.values(formats).filter(fn)

const filterVideoWebm = formats => filterFormats(formats,
	format =>
		format.container === 'webm'
		&& format.hasVideo)

const filterVideoMP4NoAudio = formats => filterFormats(formats,
	format =>
		format.container === 'mp4'
		&& format.hasVideo
		&& !format.hasAudio)

const filterHLS = formats => filterFormats(formats, format => format.isHLS && format.hasAudio && format.hasVideo)

const isInvalidFormats = formats => formats.find(el => el.type === 'FORMAT_STREAM_TYPE_OTF')

const getPreferedQuality = formats => storage.settings.defaultQuality === 'highest'
	? getHighestVideo(formats)
	: formats.find(el => el.qualityLabel.includes(storage.settings.defaultQuality))

let hls = null

const openWinVideo = async id => {
	let video = _io_q('.video');
	let videoInstance = video.querySelector('video');
	let audioInstance = video.querySelector('audio');
	let videoPoster = video.querySelector('.video__poster img');
	let videoInfo = video.querySelector('.video-info');
	let videoSkeleton = video.querySelector('.video-skeleton');
	let controls = _io_q('.controls');
	let qualityCurrent = controls.querySelector('.quality__current');
	let videoTitle = videoInfo.querySelector('.video-info__title');
	let videoAuthor = videoInfo.querySelector('.author__name');
	let videoViews = videoInfo.querySelector('.video-info__views span');
	let videoDate = videoInfo.querySelector('.video-info__date span');
	let videoDesc = videoInfo.querySelector('.desc-video-info__text');
	let videoAvatar = videoInfo.querySelector('.author__avatar img');
	let avatarSkeleton = videoInfo.querySelector('.avatar-skeleton');
	let videoChannelBtn = videoInfo.querySelector('[data-win="channel"]');
	let videoLikes = videoInfo.querySelector('.video-info__likes span');
	let videoDislikes = videoInfo.querySelector('.video-info__dislikes span');
	let videoSubs = videoInfo.querySelector('.author__subs');
	let ss = storage.settings

	// SUBSCRIBE BTN

	const videoSubscribeBtn = videoInfo.querySelector('.subscribe');
	const videoSubscribeText = videoInfo.querySelector('.subscribe__text');

	const handleClickVideoSubscribeBtn = _ => handleClickSubscribeBtn(videoSubscribeBtn, videoSubscribeText)

	videoSubscribeBtn.addEventListener('click', handleClickVideoSubscribeBtn);

	// SPOILER

	const spoiler = videoInfo.querySelector('.spoiler');

	initSpoiler(spoiler)

	// FILL WIN

	if (API.YTDLvalidateURL(`https://www.youtube.com/watch?v=${id}`)) {
		try {
			let data = ss.enableProxy
				? await API.scrapeVideoProxy(id, getProxyOptions())
				: await API.scrapeVideo(id)

			if (data.videoDetails.isLive)
				video.classList.add('_live')

			if (video.classList.contains('_active')) {
				video.dataset.id = id

				const onLoadedData = _ => {
					if (videoSkeleton)
						removeSkeleton(videoSkeleton)
				}

				// FILL MEDIA
				if (data.formats.length > 0) {
					if (data.videoDetails.isLive) {
						videoFormatAll = filterHLS(data.formats)
						resetMediaEl(audioInstance)
						audioInstance.remove()

						hls = new Hls();

						let currentQuality = getPreferedQuality(videoFormatAll)

						if (!currentQuality)
							currentQuality = videoFormatAll[0]

						hls.loadSource(currentQuality.url);
						qualityCurrent.textContent = currentQuality.qualityLabel

						hls.attachMedia(videoInstance);
						hls.on(Hls.Events.ERROR, (event, data) => {
							if (data.fatal) {
								switch (data.type) {
									case Hls.ErrorTypes.NETWORK_ERROR:
										showToast('error', 'Fatal network error encountered, try to recover...');
										hls.startLoad();
										break;
									case Hls.ErrorTypes.MEDIA_ERROR:
										showToast('error', 'Fatal media error encountered, try to recover...');
										hls.recoverMediaError();
										break;
									default:
										showToast('error', 'Fatal error was occured. Cannot recover :(');
										hls.destroy();
										break;
								}
							}
						});
					} else {
						if (ss.disableSeparatedStreams) {
							videoFormatAll = API.YTDLFilterFormats(data.formats)

							resetMediaEl(audioInstance)
							audioInstance.remove()
						} else {
							switch (ss.defaltVideoFormat) {
								case 'mp4':
									videoFormatAll = filterVideoMP4NoAudio(data.formats)
									break;
								case 'webm':
									videoFormatAll = filterVideoWebm(data.formats)
									break;
							}
							audioInstance.src = getHighestAudio(data.formats).url
						}

						let currentQuality = getPreferedQuality(videoFormatAll)

						if (!currentQuality)
							currentQuality = getDefaultFormat(data.formats)

						videoInstance.src = currentQuality.url
						qualityCurrent.textContent = currentQuality.qualityLabel
					}

					videoInstance.addEventListener('loadeddata', onLoadedData, { once: true });

					insertQualityList(videoFormatAll)
				} else onLoadedData()


				// FILL VIDEO INFO
				if (data.videoDetails.title !== videoTitle.textContent)
					videoTitle.textContent = data.videoDetails.title

				if (data.videoDetails.author.name !== videoAuthor.textContent)
					videoAuthor.textContent = data.videoDetails.author.name

				if (data.videoDetails.thumbnails)
					videoPoster.src = data.videoDetails.thumbnails.at(-1).url

				if (videoViews.textContent === '...')
					videoViews.textContent = normalizeCount(data.videoDetails.viewCount)

				if (videoDate.textContent === '...' || isEmpty(videoDate.textContent))
					videoDate.textContent = formatDate(data.videoDetails.publishDate)

				if (videoDate.textContent === 'Premiere') {
					videoDate.textContent = data.player_response.playabilityStatus.reason
					controls.hidden = true
				}

				videoDesc.innerHTML = normalizeDesc(data.videoDetails.description);
				videoDislikes.textContent = normalizeCount(data.videoDetails.dislikes)
				videoLikes.textContent = normalizeCount(data.videoDetails.likes)
				videoSubs.textContent = `${normalizeCount(data.videoDetails.author.subscriber_count)} subscribers`

				if (data.videoDetails.author.thumbnails) {
					videoAvatar.src = data.videoDetails.author.thumbnails.at(-1).url

					const onLoadAvatar = _ => {
						removeSkeleton(avatarSkeleton)

						videoAvatar = null
					}

					videoAvatar.addEventListener('load', onLoadAvatar, { once: true });
				}

				videoChannelBtn.dataset.id = data.videoDetails.author.id
				videoChannelBtn.disabled = false
			}
		} catch (error) {
			showToast('error', error.message)
		} finally {
			videoInfo = null
			qualityCurrent = null
			videoViews = null
			videoDate = null
			videoDesc = null
			videoChannelBtn = null
			videoLikes = null
			videoDislikes = null
			videoSubs = null
		}

	}
}

const resetVideo = async _ => {
	let video = _io_q('.video')
	let videoPoster = video.querySelector('.video__poster img');
	let avatarSkeleton = video.querySelector('.avatar-skeleton');
	let videoSkeleton = video.querySelector('.video-skeleton');
	let videoLikes = video.querySelector('.video-info__likes span');
	let videoDislikes = video.querySelector('.video-info__dislikes span');
	let videoDesc = video.querySelector('.desc-video-info__text');
	let videoSubs = video.querySelector('.author__subs');
	let videoViews = video.querySelector('.video-info__views span');
	let videoDate = video.querySelector('.video-info__date span');
	let subscribeBtn = video.querySelector('.subscribe');
	let videoInfo = video.querySelector('.video-info');

	let videoSubscribeBtn = videoInfo.querySelector('.subscribe');
	let videoSubscribeText = videoInfo.querySelector('.subscribe__text');

	const handleClickVideoSubscribeBtn = _ => handleClickSubscribeBtn(videoSubscribeBtn, videoSubscribeText)

	videoSubscribeBtn.removeEventListener('click', handleClickVideoSubscribeBtn);

	if (video.classList.contains('_live'))
		video.classList.remove('_live')

	subscribeBtn.removeAttribute('data-channel-id')
	subscribeBtn.removeAttribute('data-name')

	videoPoster.removeAttribute('src')
	videoPoster.closest('.video__poster').classList.remove('_hidden');
	videoLikes.textContent = '...';
	videoDislikes.textContent = '...';
	videoSubs.textContent = '...';
	videoViews.textContent = '...';
	videoDate.textContent = '...';
	videoDesc.textContent = '...';

	if (avatarSkeleton.classList.contains('_removing')) {
		resetSkeleton(avatarSkeleton)
		resetSkeleton(videoSkeleton)
	}

	if (videoFormatAll)
		videoFormatAll.length = 0

	let spoiler = videoInfo.querySelector('.spoiler');

	destroySpoiler(spoiler)

	video = null
	videoPoster = null
	avatarSkeleton = null
	videoSkeleton = null
	videoLikes = null
	videoDislikes = null
	videoSubscribeBtn = null
	videoSubscribeText = null
	videoDesc = null
	videoSubs = null
	videoViews = null
	videoDate = null
	subscribeBtn = null
}

