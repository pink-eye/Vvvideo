const createQualityItemHTML = quality => `<li class="dropdown__item">
											<button class="dropdown__btn btn-reset">${quality}</button>
										</li>`

const createStoryboardHTML = _ => `<div class="progress__storyboard"></div>`

const insertQualityList = videoFormatAll => {
	let controls = _io_q('.controls');
	let quality = controls.querySelector('.controls__quality');
	let qualityList = quality.querySelector('.dropdown__list');

	if (videoFormatAll.length > 0) {
		for (let index = 0, length = videoFormatAll.length; index < length; index++) {
			const videoFormat = videoFormatAll[index];
			qualityList.insertAdjacentHTML('afterBegin', createQualityItemHTML(videoFormat.qualityLabel))
		}
	}

	controls = null
	quality = null
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
	let videoSkeleton = video.querySelector('.video-skeleton');
	let controls = _io_q('.controls');
	let quality = controls.querySelector('.controls__quality');
	let qualityCurrent = quality.querySelector('.dropdown__head');
	let progressStoryboard = controls.querySelector('.progress__storyboard');
	let videoInfo = video.querySelector('.video-info');
	let videoTitle = videoInfo.querySelector('.video-info__title span');
	let videoViews = videoInfo.querySelector('.video-info__views');
	let videoDate = videoInfo.querySelector('.video-info__date');
	let videoDesc = videoInfo.querySelector('.desc-video-info__text');
	let titleSkeleton = videoInfo.querySelector('.title-skeleton');
	let partSkeletonAll = videoInfo.querySelectorAll('.part-skeleton');
	let videoLikes = videoInfo.querySelector('.video-info__likes');
	let videoDislikes = videoInfo.querySelector('.video-info__dislikes');
	let authorCard = videoInfo.querySelector('.author');
	let subscribeBtn = videoInfo.querySelector('.subscribe');
	let ss = storage.settings

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

				prepareSubscribeBtn(subscribeBtn, data.videoDetails.author.id, data.videoDetails.author.name)

				const onLoadedData = _ => {
					if (videoSkeleton)
						removeSkeleton(videoSkeleton)
				}

				// FILL MEDIA
				if (data.formats.length > 0) {
					if (data.videoDetails.isLive) {
						videoFormatAll = filterHLS(data.formats)

						if (audioInstance) {
							resetMediaEl(audioInstance)
							audioInstance.remove()
						}

						hls = new Hls();

						let currentQuality = getPreferedQuality(videoFormatAll)

						if (!currentQuality)
							currentQuality = videoFormatAll[0]

						hls.loadSource(currentQuality.url);
						qualityCurrent.textContent = currentQuality.qualityLabel

						hls.attachMedia(videoInstance);

						const handleError = (event, data) => {
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
						}

						hls.on(Hls.Events.ERROR, handleError);
					} else {
						if (ss.disableSeparatedStreams) {
							videoFormatAll = API.YTDLFilterFormats(data.formats)

							if (audioInstance) {
								resetMediaEl(audioInstance)
								audioInstance.remove()
							}
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

					videoInstance.addEventListener('loadedmetadata', onLoadedData, { once: true });

					insertQualityList(videoFormatAll)
				} else onLoadedData()


				// FILL VIDEO INFO

				if (!ss.disableStoryboard) {
					if (data.videoDetails.storyboards.length > 0)
						progressStoryboard.style.setProperty('--url', `url(${data.videoDetails.storyboards.at(0).templateUrl})`)
					else progressStoryboard.remove()
				} else if (progressStoryboard)
					progressStoryboard.remove()

				if (data.videoDetails.title !== videoTitle.textContent)
					videoTitle.textContent = data.videoDetails.title

				removeSkeleton(titleSkeleton)

				if (data.videoDetails.thumbnails)
					videoPoster.src = data.videoDetails.thumbnails.at(-1).url

				if (videoViews.textContent === '...')
					videoViews.textContent = normalizeCount(data.videoDetails.viewCount)

				if (videoDate.textContent === '...')
					videoDate.textContent = formatDate(data.videoDetails.publishDate)

				if (videoDate.textContent === 'Premiere') {
					videoDate.textContent = data.player_response.playabilityStatus.reason
					controls.hidden = true
				}

				videoDislikes.textContent = normalizeCount(data.videoDetails.dislikes)
				videoLikes.textContent = normalizeCount(data.videoDetails.likes)

				if (partSkeletonAll.length > 0) {
					for (let index = 0, length = partSkeletonAll.length; index < length; index++) {
						const partSkeleton = partSkeletonAll[index];
						removeSkeleton(partSkeleton)
					}
				}

				let authorParams = {
					parent: authorCard,
					name: data.videoDetails.author.name,
					subs: `${normalizeCount(data.videoDetails.author.subscriber_count)} subscribers`,
					id: data.videoDetails.author.id,
					avatarSrc: data.videoDetails.author.thumbnails
						? data.videoDetails.author.thumbnails.at(-1).url
						: ''
				}

				fillAuthorCard(authorParams)

				authorParams = null

				videoDesc.innerHTML = normalizeDesc(data.videoDetails.description);

				if (!storage.settings.disableHistory)
					saveToHistoryVideo(scrapeVideoInfoFromData, data)
			}
		} catch (error) {
			showToast('error', error.message)
		} finally {
			subscribeBtn = null
			videoInfo = null
			quality = null
			qualityCurrent = null
			videoViews = null
			videoDate = null
			controls = null
			videoDesc = null
			videoLikes = null
			videoDislikes = null
			progressStoryboard = null
			partSkeletonAll = null
			titleSkeleton = null
			authorCard = null
		}
	}
}

const resetVideo = _ => {
	let video = _io_q('.video')
	let videoPoster = video.querySelector('.video__poster img');
	let skeletonAll = video.querySelectorAll('.skeleton');
	let videoInfo = video.querySelector('.video-info');
	let videoTitle = videoInfo.querySelector('.video-info__title span');
	let videoLikes = videoInfo.querySelector('.video-info__likes');
	let videoDislikes = videoInfo.querySelector('.video-info__dislikes');
	let videoDesc = videoInfo.querySelector('.desc-video-info__text');
	let videoViews = videoInfo.querySelector('.video-info__views');
	let videoDate = videoInfo.querySelector('.video-info__date');

	video.dataset.id = ''

	let subscribeBtn = videoInfo.querySelector('.subscribe');
	destroySubscribeBtn(subscribeBtn)

	if (video.classList.contains('_live'))
		video.classList.remove('_live')

	videoPoster.removeAttribute('src')
	videoPoster.closest('.video__poster').classList.remove('_hidden');
	videoTitle.textContent = '...';
	videoLikes.textContent = '...';
	videoDislikes.textContent = '...';
	videoViews.textContent = '...';
	videoDate.textContent = '...';
	videoDesc.textContent = '...';

	if (skeletonAll.length > 0) {
		for (let index = 0, length = skeletonAll.length; index < length; index++) {
			const skeleton = skeletonAll[index];
			resetSkeleton(skeleton)
		}
	}

	if (videoFormatAll)
		videoFormatAll.length = 0

	let spoiler = videoInfo.querySelector('.spoiler');
	destroySpoiler(spoiler)

	video = null
	videoPoster = null
	videoLikes = null
	skeletonAll = null
	videoDislikes = null
	videoDesc = null
	videoViews = null
	videoDate = null
	subscribeBtn = null
}

const fillSomeInfoVideo = ({ title = '', views = '', date = '', author = '', authorId = '' }) => {
	let video = _io_q('.video');
	let videoInfo = video.querySelector('.video-info');
	let videoTitle = videoInfo.querySelector('.video-info__title span');
	let videoViews = videoInfo.querySelector('.video-info__views');
	let videoDate = videoInfo.querySelector('.video-info__date');
	let authorCard = videoInfo.querySelector('.author');
	let subscribeBtn = videoInfo.querySelector('.subscribe');
	let titleSkeleton = videoInfo.querySelector('.title-skeleton');
	let partSkeletonAll = videoInfo.querySelectorAll('.part-skeleton');

	if (!isEmpty(title) && title !== '...') {
		videoTitle.textContent = title;
		removeSkeleton(titleSkeleton)
	}
	if (!isEmpty(views) && views !== '...') {
		videoViews.textContent = views;
		removeSkeleton(partSkeletonAll[0])
	}
	if (!isEmpty(date) && date !== '...') {
		videoDate.textContent = date;
		removeSkeleton(partSkeletonAll[1])
	}

	resetAuthorCard(authorCard)

	let authorParams = {
		parent: authorCard,
		name: author,
		id: authorId,
	}

	fillAuthorCard(authorParams)

	prepareSubscribeBtn(subscribeBtn, authorId, author)

	video = null
	videoInfo = null
	videoTitle = null
	videoViews = null
	videoDate = null
	subscribeBtn = null
	titleSkeleton = null
	partSkeletonAll = null
	authorParams = null
	authorCard = null
}

const prepareVideoWin = (btnWin, id) => {
	if (btnWin) {
		let params = {
			title: btnWin.querySelector('.card__title span').textContent,
			views: btnWin.querySelector('.card__views').textContent,
			date: btnWin.querySelector('.card__date').textContent,
			author: btnWin.querySelector('.card__channel').dataset.name,
			authorId: btnWin.querySelector('.card__channel').dataset.id
		}

		fillSomeInfoVideo(params);
	} else {
		fillSomeInfoVideo({});
	}

	openWinVideo(id).then(initVideoPlayer)

	if (!storage.settings.disableSponsorblock)
		getSegmentsSB(id)

	if (!storage.settings.disableHistory)
		saveToHistoryVideo(scrapeVideoInfoFromCard, btnWin)
}
