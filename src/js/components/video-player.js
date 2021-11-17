let videoFormatAll = null
let hasListeners = false
let isFirstPlay = true
let isSync = false
let doesSkipSegments = true

const resetMediaEl = el => {
	el.pause()
	el.removeAttribute('src')
	el.load()
}

const getMedia = () => {
	const audio = _io_q('.video').querySelector('audio')
	const video = _io_q('video')

	return { video, audio }
}

const initSponsorblockSegments = data => {
	let video = _io_q('video')
	let progressSponsorblock = _io_q('.controls').querySelector('.progress__sponsorblock')
	let sponsorblockItemAll = progressSponsorblock.querySelectorAll('.sponsorblock__item')

	for (let index = 0, { length } = sponsorblockItemAll; index < length; index += 1) {
		const sponsorblockItem = sponsorblockItemAll[index]
		const { startTime, endTime, videoDuration } = data[index]
		const segmentLength = endTime - startTime
		const vDuration = videoDuration !== 0 ? videoDuration : ~~video.duration
		const sponsorblockItemWidth = convertToProc(segmentLength, vDuration)
		const sponsorblockItemLeft = convertToProc(startTime, vDuration)

		sponsorblockItem.style.setProperty('--width', `${sponsorblockItemWidth}%`)
		sponsorblockItem.style.setProperty('--left', `${sponsorblockItemLeft}%`)
	}

	video = null
	progressSponsorblock = null
	sponsorblockItemAll = null
}

const changeVideoSrc = (url, currentTime) => {
	let video = _io_q('video')

	if (isEmpty(hls)) {
		video.removeAttribute('src')
		video.load()
		video.src = url
	} else hls.loadSource(url)

	video.currentTime = currentTime

	video = null
}

const chooseQuality = url => {
	let video = _io_q('video')
	const currentTime = video.currentTime

	if (!video.paused) {
		pauseVideoPlayer()
		changeVideoSrc(url, currentTime)
		playVideoPlayer()
	} else changeVideoSrc(url, currentTime)

	isSync = false

	video = null
}

const hideDecoration = action => {
	let controls = _io_q('.controls')
	let icon = controls.querySelector(`#${action}`)

	if (!icon.hidden) {
		const afterRemoveDecoration = _ => {
			icon.hidden ||= true

			controls = null
			icon = null
		}

		const removeDecoration = _ => {
			if (icon.classList.contains('_active')) icon.classList.remove('_active')

			setTimeout(afterRemoveDecoration, 300)
		}

		setTimeout(removeDecoration, 300)
	}
}

const showDecoration = (action, doHide) => {
	let controls = _io_q('.controls')
	let icon = controls.querySelector(`#${action}`)

	if (icon.hidden) {
		icon.hidden = false

		const activeDecoration = _ => {
			if (!icon.classList.contains('_active')) icon.classList.add('_active')

			controls = null
			icon = null
		}

		setTimeout(activeDecoration, 15)

		doHide && hideDecoration(action)
	}
}

const syncMedia = _ => {
	let { video, audio } = getMedia()

	if (!isSync) {
		audio.currentTime = video.currentTime
		isSync = true
	}

	audio = null
	video = null
}

const isPlaying = el => el && !el.paused && !el.ended && el.currentTime > 0 && el.readyState > 2

const isPlayingLight = el => el && !el.paused && !el.ended && el.currentTime > 0

const pauseEl = el => {
	if (isPlayingLight(el)) {
		el.pause()
		hideDecoration('load')
	}
}

const playEl = async el => {
	if (el) {
		let playPromise = el.play()

		if (playPromise !== undefined && !isPlaying(el)) {
			try {
				await playPromise

				let audio = _io_q('.video').querySelector('audio')
				let video = _io_q('video')

				if (audio) {
					if (isPlaying(video) && isPlaying(audio)) syncMedia()
				}

				audio = null
				video = null
			} catch (error) {
				showToast('error', error.message)
			}
		}
	}
}

const startVideoFromLastPoint = _ => {
	const videoId = _io_q('.video').dataset.id

	if (isEmpty(videoId)) return

	const videoWatchedTime = getWatchedtTime(videoId)

	if (videoWatchedTime) _io_q('video').currentTime = videoWatchedTime
}

const playVideoPlayer = async _ => {
	let { video, audio } = getMedia()

	await playEl(video)
	await playEl(audio)

	showDecoration('play', true)

	if (isFirstPlay) {
		startVideoFromLastPoint()

		isFirstPlay = false
	}

	audio = null
	video = null
}

const pauseVideoPlayer = _ => {
	let { video, audio } = getMedia()

	pauseEl(video)
	pauseEl(audio)

	showDecoration('pause', true)

	audio = null
	video = null
}

const togglePlay = _ => {
	let { video, audio } = getMedia()

	let conditionTogglePlay = audio ? video.paused && audio.paused : video.paused

	conditionTogglePlay ? playVideoPlayer() : pauseVideoPlayer()

	hidePoster()
	isSync = false

	audio = null
	video = null
}

const toggleIconPlayPause = _ => {
	_io_q('video').paused ? showIconPlay() : showIconPause()
}

const changeIcon = iconPath => {
	let controls = _io_q('.controls')
	let controlsSwitchIcon = controls.querySelector('.controls__switch svg use')

	controlsSwitchIcon.setAttribute('xlink:href', iconPath)

	controls = null
	controlsSwitchIcon = null
}

const showIconPlay = _ => {
	changeIcon('img/svg/controls.svg#play')
}

const showIconPause = _ => {
	changeIcon('img/svg/controls.svg#pause')
}

const updateTimeElapsed = _ => {
	let controls = _io_q('.controls')
	let timeElapsed = controls.querySelector('.time__elapsed')
	const time = convertSecondsToDuration(~~_io_q('video').currentTime)

	timeElapsed.textContent = time
	timeElapsed.setAttribute('datetime', time)

	controls = null
	timeElapsed = null
}

const updateVolumeEl = el => {
	let controls = _io_q('.controls')
	let volumeBar = controls.querySelector('.volume__bar')
	let volumeSeek = controls.querySelector('.volume__seek')

	el.muted &&= false

	el.volume = volumeSeek.value
	volumeBar.value = volumeSeek.value

	controls = null
	volumeSeek = null
	volumeBar = null
}

const hideControls = _ => {
	let controls = _io_q('.controls')
	let dropdownActive = controls.querySelector('.dropdown._active')
	let controlsBar = controls.querySelector('.controls__bar')

	if (!dropdownActive) controlsBar.classList.remove('_opened')

	dropdownActive = null
	controlsBar = null
	controls = null
}

const showControls = _ => {
	let controlsBar = _io_q('.controls').querySelector('.controls__bar')

	controlsBar.classList.add('_opened')

	controlsBar = null
}

const hidePoster = _ => {
	let videoPoster = _io_q('.video').querySelector('.video__poster')

	if (!videoPoster.classList.contains('_hidden')) videoPoster.classList.add('_hidden')

	videoPoster = null
}

const toggleFullscreen = _ => {
	let videoWrapper = _io_q('.video').querySelector('.video__wrapper')

	document.fullscreenElement ? document.exitFullscreen() : videoWrapper.requestFullscreen()

	videoWrapper = null
}

const updateStoryboard = params => {
	let progressStoryboard = _io_q('.controls').querySelector('.progress__storyboard')

	if (progressStoryboard && isEmpty(hls)) {
		const { skipTo, widthProgressBar, posCursor } = params
		const { posX, posY } = getPosStroryboard(_io_q('video').duration, skipTo, 100)

		progressStoryboard.style.setProperty('--posX', `-${posX}px`)
		progressStoryboard.style.setProperty('--posY', `-${posY}px`)

		if (posCursor < widthProgressBar * 0.1) {
			progressStoryboard.style.left = `${widthProgressBar * 0.1}px`
		}

		if (posCursor > widthProgressBar * 0.1 && posCursor < widthProgressBar * 0.9) {
			progressStoryboard.style.left = `${posCursor}px`
		}

		if (posCursor > widthProgressBar * 0.9) {
			progressStoryboard.style.left = `${widthProgressBar * 0.9}px`
		}
	}

	progressStoryboard = null
}

const updateProgress = _ => {
	let progress = _io_q('.controls').querySelector('.progress')
	let progressSeek = progress.querySelector('.progress__seek')
	let video = _io_q('video')

	progressSeek.value = Math.floor(video.currentTime)
	progress.style.setProperty('--progress', `${convertToProc(Math.floor(video.currentTime), ~~video.duration)}%`)

	progress = null
	progressSeek = null
	video = null
}

const updateSeekTooltip = params => {
	let controls = _io_q('.controls')
	let progressSeek = controls.querySelector('.progress__seek')
	let progressSeekTooltip = controls.querySelector('.progress__seek-tooltip')

	const { duration, skipTo, widthProgressBar, posCursor } = params

	if (skipTo > 0 && skipTo < Math.floor(duration)) {
		const t = convertSecondsToDuration(skipTo)
		progressSeek.setAttribute('data-seek', skipTo)
		progressSeekTooltip.textContent = t
	}

	if (posCursor < widthProgressBar * 0.1) {
		progressSeekTooltip.style.left = `${widthProgressBar * 0.1}px`
	}

	if (posCursor > widthProgressBar * 0.1 && posCursor < widthProgressBar * 0.9) {
		progressSeekTooltip.style.left = `${posCursor}px`
	}

	if (posCursor > widthProgressBar * 0.9) {
		progressSeekTooltip.style.left = `${widthProgressBar * 0.9}px`
	}

	controls = null
	progressSeek = null
	progressSeekTooltip = null
}

const updateBuffered = _ => {
	let progress = _io_q('.controls').querySelector('.progress')
	let { video, audio } = getMedia()

	if (isEmpty(hls)) {
		if (video.buffered.length > 0) {
			let videoLastBuffered = video.buffered.end(video.buffered.length - 1)
			let audioLastBuffered =
				audio && audio.buffered.length > 0 ? audio.buffered.end(audio.buffered.length - 1) : null
			let minBuffered = audioLastBuffered ? getMin(videoLastBuffered, audioLastBuffered) : videoLastBuffered
			progress.style.setProperty('--buffered', `${convertToProc(minBuffered, ~~video.duration)}%`)
		}
	}

	progress = null
	audio = null
	video = null
}

const skipAhead = event => {
	let progress = _io_q('.controls').querySelector('.progress')
	let progressSeek = progress.querySelector('.progress__seek')
	let video = _io_q('video')
	const skipTo = event.target.dataset.seek ? event.target.dataset.seek : event.target.value

	video.currentTime = skipTo
	progress.style.setProperty('--progress', `${convertToProc(skipTo, ~~video.duration)}%`)
	progressSeek.value = skipTo

	isSync = false

	event.target.blur()

	progress = null
	progressSeek = null
	video = null
}

const toggleMuteEl = el => {
	let volumeSeek = _io_q('.controls').querySelector('.volume__seek')

	el.muted = !el.muted

	if (el.muted) {
		volumeSeek.setAttribute('data-volume', volumeSeek.value)
		volumeSeek.value = 0
	} else volumeSeek.value = volumeSeek.dataset.volume

	volumeSeek = null
}

const toggleMuteVideoPlayer = _ => {
	let { video, audio } = getMedia()

	audio ? toggleMuteEl(audio) : toggleMuteEl(video)

	video = null
	audio = null
}

const startDecorationLoad = _ => {
	let { video, audio } = getMedia()

	let timeoutDecorationLoad = setTimeout(_ => {
		let conditionDecorationLoad = audio ? video.readyState > 2 && audio.readyState > 2 : video.readyState > 2

		video = null
		audio = null

		if (conditionDecorationLoad) {
			clearTimeout(timeoutDecorationLoad)
			hideDecoration('load')
			return
		}

		showDecoration('load', false)
	}, 150)
}

const skipSegmentSB = _ => {
	const { disableSponsorblock } = storage.settings

	if (disableSponsorblock) return

	let video = _io_q('video')

	if (isPlaying(video)) {
		for (let index = 0, { length } = segmentsSB; index < length; index += 1) {
			const segmentSB = segmentsSB[index]
			if (video.currentTime >= segmentSB.startTime && video.currentTime <= segmentSB.endTime) {
				video.currentTime = segmentSB.endTime
				isSync = false

				if (notifySkipSegment) showToast('info', 'Segment is skipped!')
			}
		}
	}

	video = null
}

const handlePlaying = _ => {
	playVideoPlayer()
	hideDecoration('load')
}

const handleLoadingVideo = _ => {
	let { video, audio } = getMedia()

	if (audio && !isPlaying(video)) audio.pause()

	startDecorationLoad()

	audio = null
	video = null
}

const handleLoadingAudio = _ => {
	let { video, audio } = getMedia()

	if (!isPlaying(audio)) video.pause()

	startDecorationLoad()

	audio = null
	video = null
}

const handleTimeUpdate = _ => {
	let { video, audio } = getMedia()

	if (!isSync && isPlaying(audio) && isPlaying(video)) syncMedia()

	updateTimeElapsed()
	updateProgress()

	doesSkipSegments && skipSegmentSB()

	audio = null
	video = null
}

const handleAbort = _ => {
	let { video, audio } = getMedia()
	let winActive = _io_q('.main__content').querySelector('.win._active')

	if (winActive && winActive.classList.contains('video')) {
		showToast('error', 'Video is aborted (')
		pauseEl(video)
		pauseEl(audio)
	}

	winActive = null
	audio = null
	video = null
}

const handleError = _ => {
	let { video, audio } = getMedia()
	let errorMsg = video.error ? video.error.message : audio.error.message

	showToast('error', errorMsg)
	pauseEl(video)
	pauseEl(audio)

	audio = null
	video = null
}

const handleClickTimecode = e => {
	if (e.target.classList.contains('timecode')) {
		let timecode = e.target
		_io_q('video').currentTime = convertDurationToSeconds(timecode.textContent)
		isSync = false
		document.activeElement.blur()
		scrollToTop()
	}
}

const handleInputVolumeSeek = _ => {
	let { video, audio } = getMedia()

	audio ? updateVolumeEl(audio) : updateVolumeEl(video)

	audio = null
	video = null
}

const handleEnd = _ => {
	let { video, audio } = getMedia()

	audio && (audio.currentTime = 0)
	video.currentTime = 0

	audio = null
	video = null
}

const handleMouseMoveProgressSeek = event => {
	let video = _io_q('video')

	const duration = isEmpty(hls) ? +event.target.getAttribute('max') : Math.floor(video.currentTime)
	const skipTo = ~~((event.offsetX / event.target.clientWidth) * duration)
	const rectVideo = video.getBoundingClientRect()
	const widthProgressBar = video.offsetWidth - 40
	const posCursor = event.pageX - rectVideo.left - 20

	const params = { duration, skipTo, widthProgressBar, posCursor }

	updateStoryboard(params)
	updateSeekTooltip(params)

	video = null
}

const handleKeyDownWithinVideo = e => {
	if (_io_q('.video').classList.contains('_active') && (hasFocus(_io_q('body')) || hasFocus(null))) {
		// ENTER || SPACE
		if (e.keyCode === 13 || e.keyCode === 32) togglePlay()

		// ARROW LEFT
		if (e.keyCode === 37) backwardTime()

		// ARROW RIGHT
		if (e.keyCode === 39) forwardTime()

		// M
		if (e.keyCode === 77) toggleMuteVideoPlayer()

		// S
		if (e.keyCode === 83) recordSegmentSB()

		// V
		if (e.keyCode === 86 && !disableSponsorblock) {
			doesSkipSegments = !doesSkipSegments
			showToast(
				'info',
				doesSkipSegments ? 'Sponsorblock is disabled on this video' : 'Sponsorblock is enabled again'
			)
		}

		// F
		if (e.keyCode === 70) toggleFullscreen()
	}
}

const forwardTime = _ => {
	_io_q('video').currentTime += 10
	isSync = false
}

const backwardTime = _ => {
	_io_q('video').currentTime -= 10
	isSync = false
}

const initVideoPlayer = _ => {
	const controls = _io_q('.controls')
	const controlDecorations = controls.querySelector('.controls__decorations')
	const controlsSwitch = controls.querySelector('.controls__switch')
	const timeDuration = controls.querySelector('.time__duration')
	const progress = controls.querySelector('.progress')
	const progressSeek = progress.querySelector('.progress__seek')
	const volumeSeek = controls.querySelector('.volume__seek')
	const volumeBar = controls.querySelector('.volume__bar')
	const controlsScreen = controls.querySelector('.controls__screen')
	const videoParent = _io_q('.video')
	const videoWrapper = videoParent.querySelector('.video__wrapper')
	const videoDesc = videoParent.querySelector('.desc-video-info__text')
	const video = videoWrapper.querySelector('video')
	const audio = videoWrapper.querySelector('audio')

	const { autoplay } = storage.settings

	const initVideo = _ => {
		const videoDuration = ~~video.duration
		const time = convertSecondsToDuration(videoDuration)

		initSponsorblockSegments(segmentsSB)
		progressSeek.setAttribute('max', videoDuration)
		timeDuration.textContent = time
		timeDuration.setAttribute('datetime', time)
		volumeBar.value = volumeSeek.value

		doesSkipSegments ||= true
	}

	// MEDIA LISTENERS

	if (autoplay) {
		const handleCanPlay = _ => {
			hidePoster()
			showDecoration('load', false)
		}

		video.addEventListener('canplay', handleCanPlay, { once: true })

		video.addEventListener('canplaythrough', playVideoPlayer, { once: true })
	}

	video.addEventListener('loadeddata', initVideo, { once: true })

	video.addEventListener('playing', handlePlaying)

	video.addEventListener('waiting', handleLoadingVideo)

	video.addEventListener('stalled', handleLoadingVideo)

	if (audio) {
		audio.addEventListener('playing', handlePlaying)

		audio.addEventListener('waiting', handleLoadingAudio)

		audio.addEventListener('stalled', handleLoadingAudio)
	}

	video.addEventListener('progress', updateBuffered)

	video.addEventListener('timeupdate', handleTimeUpdate)

	video.addEventListener('timeupdate', toggleIconPlayPause)

	video.addEventListener('abort', handleAbort)

	video.addEventListener('error', handleError)

	if (audio) {
		audio.addEventListener('error', handleError)

		audio.addEventListener('abort', handleAbort)
	}

	video.addEventListener('ended', handleEnd)

	volumeSeek.addEventListener('input', handleInputVolumeSeek)

	videoDesc.addEventListener('click', handleClickTimecode)

	progressSeek.addEventListener('input', skipAhead)

	controlsSwitch.addEventListener('click', togglePlay)

	controlsScreen.addEventListener('click', toggleFullscreen)

	controlDecorations.addEventListener('click', togglePlay)

	controls.addEventListener('mouseleave', hideControls)

	progressSeek.addEventListener('mousemove', handleMouseMoveProgressSeek)

	const controlsQuality = controls.querySelector('.controls__quality')

	initDropdown(controlsQuality, btn => {
		for (let index = 0, { length } = videoFormatAll; index < length; index += 1) {
			const videoFormat = videoFormatAll[index]

			if (videoFormat.qualityLabel === btn.textContent) chooseQuality(videoFormat.url)
		}
	})

	// HOT KEYS

	document.addEventListener('keydown', handleKeyDownWithinVideo)

	if (!hasListeners) {
		hasListeners = true

		initDialogSB()

		if (isEmpty(hls)) {
			const controlsSpeed = controls.querySelector('.controls__speed')

			initDropdown(controlsSpeed, btn => {
				audio && (audio.playbackRate = btn.dataset.speed)

				video.playbackRate = btn.dataset.speed

				isSync = false
			})
		}

		let timeout = null

		const handleMouseMove = _ => {
			clearTimeout(timeout)
			timeout = setTimeout(hideControls, 3000)
			showControls()
		}

		controls.addEventListener('mousemove', handleMouseMove)
	}
}

const resetVideoPlayer = _ => {
	let videoParent = _io_q('.video')
	let videoWrapper = videoParent.querySelector('.video__wrapper')
	let video = _io_q('video')
	let audio = videoWrapper.querySelector('audio')
	let controls = _io_q('.controls')
	let controlsSwitchIcon = controls.querySelector('.controls__switch svg use')
	let sponsorblock = controls.querySelector('.sponsorblock')
	let sponsorblockBtn = controls.querySelector('.controls__sponsorblock')
	let progress = controls.querySelector('.progress')
	let progressStoryboard = controls.querySelector('.progress__storyboard')
	let timeDuration = controls.querySelector('.time__duration')
	let quality = controls.querySelector('.controls__quality')
	let progressSeek = progress.querySelector('.progress__seek')
	let qualityList = quality.querySelector('.dropdown__list')
	let volumeSeek = controls.querySelector('.volume__seek')
	let controlDecorations = controls.querySelector('.controls__decorations')
	let controlsSwitch = controls.querySelector('.controls__switch')
	let controlsScreen = controls.querySelector('.controls__screen')
	let timeElapsed = controls.querySelector('.time__elapsed')
	let speed = controls.querySelector('.controls__speed')
	let speedCurrent = speed.querySelector('.dropdown__head')
	let videoDesc = videoParent.querySelector('.desc-video-info__text')

	isFirstPlay ||= true
	isSync &&= false
	doesSkipSegments ||= true

	while (sponsorblock.firstChild) sponsorblock.firstChild.remove()

	if (sponsorblockBtn.classList.contains('_record')) sponsorblockBtn.classList.remove('_record')

	while (qualityList.firstChild) qualityList.firstChild.remove()

	speedCurrent.textContent = 'x1'

	if (!isEmpty(hls)) {
		hls.detachMedia()
		hls.destroy()
		hls = null
	}

	timeDuration.textContent = '0:00'
	timeElapsed.textContent = '0:00'
	timeDuration.removeAttribute('datetime')
	timeElapsed.removeAttribute('datetime')
	progress.removeAttribute('style')

	const { disableStoryboard } = storage.settings

	if (!disableStoryboard && !progressStoryboard) progress.insertAdjacentHTML('beforeEnd', createStoryboardHTML())

	video.removeEventListener('playing', handlePlaying)

	video.removeEventListener('waiting', handleLoadingVideo)

	video.removeEventListener('stalled', handleLoadingVideo)

	if (audio) {
		audio.removeEventListener('playing', handlePlaying)

		audio.removeEventListener('waiting', handleLoadingAudio)

		audio.removeEventListener('stalled', handleLoadingAudio)
	}

	video.removeEventListener('progress', updateBuffered)

	video.removeEventListener('timeupdate', handleTimeUpdate)

	video.removeEventListener('timeupdate', toggleIconPlayPause)

	video.removeEventListener('abort', handleAbort)

	video.removeEventListener('error', handleError)

	if (audio) {
		audio.removeEventListener('error', handleError)

		audio.removeEventListener('abort', handleAbort)
	}

	video.removeEventListener('ended', handleEnd)

	volumeSeek.removeEventListener('input', handleInputVolumeSeek)

	videoDesc.removeEventListener('click', handleClickTimecode)

	progressSeek.removeEventListener('input', skipAhead)

	controlsSwitch.removeEventListener('click', togglePlay)

	controlsScreen.removeEventListener('click', toggleFullscreen)

	controlDecorations.removeEventListener('click', togglePlay)

	controls.removeEventListener('mouseleave', hideControls)

	progressSeek.removeEventListener('mousemove', handleMouseMoveProgressSeek)

	document.removeEventListener('keydown', handleKeyDownWithinVideo)

	resetMediaEl(video)

	audio
		? resetMediaEl(audio)
		: videoWrapper.insertAdjacentHTML(
				'beforeEnd',
				'<audio crossorigin="anonymous" referrerpolicy="no-referrer" preload></audio>'
		  )

	let iconPathPlay = 'img/svg/controls.svg#play'

	if (controlsSwitchIcon.getAttribute('xlink:href') !== iconPathPlay)
		controlsSwitchIcon.setAttribute('xlink:href', iconPathPlay)

	controls.hidden &&= false

	videoParent = null
	videoWrapper = null
	video = null
	audio = null
	controls = null
	controlsSwitchIcon = null
	sponsorblock = null
	sponsorblockBtn = null
	progress = null
	progressStoryboard = null
	timeDuration = null
	quality = null
	progressSeek = null
	qualityList = null
	volumeSeek = null
	controlDecorations = null
	controlsSwitch = null
	controlsScreen = null
	timeElapsed = null
	speed = null
	speedCurrent = null
	videoDesc = null
}
