const createQualityItemHTML = quality => `<li class="dropdown__item">
											<button class="dropdown__btn btn-reset">${quality}</button>
										</li>`

const createStoryboardHTML = _ => `<div class="progress__storyboard"></div>`

const insertQualityList = videoFormatAll => {
	let controls = _io_q('.controls')
	let quality = controls.querySelector('.controls__quality')
	let qualityList = quality.querySelector('.dropdown__list')

	if (videoFormatAll.length > 0) {
		for (let index = 0, { length } = videoFormatAll; index < length; index += 1) {
			const videoFormat = videoFormatAll[index]
			qualityList.insertAdjacentHTML('afterBegin', createQualityItemHTML(videoFormat.qualityLabel))
		}
	}

	controls = null
	quality = null
	qualityList = null
}

const disableAudio = _ => {
	let audio = _io_q('audio')

	if (audio) {
		resetMediaEl(audio)
		audio.remove()
	}

	audio = null
}

const prepareVideoLive = formats => {
	let video = _io_q('video')
	let qualityCurrent = _io_q('.video').querySelector('.dropdown__head')

	videoFormatAll = filterHLS(formats)

	disableAudio()

	hls = new Hls()

	let currentQuality = getPreferedQuality(videoFormatAll) ?? videoFormatAll[0]

	hls.loadSource(currentQuality.url)
	qualityCurrent.textContent = currentQuality.qualityLabel

	hls.attachMedia(video)

	const handleError = (event, { fatal, type }) => {
		if (fatal) {
			switch (type) {
				case Hls.ErrorTypes.NETWORK_ERROR:
					showToast('error', 'Fatal network error encountered, try to recover...')
					hls.startLoad()
					break
				case Hls.ErrorTypes.MEDIA_ERROR:
					showToast('error', 'Fatal media error encountered, try to recover...')
					hls.recoverMediaError()
					break
				default:
					showToast('error', 'Fatal error was occured. Cannot recover :(')
					hls.destroy()
					break
			}
		}
	}

	hls.on(Hls.Events.ERROR, handleError)

	video = null
	qualityCurrent = null
}

const prepareVideoOnly = formats => {
	videoFormatAll = filterVideoAndAudio(formats)

	disableAudio()
}

const prepareVideoAndAudio = (audio, formats) => {
	let ss = storage.settings

	switch (ss.defaltVideoFormat) {
		case 'mp4':
			videoFormatAll = filterVideoMP4NoAudio(formats)
			break
		case 'webm':
			videoFormatAll = filterVideoWebm(formats)
			break
	}

	audio.src = getHighestAudio(formats).url

	if (videoFormatAll.length === 0) prepareVideoOnly(formats)

	audio = null
}

let hls = null

const openWinVideo = async id => {
	let video = _io_q('.video')
	let videoInstance = video.querySelector('video')
	let audioInstance = video.querySelector('audio')
	let videoPoster = video.querySelector('.video__poster img')
	let videoSkeleton = video.querySelector('.video-skeleton')
	let controls = _io_q('.controls')
	let quality = controls.querySelector('.controls__quality')
	let qualityCurrent = quality.querySelector('.dropdown__head')
	let progressStoryboard = controls.querySelector('.progress__storyboard')
	let videoInfo = video.querySelector('.video-info')
	let videoTitle = videoInfo.querySelector('.video-info__title span')
	let videoViews = videoInfo.querySelector('.video-info__views')
	let videoDate = videoInfo.querySelector('.video-info__date')
	let videoDesc = videoInfo.querySelector('.desc-video-info__text')
	let titleSkeleton = videoInfo.querySelector('.title-skeleton')
	let partSkeletonAll = videoInfo.querySelectorAll('.part-skeleton')
	let videoLikes = videoInfo.querySelector('.video-info__likes')
	let videoDislikes = videoInfo.querySelector('.video-info__dislikes')
	let authorCard = videoInfo.querySelector('.author')
	let subscribeBtn = videoInfo.querySelector('.subscribe')
	let ss = storage.settings

	// SPOILER

	const spoiler = videoInfo.querySelector('.spoiler')

	initSpoiler(spoiler)

	// FILL WIN

	if (API.isYTVideoURL(`https://www.youtube.com/watch?v=${id}`)) {
		try {
			let data = ss.enableProxy ? await API.scrapeVideoProxy(id, getProxyOptions()) : await API.scrapeVideo(id)

			const { formats, videoDetails } = data

			if (videoDetails.isLive) video.classList.add('_live')

			if (video.classList.contains('_active')) {
				video.dataset.id = id

				prepareSubscribeBtn(subscribeBtn, videoDetails.author.id, videoDetails.author.name)

				const onLoadedData = _ => {
					if (videoSkeleton) removeSkeleton(videoSkeleton)

					videoInstance = null
				}

				// FILL MEDIA
				if (formats.length > 0) {
					if (videoDetails.isLive) prepareVideoLive(formats)
					else {
						ss.disableSeparatedStreams
							? prepareVideoOnly(formats)
							: prepareVideoAndAudio(audioInstance, formats)

						let currentQuality = getPreferedQuality(videoFormatAll) ?? videoFormatAll.at(-1)

						videoInstance.src = currentQuality.url
						qualityCurrent.textContent = currentQuality.qualityLabel
					}

					videoInstance.addEventListener('loadedmetadata', onLoadedData, { once: true })

					insertQualityList(videoFormatAll)
				} else onLoadedData()

				// FILL VIDEO INFO

				if (ss.disableStoryboard || videoDetails.storyboards.length === 0) progressStoryboard.remove()

				if (progressStoryboard && videoDetails?.storyboards && videoDetails.storyboards.length > 0)
					progressStoryboard.style.setProperty('--url', `url(${videoDetails.storyboards.at(0).templateUrl})`)

				if (videoDetails.title !== videoTitle.textContent) videoTitle.textContent = videoDetails.title

				removeSkeleton(titleSkeleton)

				if (videoDetails.thumbnails) videoPoster.src = videoDetails.thumbnails.at(-1).url

				if (videoViews.textContent === '...') videoViews.textContent = normalizeCount(videoDetails.viewCount)

				if (videoDate.textContent === '...') videoDate.textContent = formatDate(videoDetails.publishDate)

				if (videoDate.textContent === 'Premiere') {
					videoDate.textContent = data.player_response.playabilityStatus.reason
					controls.hidden = true
				}

				videoDislikes.textContent = normalizeCount(videoDetails.dislikes)
				videoLikes.textContent = normalizeCount(videoDetails.likes)

				if (partSkeletonAll.length > 0) {
					for (let index = 0, { length } = partSkeletonAll; index < length; index += 1) {
						const partSkeleton = partSkeletonAll[index]
						removeSkeleton(partSkeleton)
					}
				}

				let authorParams = {
					parent: authorCard,
					name: videoDetails.author.name,
					subs: `${normalizeCount(videoDetails.author.subscriber_count)} subscribers`,
					id: videoDetails.author.id,
					avatarSrc: videoDetails.author.thumbnails ? videoDetails.author.thumbnails.at(-1).url : '',
				}

				fillAuthorCard(authorParams)

				authorParams = null

				videoDesc.innerHTML = normalizeDesc(videoDetails.description)

				saveVideoInHistory(scrapeVideoInfoFromData, data)
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
	let videoPoster = video.querySelector('.video__poster img')
	let skeletonAll = video.querySelectorAll('.skeleton')
	let videoInfo = video.querySelector('.video-info')
	let videoTitle = videoInfo.querySelector('.video-info__title span')
	let videoLikes = videoInfo.querySelector('.video-info__likes')
	let videoDislikes = videoInfo.querySelector('.video-info__dislikes')
	let videoDesc = videoInfo.querySelector('.desc-video-info__text')
	let videoViews = videoInfo.querySelector('.video-info__views')
	let videoDate = videoInfo.querySelector('.video-info__date')

	video.dataset.id = ''

	let subscribeBtn = videoInfo.querySelector('.subscribe')
	destroySubscribeBtn(subscribeBtn)

	if (video.classList.contains('_live')) video.classList.remove('_live')

	videoPoster.removeAttribute('src')
	videoPoster.closest('.video__poster').classList.remove('_hidden')
	videoTitle.textContent = '...'
	videoLikes.textContent = '...'
	videoDislikes.textContent = '...'
	videoViews.textContent = '...'
	videoDate.textContent = '...'
	videoDesc.textContent = '...'

	if (skeletonAll.length > 0) {
		for (let index = 0, { length } = skeletonAll; index < length; index += 1) {
			const skeleton = skeletonAll[index]
			resetSkeleton(skeleton)
		}
	}

	if (videoFormatAll) videoFormatAll.length = 0

	let spoiler = videoInfo.querySelector('.spoiler')
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
	let video = _io_q('.video')
	let videoInfo = video.querySelector('.video-info')
	let videoTitle = videoInfo.querySelector('.video-info__title span')
	let videoViews = videoInfo.querySelector('.video-info__views')
	let videoDate = videoInfo.querySelector('.video-info__date')
	let authorCard = videoInfo.querySelector('.author')
	let subscribeBtn = videoInfo.querySelector('.subscribe')
	let titleSkeleton = videoInfo.querySelector('.title-skeleton')
	let partSkeletonAll = videoInfo.querySelectorAll('.part-skeleton')

	if (!isEmpty(title) && title !== '...') {
		videoTitle.textContent = title
		removeSkeleton(titleSkeleton)
	}
	if (!isEmpty(views) && views !== '...') {
		videoViews.textContent = views
		removeSkeleton(partSkeletonAll[0])
	}
	if (!isEmpty(date) && date !== '...') {
		videoDate.textContent = date
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
	let params = {}

	if (btnWin) {
		params = {
			title: btnWin.querySelector('.card__title span').textContent,
			views: btnWin.querySelector('.card__views').textContent,
			date: btnWin.querySelector('.card__date').textContent,
			author: btnWin.querySelector('.card__channel').dataset.name,
			authorId: btnWin.querySelector('.card__channel').dataset.id,
		}
	}

	fillSomeInfoVideo(params)

	openWinVideo(id).then(initVideoPlayer)

	getSegmentsSB(id)

	saveVideoInHistory(scrapeVideoInfoFromCard, btnWin)
}
