let videoFormatAll = null
let hasListeners = false

const resetMediaEl = el => {
	el.pause()
	el.removeAttribute('src');
	el.load()
}

const initVideoPlayer = _ => {
	let controls = _io_q('.controls'),
		controlsPlay = controls.querySelector('.controls__play'),
		controlsSwitch = controls.querySelector('.controls__switch'),
		controlsSwitchIcon = controls.querySelector('.controls__switch svg use'),
		timeElapsed = controls.querySelector('.time__elapsed'),
		timeDuration = controls.querySelector('.time__duration'),
		progress = controls.querySelector('.progress'),
		progressSeek = progress.querySelector('.progress__seek'),
		progressSeekTooltip = progress.querySelector('.progress__seek-tooltip'),
		progressSponsorblock = progress.querySelector('.progress__sponsorblock'),
		volumeSeek = controls.querySelector('.volume__seek'),
		volumeBar = controls.querySelector('.volume__bar'),
		speed = controls.querySelector('.speed'),
		quality = controls.querySelector('.quality'),
		controlsScreenOpen = controls.querySelector('.controls__screen_open'),
		controlsScreenClose = controls.querySelector('.controls__screen_close'),
		controlsBar = controls.querySelector('.controls__bar'),
		controlsSponsorblock = controls.querySelector('.controls__sponsorblock'),
		videoWrapper = _io_q('.video').querySelector('.video__wrapper'),
		videoDesc = _io_q('.video').querySelector('.desc-video-info__text'),
		videoPoster = videoWrapper.querySelector('.video__poster'),
		video = videoWrapper.querySelector('video'),
		audio = videoWrapper.querySelector('audio'),
		dialogSb = _io_q('.dialog-sb'),
		dialogSbStart = dialogSb.querySelector('input#start'),
		dialogSbEnd = dialogSb.querySelector('input#end'),
		dialogSbWarning = dialogSb.querySelector('.dialog-sb__warning'),
		dialogSbBtnSend = dialogSb.querySelector('.dialog-sb__btn_send'),
		dialogSbBtnCancel = dialogSb.querySelector('.dialog-sb__btn_cancel');

	let doesSkipSegments = true;

	let iconPathPlay = 'img/svg/controls.svg#play',
		iconPathPause = 'img/svg/controls.svg#pause';

	let isSync = false

	let startTime = null
	let endTime = null
	let isRecording = false

	const initSponsorblockSegments = data => {
		let sponsorblockItemAll = progressSponsorblock.querySelectorAll('.sponsorblock__item');

		for (let index = 0, length = sponsorblockItemAll.length; index < length; index++) {
			const sponsorblockItem = sponsorblockItemAll[index];
			const { startTime, endTime, videoDuration } = data[index]
			const segmentLength = endTime - startTime;
			const vDuration = videoDuration !== 0 ? videoDuration : Math.round(video.duration)
			const sponsorblockItemWidth = convertToProc(segmentLength, vDuration)
			const sponsorblockItemLeft = convertToProc(startTime, vDuration)
			sponsorblockItem.style.setProperty('--width', `${sponsorblockItemWidth}%`);
			sponsorblockItem.style.setProperty('--left', `${sponsorblockItemLeft}%`);
		}

		sponsorblockItemAll = null
	}

	const onCloseModal = _ => {
		togglePlay()
		resetDialogSB()
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

	const chooseQuality = url => {
		const currentTime = video.currentTime

		if (!video.paused) {
			pauseVideo()
			pauseAudio()
			changeVideoSrc(url, currentTime)
			playVideo()
		} else
			changeVideoSrc(url, currentTime)

		isSync = false
	}

	if (isEmpty(hls)) {
		initDropdown(speed, btn => {
			if (audio) audio.playbackRate = btn.dataset.speed

			video.playbackRate = btn.dataset.speed

			isSync = false
		})
	}

	initDropdown(quality, btn => {
		for (let index = 0, length = videoFormatAll.length; index < length; index++) {
			const videoFormat = videoFormatAll[index];

			if (videoFormat.qualityLabel === btn.textContent)
				chooseQuality(videoFormat.url)
		}
	})

	const syncMedia = _ => {
		audio.currentTime = video.currentTime
		isSync = true
	}

	const isPlaying = el => el && !el.paused && !el.ended && el.currentTime > 0 && el.readyState > 2;

	const isPlayingVideo = _ => isPlaying(video)

	const isPlayingAudio = _ => isPlaying(audio)

	const pauseEl = el => { if (isPlaying(el)) el.pause() }

	const pauseVideo = _ => pauseEl(video)

	const pauseAudio = _ => pauseEl(audio)

	const playEl = el => {
		if (el) {
			let playPromise = el.play();

			if (playPromise !== undefined && !isPlaying(el)) {
				playPromise
					.then(_ => {
						if (audio) {
							if (isPlayingVideo() && isPlayingAudio())
								syncMedia()
						}
					})
					.catch(error => { showToast('error', error.message) });
			}
		}
	}

	const playAudio = _ => playEl(audio)

	const playVideo = _ => playEl(video)

	const togglePlay = _ => {
		if (!isPlayingVideo()) {
			playVideo()
			playAudio()
		} else {
			pauseVideo()
			pauseAudio()
		}

		toggleIconPlayPause()
		isSync = false
	}

	const initVideo = _ => {
		const videoDuration = Math.round(video.duration),
			time = normalizeDuration(videoDuration);

		initSponsorblockSegments(segmentsSB)
		progressSeek.setAttribute('max', videoDuration);
		timeDuration.textContent = time;
		timeDuration.setAttribute('datetime', time)
		volumeBar.value = volumeSeek.value

		doesSkipSegments ||= true

		if (!videoPoster.classList.contains('_hidden'))
			videoPoster.classList.add('_hidden');
	}

	const changeIcon = iconPath => { controlsSwitchIcon.setAttribute('xlink:href', iconPath) }

	const showIconPlay = _ => { changeIcon(iconPathPlay) }

	const showIconPause = _ => { changeIcon(iconPathPause) }

	const toggleIconPlayPause = _ => { video.paused ? showIconPlay() : showIconPause() }

	const onEndVideo = _ => {
		if (audio)
			audio.currentTime = 0

		video.currentTime = 0
	}

	const updateTimeElapsed = _ => {
		const time = normalizeDuration(Math.round(video.currentTime));

		timeElapsed.textContent = time;
		timeElapsed.setAttribute('datetime', time)
	}

	const updateProgress = _ => {
		progressSeek.value = Math.floor(video.currentTime);
		progress.style.setProperty('--progress',
			`${convertToProc(Math.floor(video.currentTime), Math.round(video.duration))}%`);
	}

	const updateSeekTooltip = event => {
		const duration = isEmpty(hls) ? +event.target.getAttribute('max') : Math.floor(video.currentTime)
		const skipTo = Math.round((event.offsetX / event.target.clientWidth) * duration);

		if (skipTo > 0 && skipTo < Math.floor(duration)) {
			const t = normalizeDuration(skipTo);
			progressSeek.setAttribute('data-seek', skipTo)
			progressSeekTooltip.textContent = t;
		}

		const rect = video.getBoundingClientRect();
		const widthProgressBar = video.offsetWidth - 40
		const posCursor = event.pageX - rect.left

		if (posCursor < widthProgressBar * 0.1)
			progressSeekTooltip.style.left = `${widthProgressBar * 0.1}px`;

		if (posCursor > widthProgressBar * 0.1 &&
			posCursor < widthProgressBar * 0.9)
			progressSeekTooltip.style.left = `${posCursor}px`;

		if (posCursor > widthProgressBar * 0.9)
			progressSeekTooltip.style.left = `${widthProgressBar * 0.9}px`;

	}

	const updateBuffered = _ => {
		if (isEmpty(hls)) {
			let vbuffered = video.buffered

			if (audio) {
				let abuffered = audio.buffered
				let minBuffered = getMin(vbuffered.end(vbuffered.length - 1), abuffered.end(abuffered.length - 1))

				progress.style.setProperty('--buffered', `${convertToProc(minBuffered, Math.round(video.duration))}%`)
			} else {
				progress.style.setProperty('--buffered',
					`${convertToProc(vbuffered.end(vbuffered.length - 1), Math.round(video.duration))}%`)
			}
		}
	}

	const skipAhead = event => {
		const skipTo = event.target.dataset.seek ? event.target.dataset.seek : event.target.value;

		video.currentTime = skipTo;
		progress.style.setProperty('--progress', `${convertToProc(skipTo, Math.round(video.duration))}%`)
		progressSeek.value = skipTo;

		isSync = false
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

	const openFullscreen = _ => {
		if (videoWrapper.requestFullscreen) {
			controlsScreenOpen.hidden = true;
			controlsScreenClose.hidden = false;
			videoWrapper.requestFullscreen();
		}
	}

	const closeFullscreen = _ => {
		if (document.exitFullscreen) {
			controlsScreenOpen.hidden = false;
			controlsScreenClose.hidden = true;
			document.exitFullscreen();
		}
	}

	const hideControls = _ => {
		let dropdownActive = controls.querySelector('.dropdown._active');

		if (dropdownActive)
			return

		controlsBar.classList.remove('_opened');
	}

	const showControls = _ => {
		controlsBar.classList.add('_opened');
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
		if (!video.paused) {
			for (let index = 0, length = segmentsSB.length; index < length; index++) {
				const segmentSB = segmentsSB[index];
				if (video.currentTime >= segmentSB.startTime
					&& video.currentTime <= segmentSB.endTime) {
					video.currentTime = segmentSB.endTime;
					isSync = false

					if (storage.settings.notifySkipSegment)
						showToast('good', 'Segment is skipped!')
				}
			}
		}
	}

	const recordSegmentSB = _ => {
		if (isPlayingVideo()) {
			if (!isRecording) {
				startTime = timeElapsed.textContent
				isRecording = true
				controlsSponsorblock.classList.add('_record')
				showToast('good', 'Recording of segment is started...')
			} else {
				endTime = timeElapsed.textContent
				isRecording = false
				controlsSponsorblock.classList.remove('_record')

				if (document.fullscreenElement)
					closeFullscreen()

				togglePlay()
				resetDialogSB()
				dialogSbStart.value = startTime
				dialogSbEnd.value = endTime
				modal.open('dialog-sb')
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
		let dialogSbCategory = _io_q('.dialog-sb').querySelector('input[name="category"]:checked')

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

	video.addEventListener('loadedmetadata', initVideo);

	video.addEventListener('play', _ => {
		showIconPause()
		playAudio()
	})

	video.addEventListener('playing', _ => {
		showIconPause()
		playAudio()
	})

	video.addEventListener('waiting', _ => {
		if (!isPlayingVideo())
			pauseAudio()
	})

	if (audio) {
		audio.addEventListener('play', playVideo)

		audio.addEventListener('playing', playVideo)

		audio.addEventListener('waiting', _ => {
			if (!isPlayingAudio())
				pauseVideo()
		})
	}

	video.addEventListener('timeupdate', _ => {
		if (!isSync && isPlayingAudio() && isPlayingVideo())
			syncMedia()

		if (audio) {
			if (isPlayingAudio() && isPlayingVideo()) {
				updateBuffered()
				updateTimeElapsed()
				updateProgress()
			}
		} else {
			if (isPlayingVideo()) {
				updateBuffered()
				updateTimeElapsed()
				updateProgress()
			}
		}

		if (doesSkipSegments && !storage.settings.disableSponsorblock)
			skipSegmentSB()
	});

	video.addEventListener('stalled', _ => {
		showToast('good', 'Loading video...')
		pauseAudio()
	});

	video.addEventListener('abort', _ => {
		let winActive = _io_q('.main__content').querySelector('.win._active')

		if (winActive.classList.contains('video')) {
			showToast('error', 'Video is aborted ;(')
			pauseAudio()
		}

		winActive = null
	});

	video.addEventListener('error', _ => {
		showToast('error', video.error.message)
		pauseAudio()
	});

	if (audio) {

		audio.addEventListener('error', _ => {
			showToast('error', audio.error.message)
			pauseVideo()
		});

		audio.addEventListener('stalled', _ => {
			showToast('good', 'Loading audio...')
			pauseVideo()
		});

		audio.addEventListener('abort', _ => {
			let winActive = _io_q('.main__content').querySelector('.win._active')

			if (winActive.classList.contains('video')) {
				showToast('error', 'Audio is aborted ;(')
				pauseVideo()
			}

			winActive = null
		});
	}

	video.addEventListener('ended', onEndVideo)

	// CONTROLS LISTENERS

	if (!hasListeners) {
		hasListeners = true

		const handleInputVolumeSeek = _ => { audio ? updateVolumeAudio() : updateVolumeVideo() }

		volumeSeek.addEventListener('input', handleInputVolumeSeek);

		progressSeek.addEventListener('mousemove', updateSeekTooltip);

		progressSeek.addEventListener('input', skipAhead);

		controlsSwitch.addEventListener('click', togglePlay);

		controlsScreenOpen.addEventListener('click', openFullscreen);

		controlsScreenClose.addEventListener('click', closeFullscreen);

		controlsPlay.addEventListener('click', togglePlay);

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

		const handleInputDialogField = e => {
			let dialogSbField = e.target
			resetDialogSB()
			dialogSbField.value = formatDuration(dialogSbField.value)
		}

		dialogSbStart.addEventListener('input', handleInputDialogField);
		dialogSbEnd.addEventListener('input', handleInputDialogField);
	}

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
				if (doesSkipSegments) {
					doesSkipSegments = false
					showToast('good', 'Sponsorblock is disabled on this video')
				} else {
					doesSkipSegments = true
					showToast('good', 'Sponsorblock is enabled again')
				}
			}

			// F
			if (e.keyCode === 70)
				document.fullscreenElement ? closeFullscreen() : openFullscreen()
		}
	}

	document.addEventListener('keydown', handleKeyDownWithinVideo);
}
