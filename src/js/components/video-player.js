let videoFormatAll = null
let hasListeners = false

const resetMediaEl = el => {
	el.pause()
	el.removeAttribute('src');
	el.load()
}

const initVideoPlayer = _ => {
	const controls = _io_q('.controls')
	const controlDecorations = controls.querySelector('.controls__decorations')
	const controlsSwitch = controls.querySelector('.controls__switch')
	const controlsSwitchIcon = controls.querySelector('.controls__switch svg use')
	const timeElapsed = controls.querySelector('.time__elapsed')
	const timeDuration = controls.querySelector('.time__duration')
	const progress = controls.querySelector('.progress')
	const progressSeek = progress.querySelector('.progress__seek')
	const progressSeekTooltip = progress.querySelector('.progress__seek-tooltip')
	const progressStoryboard = progress.querySelector('.progress__storyboard')
	const volumeSeek = controls.querySelector('.volume__seek')
	const volumeBar = controls.querySelector('.volume__bar')
	const controlsScreen = controls.querySelector('.controls__screen')
	const controlsSponsorblock = controls.querySelector('.controls__sponsorblock')
	const videoWrapper = _io_q('.video').querySelector('.video__wrapper')
	const videoDesc = _io_q('.video').querySelector('.desc-video-info__text')
	const video = videoWrapper.querySelector('video')
	const audio = videoWrapper.querySelector('audio')
	const dialogSb = _io_q('.dialog-sb')
	const dialogSbStart = dialogSb.querySelector('input#start')
	const dialogSbEnd = dialogSb.querySelector('input#end')
	const dialogSbWarning = dialogSb.querySelector('.dialog-sb__warning')
	const dialogSbBtnSend = dialogSb.querySelector('.dialog-sb__btn_send')
	const dialogSbBtnCancel = dialogSb.querySelector('.dialog-sb__btn_cancel')

	let doesSkipSegments = true;

	let iconPathPlay = 'img/svg/controls.svg#play'
	let iconPathPause = 'img/svg/controls.svg#pause'

	let isSync = false

	let startTime = null
	let endTime = null
	let isRecording = false

	const initSponsorblockSegments = data => {
		let progressSponsorblock = progress.querySelector('.progress__sponsorblock')
		let sponsorblockItemAll = progressSponsorblock.querySelectorAll('.sponsorblock__item');

		for (let index = 0, length = sponsorblockItemAll.length; index < length; index++) {
			const sponsorblockItem = sponsorblockItemAll[index];
			const { startTime, endTime, videoDuration } = data[index]
			const segmentLength = endTime - startTime;
			const vDuration = videoDuration !== 0 ? videoDuration : ~~(video.duration)
			const sponsorblockItemWidth = convertToProc(segmentLength, vDuration)
			const sponsorblockItemLeft = convertToProc(startTime, vDuration)
			sponsorblockItem.style.setProperty('--width', `${sponsorblockItemWidth}%`);
			sponsorblockItem.style.setProperty('--left', `${sponsorblockItemLeft}%`);
		}

		progressSponsorblock = null
		sponsorblockItemAll = null
	}

	const onCloseModal = _ => {
		togglePlay()
		resetDialogSB()

		dialogSbStart.removeEventListener('input', handleInputDialogField);
		dialogSbEnd.removeEventListener('input', handleInputDialogField);
	}

	const modal = new GraphModal({ isClose: onCloseModal })

	const changeVideoSrc = (url, currentTime) => {
		if (isEmpty(hls)) {
			video.removeAttribute('src');
			video.load()
			video.src = url;
		} else hls.loadSource(url)

		video.currentTime = currentTime
	}

	const chooseQuality = async url => {
		const currentTime = video.currentTime

		if (!video.paused) {
			pauseVideo()
			pauseAudio()
			changeVideoSrc(url, currentTime)
			await playVideo()
		} else
			changeVideoSrc(url, currentTime)

		isSync = false
	}

	const syncMedia = _ => {
		if (!isSync) {
			audio.currentTime = video.currentTime
			isSync = true
		}
	}

	const isPlaying = el => el && !el.paused && !el.ended && el.currentTime > 0 && el.readyState > 2;

	const isPlayingVideo = _ => isPlaying(video)

	const isPlayingAudio = _ => isPlaying(audio)

	const isPlayingLight = el => el && !el.paused && !el.ended && el.currentTime > 0;

	const pauseEl = el => {
		if (isPlayingLight(el)) {
			el.pause()
			hideDecoration('load')
		}
	}

	const pauseVideo = _ => pauseEl(video)

	const pauseAudio = _ => pauseEl(audio)

	const playEl = async el => {
		if (el) {
			let playPromise = el.play();

			if (playPromise !== undefined && !isPlaying(el)) {
				try {
					await playPromise

					if (audio) {
						if (isPlayingVideo() && isPlayingAudio())
							syncMedia()
					}
				} catch (error) {
					showToast('error', error.message)
				}
			}
		}
	}

	const playAudio = _ => playEl(audio)

	const playVideo = _ => playEl(video)

	const hideDecoration = action => {
		let icon = controlDecorations.querySelector(`#${action}`);

		if (!icon.hidden) {
			const afterRemoveDecoration = _ => {
				icon.hidden ||= true
				icon = null
			}

			const removeDecoration = _ => {
				if (icon.classList.contains('_active'))
					icon.classList.remove('_active')

				setTimeout(afterRemoveDecoration, 300);
			}

			setTimeout(removeDecoration, 300)
		}
	}

	const showDecoration = (action, doHide) => {
		let icon = controlDecorations.querySelector(`#${action}`);

		if (icon.hidden) {
			icon.hidden = false

			const activeDecoration = _ => {
				if (!icon.classList.contains('_active'))
					icon.classList.add('_active')

				if (!doHide) icon = null
			}

			setTimeout(activeDecoration, 15);

			doHide && hideDecoration(action)
		}
	}

	const hidePoster = _ => {
		let videoPoster = videoWrapper.querySelector('.video__poster')

		if (!videoPoster.classList.contains('_hidden'))
			videoPoster.classList.add('_hidden');

		videoPoster = null
	}

	const playVideoPlayer = async _ => {
		await playVideo()
		await playAudio()

		showDecoration('play', true)
	}

	const pauseVideoPlayer = _ => {
		pauseVideo()
		pauseAudio()

		showDecoration('pause', true)
	}

	const togglePlay = async _ => {
		if (audio) {
			video.paused && audio.paused
				? playVideoPlayer()
				: pauseVideoPlayer()
		} else {
			video.paused ? playVideoPlayer() : pauseVideoPlayer()
		}

		hidePoster()
		isSync = false
	}

	const initVideo = _ => {
		const videoDuration = ~~(video.duration)
		const time = convertSecondsToDuration(videoDuration)

		initSponsorblockSegments(segmentsSB)
		progressSeek.setAttribute('max', videoDuration);
		timeDuration.textContent = time;
		timeDuration.setAttribute('datetime', time)
		volumeBar.value = volumeSeek.value

		doesSkipSegments ||= true
	}

	const changeIcon = iconPath => { controlsSwitchIcon.setAttribute('xlink:href', iconPath) }

	const showIconPlay = _ => { changeIcon(iconPathPlay) }

	const showIconPause = _ => { changeIcon(iconPathPause) }

	const toggleIconPlayPause = _ => { video.paused ? showIconPlay() : showIconPause() }

	const onEndVideo = _ => {
		audio.currentTime &&= 0
		video.currentTime = 0
	}

	const updateTimeElapsed = _ => {
		const time = convertSecondsToDuration(~~(video.currentTime));

		timeElapsed.textContent = time;
		timeElapsed.setAttribute('datetime', time)
	}

	const updateProgress = _ => {
		progressSeek.value = Math.floor(video.currentTime);
		progress.style.setProperty('--progress',
			`${convertToProc(Math.floor(video.currentTime), ~~(video.duration))}%`);
	}

	const updateStoryboard = params => {

		if (progressStoryboard && isEmpty(hls)) {
			const { skipTo, widthProgressBar, posCursor } = params
			const { posX, posY } = getPosStroryboard(video.duration, skipTo, 100)

			progressStoryboard.style.setProperty('--posX', `-${posX}px`)
			progressStoryboard.style.setProperty('--posY', `-${posY}px`)

			if (posCursor < widthProgressBar * 0.1) {
				progressStoryboard.style.left = `${widthProgressBar * 0.1}px`;
			}
			if (posCursor > widthProgressBar * 0.1 &&
				posCursor < widthProgressBar * 0.9) {
				progressStoryboard.style.left = `${posCursor}px`;
			}

			if (posCursor > widthProgressBar * 0.9) {
				progressStoryboard.style.left = `${widthProgressBar * 0.9}px`;
			}
		}
	}

	const updateSeekTooltip = params => {
		const { duration, skipTo, widthProgressBar, posCursor } = params

		if (skipTo > 0 && skipTo < Math.floor(duration)) {
			const t = convertSecondsToDuration(skipTo);
			progressSeek.setAttribute('data-seek', skipTo)
			progressSeekTooltip.textContent = t;
		}

		if (posCursor < widthProgressBar * 0.1) {
			progressSeekTooltip.style.left = `${widthProgressBar * 0.1}px`;
		}

		if (posCursor > widthProgressBar * 0.1 &&
			posCursor < widthProgressBar * 0.9) {
			progressSeekTooltip.style.left = `${posCursor}px`;
		}

		if (posCursor > widthProgressBar * 0.9) {
			progressSeekTooltip.style.left = `${widthProgressBar * 0.9}px`;
		}
	}

	const updateBuffered = _ => {
		if (isEmpty(hls)) {
			if (video.buffered.length > 0) {
				let videoLastBuffered = video.buffered.end(video.buffered.length - 1)
				let audioLastBuffered = audio && audio.buffered.length > 0
					? audio.buffered.end(audio.buffered.length - 1)
					: null
				let minBuffered = audioLastBuffered
					? getMin(videoLastBuffered, audioLastBuffered)
					: videoLastBuffered
				progress.style.setProperty('--buffered', `${convertToProc(minBuffered, ~~(video.duration))}%`)
			}
		}
	}

	const skipAhead = event => {
		const skipTo = event.target.dataset.seek ? event.target.dataset.seek : event.target.value;

		video.currentTime = skipTo;
		progress.style.setProperty('--progress', `${convertToProc(skipTo, ~~(video.duration))}%`)
		progressSeek.value = skipTo;

		isSync = false

		event.target.blur()
	}

	const updateVolumeEl = el => {
		el.muted &&= false;

		el.volume = volumeSeek.value;
		volumeBar.value = volumeSeek.value
	}

	const updateVolumeVideo = _ => updateVolumeEl(video)

	const updateVolumeAudio = _ => updateVolumeEl(audio)

	const toggleMuteEl = el => {
		el.muted = !el.muted;

		if (el.muted) {
			volumeSeek.setAttribute('data-volume', volumeSeek.value);
			volumeSeek.value = 0;
		} else
			volumeSeek.value = volumeSeek.dataset.volume;
	}

	const toggleMuteAudio = _ => toggleMuteEl(audio)

	const toggleMuteVideo = _ => toggleMuteEl(video)

	const toggleFullscreen = _ => {
		document.fullscreenElement
			? document.exitFullscreen()
			: videoWrapper.requestFullscreen()
	}

	const hideControls = _ => {
		let dropdownActive = controls.querySelector('.dropdown._active');
		let controlsBar = controls.querySelector('.controls__bar')

		if (!dropdownActive)
			controlsBar.classList.remove('_opened');

		dropdownActive = null
		controlsBar = null
	}

	const showControls = _ => {
		let controlsBar = controls.querySelector('.controls__bar')

		controlsBar.classList.add('_opened');

		controlsBar = null
	}

	const resetDialogSB = _ => {
		if (dialogSbStart.classList.contains('_error')) {
			dialogSbStart.classList.remove('_error')
			dialogSbEnd.classList.remove('_error')
			dialogSbWarning.hidden = true
		}
	}

	const invalidInputData = _ => {
		dialogSbStart.classList.add('_error')
		dialogSbEnd.classList.add('_error')
		dialogSbWarning.hidden = false
		dialogSbStart.focus()
	}

	const skipSegmentSB = _ => {
		if (isPlayingVideo()) {
			for (let index = 0, length = segmentsSB.length; index < length; index++) {
				const segmentSB = segmentsSB[index];
				if (video.currentTime >= segmentSB.startTime
					&& video.currentTime <= segmentSB.endTime) {
					video.currentTime = segmentSB.endTime;
					isSync = false

					if (storage.settings.notifySkipSegment)
						showToast('info', 'Segment is skipped!')
				}
			}
		}
	}

	const handleInputDialogField = e => {
		let dialogSbField = e.target
		resetDialogSB()
		dialogSbField.value = formatDuration(dialogSbField.value)

		dialogSbField = null
	}

	const showDialogSB = _ => {
		if (document.fullscreenElement)
			toggleFullscreen()

		togglePlay()
		resetDialogSB()
		dialogSbStart.value = startTime
		dialogSbEnd.value = endTime
		modal.open('dialog-sb')

		dialogSbStart.addEventListener('input', handleInputDialogField);
		dialogSbEnd.addEventListener('input', handleInputDialogField);
	}

	const recordSegmentSB = _ => {
		if (isPlayingVideo()) {
			if (!isRecording) {
				startTime = timeElapsed.textContent
				isRecording = true
				controlsSponsorblock.classList.add('_record')
				showToast('info', 'Recording of segment is started...')
			} else {
				endTime = timeElapsed.textContent
				isRecording = false
				controlsSponsorblock.classList.remove('_record')

				showDialogSB()
			}
		} else showToast('error', 'You must play video!')
	}

	const isValidFields = _ => {
		let patternTimecodeMSS = new RegExp(/^[0-9]:[0-5][0-9]$/g)
		let patternTimecodeMMSS = new RegExp(/^[0-5][0-9]:[0-5][0-9]$/g)
		let patternTimecodeHMMSS = new RegExp(/^[0-9]:[0-5][0-9]:[0-5][0-9]$/g)
		let patternTimecodeHHMMSS = new RegExp(/^[0-2][0-3]:[0-5][0-9]:[0-5][0-9]$/g)

		return (dialogSbStart.value.match(patternTimecodeHHMMSS) && dialogSbEnd.value.match(patternTimecodeHHMMSS)
			|| dialogSbStart.value.match(patternTimecodeHMMSS) && dialogSbEnd.value.match(patternTimecodeHMMSS)
			|| dialogSbStart.value.match(patternTimecodeMMSS) && dialogSbEnd.value.match(patternTimecodeMMSS)
			|| dialogSbStart.value.match(patternTimecodeMSS) && dialogSbEnd.value.match(patternTimecodeMSS))
			&& convertDurationToSeconds(dialogSbStart.value) < convertDurationToSeconds(dialogSbEnd.value)
			&& convertDurationToSeconds(dialogSbEnd.value) <= convertDurationToSeconds(timeDuration.textContent)
	}

	const sendSegmentSB = async _ => {
		let videoId = _io_q('.video').dataset.id
		let dialogSbCategory = dialogSb.querySelector('input[name="category"]:checked')

		if (isValidFields()) {
			let startTime = convertDurationToSeconds(dialogSbStart.value)
			let endTime = convertDurationToSeconds(dialogSbEnd.value)
			let category = dialogSbCategory.id
			let segment = { startTime, endTime, category }

			try {
				await API.postSponsorblockInfo(videoId, uuidv4(), segment)
				modal.close()
				showToast('good', 'Segment was sent successfully!')
			} catch (error) {
				showToast('error', error.message)
			} finally {
				startTime = null
				endTime = null
				dialogSbCategory = null
			}

		} else invalidInputData()
	}

	// MEDIA LISTENERS

	if (storage.settings.autoplay) {

		const handleCanPlay = _ => {
			hidePoster()
			showDecoration('load', false)
		}

		video.addEventListener('canplay', handleCanPlay, { once: true });

		video.addEventListener('canplaythrough', playVideoPlayer, { once: true });
	}

	video.addEventListener('loadeddata', initVideo, { once: true });

	const handlePlaying = _ => {
		playVideoPlayer()
		hideDecoration('load')
	}

	video.addEventListener('playing', handlePlaying)

	const startDecorationLoad = _ => {
		let timeoutDecorationLoad = setTimeout(_ => {
			if (video.readyState > 2 &&
				audio.readyState > 2) {
				clearTimeout(timeoutDecorationLoad)
				hideDecoration('load')
				return
			}

			showDecoration('load', false)
		}, 150);
	}

	const handleLoadingVideo = _ => {
		if (!isPlayingVideo())
			audio.pause()

		startDecorationLoad()
	}

	video.addEventListener('waiting', handleLoadingVideo)

	video.addEventListener('stalled', handleLoadingVideo);

	if (audio) {

		audio.addEventListener('playing', handlePlaying)

		const handleLoadingAudio = _ => {
			if (!isPlayingAudio())
				video.pause()

			startDecorationLoad()
		}

		audio.addEventListener('waiting', handleLoadingAudio)

		audio.addEventListener('stalled', handleLoadingAudio);
	}

	video.addEventListener('progress', updateBuffered);

	const handleTimeUpdate = _ => {
		if (!isSync && isPlayingAudio() && isPlayingVideo())
			syncMedia()

		updateTimeElapsed()
		updateProgress()

		if (doesSkipSegments && !storage.settings.disableSponsorblock)
			skipSegmentSB()
	}

	video.addEventListener('timeupdate', handleTimeUpdate);
	video.addEventListener('timeupdate', toggleIconPlayPause);

	const handleAbort = _ => {
		let winActive = _io_q('.main__content').querySelector('.win._active')

		if (winActive && winActive.classList.contains('video')) {
			showToast('error', 'Video is aborted ;(')
			pauseVideo()
			pauseAudio()
		}

		winActive = null
	}

	video.addEventListener('abort', handleAbort);

	const handleError = _ => {
		let errorMsg = video.error ? video.error.message : audio.error.message
		showToast('error', errorMsg)
		pauseVideo()
		pauseAudio()
	}

	video.addEventListener('error', handleError);

	if (audio) {

		audio.addEventListener('error', handleError);

		audio.addEventListener('abort', handleAbort);
	}

	video.addEventListener('ended', onEndVideo)

	// CONTROLS LISTENERS

	const controlsQuality = controls.querySelector('.controls__quality')

	initDropdown(controlsQuality, btn => {
		for (let index = 0, length = videoFormatAll.length; index < length; index++) {
			const videoFormat = videoFormatAll[index];

			if (videoFormat.qualityLabel === btn.textContent)
				chooseQuality(videoFormat.url)
		}
	})

	if (!hasListeners) {
		hasListeners = true

		if (isEmpty(hls)) {
			const controlsSpeed = controls.querySelector('.controls__speed')

			initDropdown(controlsSpeed, btn => {
				audio.playbackRate &&= btn.dataset.speed

				video.playbackRate = btn.dataset.speed

				isSync = false
			})
		}

		const handleInputVolumeSeek = _ => { audio ? updateVolumeAudio() : updateVolumeVideo() }

		volumeSeek.addEventListener('input', handleInputVolumeSeek);

		const handleMouseMoveProgressSeek = event => {
			const duration = isEmpty(hls) ? +event.target.getAttribute('max') : Math.floor(video.currentTime)
			const skipTo = ~~((event.offsetX / event.target.clientWidth) * duration);
			const rectVideo = video.getBoundingClientRect();
			const widthProgressBar = video.offsetWidth - 40
			const posCursor = event.pageX - rectVideo.left - 20

			const params = { duration, skipTo, widthProgressBar, posCursor }

			updateStoryboard(params)
			updateSeekTooltip(params)
		}

		progressSeek.addEventListener('mousemove', handleMouseMoveProgressSeek);

		progressSeek.addEventListener('input', skipAhead);

		controlsSwitch.addEventListener('click', togglePlay);

		controlsScreen.addEventListener('click', toggleFullscreen);

		controlDecorations.addEventListener('click', togglePlay);

		controls.addEventListener('mouseleave', hideControls);

		let timeout = null;

		const handleMouseMove = _ => {
			clearTimeout(timeout);
			timeout = setTimeout(hideControls, 3000)
			showControls()
		}

		controls.addEventListener('mousemove', handleMouseMove);

		controlsSponsorblock.addEventListener('click', recordSegmentSB);

		dialogSbBtnSend.addEventListener('click', sendSegmentSB);

		dialogSbBtnCancel.addEventListener('click', _ => { modal.close() });

		const handleClickTimecode = e => {
			if (e.target.classList.contains('timecode')) {
				let timecode = e.target
				video.currentTime = convertDurationToSeconds(timecode.textContent)
				isSync = false
				document.activeElement.blur()
				scrollToTop()
			}
		}

		videoDesc.addEventListener('click', handleClickTimecode)

		// HOT KEYS

		const handleKeyDownWithinVideo = e => {
			if (_io_q('.video').classList.contains('_active')
				&& (document.activeElement === _io_q('body')
					|| document.activeElement === null)) {

				// ENTER || SPACE
				if (e.keyCode === 13 || e.keyCode === 32)
					togglePlay()

				// ARROW LEFT
				if (e.keyCode === 37) {
					video.currentTime -= 10
					isSync = false
				}

				// ARROW RIGHT
				if (e.keyCode === 39) {
					video.currentTime += 10
					isSync = false
				}

				// M
				if (e.keyCode === 77)
					audio ? toggleMuteAudio() : toggleMuteVideo()

				// S
				if (e.keyCode === 83 && !storage.settings.disableSponsorblock)
					recordSegmentSB()

				// V
				if (e.keyCode === 86 && !storage.settings.disableSponsorblock) {
					doesSkipSegments = !doesSkipSegments
					showToast(
						'info',
						doesSkipSegments
							? 'Sponsorblock is disabled on this video'
							: 'Sponsorblock is enabled again'
					)
				}

				// F
				if (e.keyCode === 70)
					toggleFullscreen()
			}
		}

		document.addEventListener('keydown', handleKeyDownWithinVideo);
	}
}

const resetVideoPlayer = _ => {
	let video = _io_q('.video')
	let videoWrapper = video.querySelector('.video__wrapper');
	let videoInstance = videoWrapper.querySelector('video');
	let audioInstance = videoWrapper.querySelector('audio');
	let controls = video.querySelector('.controls');
	let controlsSwitchIcon = controls.querySelector('.controls__switch svg use');
	let sponsorblock = controls.querySelector('.sponsorblock');
	let sponsorblockBtn = controls.querySelector('.controls__sponsorblock');
	let progress = controls.querySelector('.progress');
	let progressStoryboard = controls.querySelector('.progress__storyboard');
	let timeDuration = controls.querySelector('.time__duration');
	let quality = controls.querySelector('.controls__quality');
	let qualityList = quality.querySelector('.dropdown__list');
	let timeElapsed = controls.querySelector('.time__elapsed');
	let speed = controls.querySelector('.controls__speed');
	let speedCurrent = speed.querySelector('.dropdown__head');

	let videoId = video.dataset.id
	let watchedTime = videoInstance.currentTime

	if (watchedTime > 0 && watchedTime < videoInstance.duration)
		rememberWatchedTime(videoId, watchedTime)

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

	timeDuration.textContent = '0:00';
	timeElapsed.textContent = '0:00';
	timeDuration.removeAttribute('datetime')
	timeElapsed.removeAttribute('datetime')
	progress.removeAttribute('style')

	if (!storage.settings.disableStoryboard && !progressStoryboard)
		progress.insertAdjacentHTML('beforeEnd', createStoryboardHTML())

	resetMediaEl(videoInstance)

	audioInstance
		? resetMediaEl(audioInstance)
		: videoWrapper.insertAdjacentHTML('afterBegin',
			'<audio crossorigin="anonymous" referrerpolicy="no-referrer" preload></audio>')

	let iconPathPlay = 'img/svg/controls.svg#play'

	if (controlsSwitchIcon.getAttribute('xlink:href') !== iconPathPlay)
		controlsSwitchIcon.setAttribute('xlink:href', iconPathPlay);

	controls.hidden &&= false

	video = null
	audioInstance = null
	videoWrapper = null
	progress = null
	sponsorblock = null
	sponsorblockBtn = null
	quality = null
	qualityList = null
	timeDuration = null
	timeElapsed = null
	controls = null
	controlsSwitchIcon = null
	speed = null
	speedCurrent = null
}
