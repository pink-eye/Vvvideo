const createQualityItemHTML = quality => `
	<li class="dropdown__item">
		<button class="dropdown__btn btn-reset">${quality}</button>
	</li>`

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

const getPreferedQuality = formats => ss.defaultQuality === 'highest'
	? getHighestVideo(formats)
	: formats.find(el => el.qualityLabel.includes(ss.defaultQuality))

let hls = null

const getVideo = async id => {
	let video = _io_q('.video');
	let videoInstance = video.querySelector('video');
	let audioInstance = video.querySelector('audio');
	let videoPoster = video.querySelector('.video__poster img');
	let videoInfo = video.querySelector('.video-info');
	let videoSkeleton = video.querySelector('.video-skeleton');
	let controls = video.querySelector('.controls');
	let qualityList = controls.querySelector('.quality__list');
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

	if (API.YTDLvalidateURL(`https://www.youtube.com/watch?v=${id}`)) {
		try {
			let data = ss.enableProxy
				? await API.scrapeVideoProxy(id, getProxyOptions())
				: await API.scrapeVideo(id)

			if (data.videoDetails.isLive)
				video.classList.add('_live')

			if (video.classList.contains('_active')) {
				video.dataset.id = id

				// FILL MEDIA
				if (data.formats.length > 0) {
					if (data.videoDetails.isLive) {
						videoFormatAll = filterHLS(data.formats)
						resetMediaEl(audioInstance)
						audioInstance.remove()
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
						}
					}

					if (audioInstance)
						audioInstance.src = getHighestAudio(data.formats).url

					if (ss.autoplay)
						videoInstance.autoplay = true

					let preferedQuality = getPreferedQuality(videoFormatAll)

					if (data.videoDetails.isLive) {
						hls = new Hls();

						if (preferedQuality) {
							hls.loadSource(preferedQuality.url);
							qualityCurrent.textContent = preferedQuality.qualityLabel
						} else {
							let sparedQuality = getDefaultFormat(data.formats)
							hls.loadSource(sparedQuality.url);
							qualityCurrent.textContent = sparedQuality.qualityLabel
						}
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
						if (preferedQuality) {
							videoInstance.src = preferedQuality.url
							qualityCurrent.textContent = preferedQuality.qualityLabel
						} else {
							let sparedQuality = getDefaultFormat(data.formats)

							videoInstance.src = sparedQuality.url
							qualityCurrent.textContent = sparedQuality.qualityLabel
						}
					}

					if (videoFormatAll.length > 0) {
						for (let index = 0, length = videoFormatAll.length; index < length; index++) {
							const videoFormat = videoFormatAll[index];
							qualityList.insertAdjacentHTML('afterBegin', createQualityItemHTML(videoFormat.qualityLabel))
						}
					}

					videoInstance.onloadeddata = _ => {
						if (videoSkeleton)
							removeSkeleton(videoSkeleton)

					}
				} else {
					if (videoSkeleton)
						removeSkeleton(videoSkeleton)
				}

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

					videoAvatar.onload = _ => {
						removeSkeleton(avatarSkeleton)

						videoAvatar = null
					}
				}

				videoChannelBtn.dataset.id = data.videoDetails.author.id
				videoChannelBtn.disabled = false
			}
		} catch (error) {
			showToast('error', error.message)
		} finally {
			videoInfo = null
			qualityList = null
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
	let videoInstance = video.querySelector('video');
	let audioInstance = video.querySelector('audio');
	let videoWrapper = video.querySelector('.video__wrapper');
	let videoPoster = video.querySelector('.video__poster img');
	let avatarSkeleton = video.querySelector('.avatar-skeleton');
	let videoSkeleton = video.querySelector('.video-skeleton');
	let videoLikes = video.querySelector('.video-info__likes span');
	let videoDislikes = video.querySelector('.video-info__dislikes span');
	let videoDesc = video.querySelector('.desc-video-info__text');
	let videoSubs = video.querySelector('.author__subs');
	let videoViews = video.querySelector('.video-info__views span');
	let videoDate = video.querySelector('.video-info__date span');
	let controls = video.querySelector('.controls');
	let progress = controls.querySelector('.progress');
	let timeDuration = controls.querySelector('.time__duration');
	let qualityList = controls.querySelector('.quality__list');
	let timeElapsed = controls.querySelector('.time__elapsed');
	let controlsSwitchIcon = controls.querySelector('.controls__switch svg use');
	let sponsorblock = controls.querySelector('.sponsorblock');
	let sponsorblockBtn = controls.querySelector('.controls__sponsorblock');
	let speedCurrent = controls.querySelector('.speed__current');
	let subscribeBtn = video.querySelector('.subscribe');

	if (video.classList.contains('_live'))
		video.classList.remove('_live')

	subscribeBtn.removeAttribute('data-channel-id')
	subscribeBtn.removeAttribute('data-name')

	while (sponsorblock.firstChild)
		sponsorblock.firstChild.remove()

	if (sponsorblockBtn.classList.contains('_record'))
		sponsorblockBtn.classList.remove('_record')

	while (qualityList.firstChild)
		qualityList.firstChild.remove()

	speedCurrent.textContent = 'x1'

	if (!isEmpty(hls)) {
		hls.detachMedia()
		hls.destroy()
		hls = null
	}

	resetMediaEl(videoInstance)

	audioInstance
		? resetMediaEl(audioInstance)
		: videoWrapper.insertAdjacentHTML('afterBegin',
			'<audio crossorigin="anonymous" referrerpolicy="no-referrer" preload></audio>')

	videoPoster.removeAttribute('src')
	videoPoster.closest('.video__poster').classList.remove('_hidden');
	videoLikes.textContent = '...';
	videoDislikes.textContent = '...';
	videoSubs.textContent = '...';
	videoViews.textContent = '...';
	videoDate.textContent = '...';
	videoDesc.textContent = '...';
	timeDuration.textContent = '0:00';
	timeElapsed.textContent = '0:00';
	timeDuration.removeAttribute('datetime')
	timeElapsed.removeAttribute('datetime')
	progress.removeAttribute('style')

	if (avatarSkeleton.classList.contains('_removing')) {
		resetSkeleton(avatarSkeleton)
		resetSkeleton(videoSkeleton)
	}

	controls.hidden &&= false

	let iconPathPlay = 'img/svg/controls.svg#play'
	if (controlsSwitchIcon.getAttribute('xlink:href') !== iconPathPlay)
		controlsSwitchIcon.setAttribute('xlink:href', iconPathPlay);

	if (videoFormatAll)
		videoFormatAll.length = 0

	video = null
	videoInstance = null
	videoWrapper = null
	videoPoster = null
	avatarSkeleton = null
	videoSkeleton = null
	qualityList = null
	videoLikes = null
	videoDislikes = null
	videoDesc = null
	videoSubs = null
	videoViews = null
	videoDate = null
	timeDuration = null
	timeElapsed = null
	controls = null
	controlsSwitchIcon = null
	sponsorblock = null
}

