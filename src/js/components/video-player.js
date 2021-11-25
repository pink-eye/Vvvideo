import {
	getSelector,
	filterHLS,
	filterVideoAndAudio,
	filterVideoMP4NoAudio,
	filterVideoWebm,
	getPreferedQuality,
	convertToPercentage,
	isEmpty,
	convertSecondsToDuration,
	getPosStroryboard,
	scrollToTop,
	getMin,
	convertDurationToSeconds,
	hasFocus,
	getHighestAudio,
} from '../global'
import { toggleSponsorblock, createSponsorblockItemHTML, getSegmentsSB } from './sponsorblock'
import { initDropdown } from './dropdown'
import { removeSkeleton } from './skeleton'
import { showToast } from './toast'
import { getWatchedtTime } from './win-history'
import { initDialogSB, recordSegmentSB } from './dialog-sb'
import { AppStorage } from './app-storage'

let hasListeners = false
let isFirstPlay = true
let isSync = false
let doesSkipSegments = true
let hls = null
let segmentsSB = []

const appStorage = new AppStorage()
const storage = appStorage.getStorage()

const resetMediaEl = el => {
	el.pause()
	el.removeAttribute('src')
	el.load()
}

const getMedia = () => {
	const audio = getSelector('.video').querySelector('audio')
	const video = getSelector('video')

	return { video, audio }
}

const createQualityItemHTML = quality => `<li class="dropdown__item">
											<button class="dropdown__btn btn-reset">${quality}</button>
										</li>`

const createStoryboardHTML = _ => `<div class="progress__storyboard"></div>`

const insertQualityList = videoFormats => {
	let controls = getSelector('.controls')
	let quality = controls.querySelector('.controls__quality')
	let qualityList = quality.querySelector('.dropdown__list')

	if (videoFormats.length > 0) {
		for (let index = 0, { length } = videoFormats; index < length; index += 1) {
			const videoFormat = videoFormats[index]
			qualityList.insertAdjacentHTML('afterBegin', createQualityItemHTML(videoFormat.qualityLabel))
		}
	}

	controls = null
	quality = null
	qualityList = null
}

const disableAudio = _ => {
	let audio = getSelector('audio')

	if (audio) {
		resetMediaEl(audio)
		audio.remove()
	}

	audio = null
}

const startVideoLive = url => {
	let video = getSelector('video')

	hls = new Hls()
	hls.loadSource(url)
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
}

const prepareVideoLive = formats => {
	disableAudio()

	return filterHLS(formats)
}

const prepareVideoOnly = formats => {
	disableAudio()

	return filterVideoAndAudio(formats)
}

const prepareVideoAndAudio = formats => {
	let audio = getSelector('.video').querySelector('audio')
	let videoFormats = null

	switch (storage.settings.defaltVideoFormat) {
		case 'mp4':
			videoFormats = filterVideoMP4NoAudio(formats)
			break
		case 'webm':
			videoFormats = filterVideoWebm(formats)
			break
	}

	const { url } = getHighestAudio(formats)
	audio.src = url

	if (videoFormats.length === 0) videoFormats = prepareVideoOnly(formats)

	audio = null

	return videoFormats
}

const prepareVideoPlayer = data => {
	const { formats, videoDetails } = data

	let videoParent = getSelector('.video')
	let videoSkeleton = videoParent.querySelector('.video-skeleton')
	let video = videoParent.querySelector('video')
	let quality = getSelector('.controls').querySelector('.controls__quality')
	let qualityCurrent = quality.querySelector('.dropdown__head')
	let videoFormats = null
	let currentQuality = null

	const onLoadedData = _ => {
		if (videoSkeleton) removeSkeleton(videoSkeleton)

		video = null
		videoSkeleton = null
		videoParent = null
	}

	if (!formats || formats.length === 0) {
		onLoadedData()
		return undefined
	}

	if (videoDetails.isLive) {
		videoFormats = prepareVideoLive(formats)
		currentQuality = getPreferedQuality(videoFormats) ?? videoFormats[0]
		startVideoLive(currentQuality.url)
	} else {
		videoFormats = storage.settings.disableSeparatedStreams
			? prepareVideoOnly(formats)
			: prepareVideoAndAudio(formats)

		currentQuality = getPreferedQuality(videoFormats) ?? videoFormats.at(-1)
		video.src = currentQuality.url
	}

	qualityCurrent.textContent = currentQuality.qualityLabel

	video.addEventListener('loadedmetadata', onLoadedData, { once: true })

	insertQualityList(videoFormats)

	quality = null
	qualityCurrent = null

	return videoFormats
}

const initSponsorblockSegments = data => {
	let video = getSelector('video')
	let progressSponsorblock = getSelector('.controls').querySelector('.progress__sponsorblock')
	let sponsorblockItemAll = progressSponsorblock.querySelectorAll('.sponsorblock__item')

	for (let index = 0, { length } = sponsorblockItemAll; index < length; index += 1) {
		const sponsorblockItem = sponsorblockItemAll[index]
		const { startTime, endTime, videoDuration } = data[index]
		const segmentLength = endTime - startTime
		const vDuration = videoDuration !== 0 ? videoDuration : ~~video.duration
		const sponsorblockItemWidth = convertToPercentage(segmentLength, vDuration)
		const sponsorblockItemLeft = convertToPercentage(startTime, vDuration)

		sponsorblockItem.style.setProperty('--width', `${sponsorblockItemWidth}%`)
		sponsorblockItem.style.setProperty('--left', `${sponsorblockItemLeft}%`)
	}

	video = null
	progressSponsorblock = null
	sponsorblockItemAll = null
}

const changeVideoSrc = (url, currentTime) => {
	let video = getSelector('video')

	if (isEmpty(hls)) {
		video.removeAttribute('src')
		video.load()
		video.src = url
	} else hls.loadSource(url)

	video.currentTime = currentTime

	video = null
}

const hideDecoration = action => {
	let controls = getSelector('.controls')
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
	let controls = getSelector('.controls')
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

export const isPlaying = el => el && !el.paused && !el.ended && el.currentTime > 0 && el.readyState > 2

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

				let audio = getSelector('.video').querySelector('audio')
				let video = getSelector('video')

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
	const videoId = getSelector('.video').dataset.id

	if (isEmpty(videoId)) return

	const videoWatchedTime = getWatchedtTime(videoId)

	if (videoWatchedTime) getSelector('video').currentTime = videoWatchedTime
}

export const playVideoPlayer = async _ => {
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

export const pauseVideoPlayer = _ => {
	let { video, audio } = getMedia()

	pauseEl(video)
	pauseEl(audio)

	showDecoration('pause', true)

	audio = null
	video = null
}

const chooseQuality = url => {
	let video = getSelector('video')

	const { currentTime, paused } = video

	if (!paused) {
		pauseVideoPlayer()
		changeVideoSrc(url, currentTime)
		playVideoPlayer()
	} else changeVideoSrc(url, currentTime)

	isSync = false

	video = null
}

const hidePoster = _ => {
	let videoPoster = getSelector('.video').querySelector('.video__poster')

	if (!videoPoster.classList.contains('_hidden')) videoPoster.classList.add('_hidden')

	videoPoster = null
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

const changeIcon = iconPath => {
	let controls = getSelector('.controls')
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

const toggleIconPlayPause = _ => {
	getSelector('video').paused ? showIconPlay() : showIconPause()
}

const updateTimeElapsed = _ => {
	let controls = getSelector('.controls')
	let timeElapsed = controls.querySelector('.time__elapsed')
	const currentTime = ~~getSelector('video').currentTime
	const time = convertSecondsToDuration(currentTime)

	timeElapsed.textContent = time
	timeElapsed.setAttribute('datetime', time)

	controls = null
	timeElapsed = null
}

const updateVolumeEl = el => {
	let controls = getSelector('.controls')
	let volumeBar = controls.querySelector('.volume__bar')
	let volumeSeek = controls.querySelector('.volume__seek')
	let givenEl = el

	givenEl.muted &&= false

	givenEl.volume = volumeSeek.value
	volumeBar.value = volumeSeek.value

	controls = null
	volumeSeek = null
	givenEl = null
	volumeBar = null
}

const hideBars = _ => {
	let controls = getSelector('.controls')
	let dropdownActive = controls.querySelector('.dropdown._active')
	let controlsBar = controls.querySelector('.controls__bar')
	let topBar = getSelector('.video').querySelector('.top-bar')

	if (!dropdownActive) {
		controlsBar.classList.remove('_opened')
		topBar.classList.remove('_opened')
	}

	dropdownActive = null
	controlsBar = null
	controls = null
	topBar = null
}

const showBars = _ => {
	let topBar = getSelector('.video').querySelector('.top-bar')
	let controlsBar = getSelector('.controls').querySelector('.controls__bar')

	controlsBar.classList.add('_opened')
	topBar.classList.add('_opened')

	controlsBar = null
	topBar = null
}

export const toggleFullscreen = _ => {
	let videoWrapper = getSelector('.video').querySelector('.video__wrapper')

	document.fullscreenElement ? document.exitFullscreen() : videoWrapper.requestFullscreen()

	videoWrapper = null
}

const updateStoryboard = params => {
	let progressStoryboard = getSelector('.controls').querySelector('.progress__storyboard')

	if (progressStoryboard && isEmpty(hls)) {
		const { skipTo, widthProgressBar, posCursor } = params
		const { posX, posY } = getPosStroryboard(getSelector('video').duration, skipTo, 100)

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
	let progress = getSelector('.controls').querySelector('.progress')
	let progressSeek = progress.querySelector('.progress__seek')
	let video = getSelector('video')

	progressSeek.value = Math.floor(video.currentTime)
	progress.style.setProperty('--progress', `${convertToPercentage(Math.floor(video.currentTime), ~~video.duration)}%`)

	progress = null
	progressSeek = null
	video = null
}

const updateSeekTooltip = params => {
	let controls = getSelector('.controls')
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
	let progress = getSelector('.controls').querySelector('.progress')
	let { video, audio } = getMedia()

	if (isEmpty(hls)) {
		if (video.buffered.length > 0) {
			let videoLastBuffered = video.buffered.end(video.buffered.length - 1)
			let audioLastBuffered =
				audio && audio.buffered.length > 0 ? audio.buffered.end(audio.buffered.length - 1) : null
			let minBuffered = audioLastBuffered ? getMin(videoLastBuffered, audioLastBuffered) : videoLastBuffered
			progress.style.setProperty('--buffered', `${convertToPercentage(minBuffered, ~~video.duration)}%`)
		}
	}

	progress = null
	audio = null
	video = null
}

const skipAhead = event => {
	let progress = getSelector('.controls').querySelector('.progress')
	let progressSeek = progress.querySelector('.progress__seek')
	let video = getSelector('video')
	const skipTo = event.target.dataset.seek ? event.target.dataset.seek : event.target.value

	video.currentTime = skipTo
	progress.style.setProperty('--progress', `${convertToPercentage(skipTo, ~~video.duration)}%`)
	progressSeek.value = skipTo

	isSync = false

	event.target.blur()

	progress = null
	progressSeek = null
	video = null
}

const toggleMuteEl = el => {
	let volumeSeek = getSelector('.controls').querySelector('.volume__seek')
	let givenEl = el

	givenEl.muted = !givenEl.muted

	if (givenEl.muted) {
		volumeSeek.dataset.volume = volumeSeek.value
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

	let video = getSelector('video')

	if (isPlaying(video) && segmentsSB.length > 0) {
		for (let index = 0, { length } = segmentsSB; index < length; index += 1) {
			const segmentSB = segmentsSB[index]
			if (video.currentTime >= segmentSB.startTime && video.currentTime <= segmentSB.endTime) {
				video.currentTime = segmentSB.endTime
				isSync = false

				const { notifySkipSegment } = storage.settings
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
	let winActive = getSelector('.main__content').querySelector('.win._active')

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

const handleClickTimecode = event => {
	if (event.target.classList.contains('timecode')) {
		let timecode = event.target
		getSelector('video').currentTime = convertDurationToSeconds(timecode.textContent)
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
	let video = getSelector('video')

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

const forwardTime = _ => {
	getSelector('video').currentTime += 10
	isSync = false
}

const backwardTime = _ => {
	getSelector('video').currentTime -= 10
	isSync = false
}

const handleKeyDownWithinVideo = event => {
	if (getSelector('.video').classList.contains('_active') && (hasFocus(getSelector('body')) || hasFocus(null))) {
		// ENTER || SPACE
		if (event.keyCode === 13 || event.keyCode === 32) togglePlay()

		// ARROW LEFT
		if (event.keyCode === 37) backwardTime()

		// ARROW RIGHT
		if (event.keyCode === 39) forwardTime()

		// M
		if (event.keyCode === 77) toggleMuteVideoPlayer()

		// S
		if (event.keyCode === 83) recordSegmentSB()

		// V
		const { disableSponsorblock } = storage.settings
		if (event.keyCode === 86 && !disableSponsorblock) {
			doesSkipSegments = !doesSkipSegments
			showToast(
				'info',
				doesSkipSegments ? 'Sponsorblock is disabled on this video' : 'Sponsorblock is enabled again'
			)
		}

		// F
		if (event.keyCode === 70) toggleFullscreen()
	}
}

const fillSegmentsSB = segments => {
	const { disableSponsorblock } = storage.settings

	toggleSponsorblock(disableSponsorblock)

	if (disableSponsorblock) return

	let video = getSelector('.video')
	let controlsProgess = video.querySelector('.controls__progress')
	let progressSponsorblock = controlsProgess.querySelector('.sponsorblock')
	let sponsorblockItemHTML = createSponsorblockItemHTML()

	if (segments.length > 0) {
		for (let index = 0, { length } = segments; index < length; index += 1)
			progressSponsorblock.insertAdjacentHTML('beforeEnd', sponsorblockItemHTML)
	}

	video = null
	controlsProgess = null
	progressSponsorblock = null
	sponsorblockItemHTML = null
}

export const initVideoPlayer = data => {
	const controls = getSelector('.controls')
	const controlDecorations = controls.querySelector('.controls__decorations')
	const controlsSwitch = controls.querySelector('.controls__switch')
	const timeDuration = controls.querySelector('.time__duration')
	const progress = controls.querySelector('.progress')
	const progressSeek = progress.querySelector('.progress__seek')
	const volumeSeek = controls.querySelector('.volume__seek')
	const volumeBar = controls.querySelector('.volume__bar')
	const controlsScreen = controls.querySelector('.controls__screen')
	const videoParent = getSelector('.video')
	const videoWrapper = videoParent.querySelector('.video__wrapper')
	const spoilerContent = videoParent.querySelector('.spoiler__content')
	const video = videoWrapper.querySelector('video')
	const audio = videoWrapper.querySelector('audio')

	const { autoplay } = storage.settings

	try {
		segmentsSB = getSegmentsSB(data.videoDetails.videoId)
		fillSegmentsSB(segmentsSB)
	} catch (error) {
		showToast('info', `Sponsorblock doesn't have segments for this video`)
	}

	const videoFormats = prepareVideoPlayer(data)

	if (!videoFormats) return

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

	spoilerContent.addEventListener('click', handleClickTimecode)

	progressSeek.addEventListener('input', skipAhead)

	controlsSwitch.addEventListener('click', togglePlay)

	controlsScreen.addEventListener('click', toggleFullscreen)

	controlDecorations.addEventListener('click', togglePlay)

	controls.addEventListener('mouseleave', hideBars)

	progressSeek.addEventListener('mousemove', handleMouseMoveProgressSeek)

	const controlsQuality = controls.querySelector('.controls__quality')

	initDropdown(controlsQuality, btn => {
		for (let index = 0, { length } = videoFormats; index < length; index += 1) {
			const videoFormat = videoFormats[index]

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
			timeout = setTimeout(hideBars, 3000)
			showBars()
		}

		controls.addEventListener('mousemove', handleMouseMove)
	}
}

export const resetVideoPlayer = _ => {
	let videoParent = getSelector('.video')
	let videoWrapper = videoParent.querySelector('.video__wrapper')
	let video = getSelector('video')
	let audio = videoWrapper.querySelector('audio')
	let controls = getSelector('.controls')
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
	let spoilerContent = videoParent.querySelector('.spoiler__content')

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

	spoilerContent.removeEventListener('click', handleClickTimecode)

	progressSeek.removeEventListener('input', skipAhead)

	controlsSwitch.removeEventListener('click', togglePlay)

	controlsScreen.removeEventListener('click', toggleFullscreen)

	controlDecorations.removeEventListener('click', togglePlay)

	controls.removeEventListener('mouseleave', hideBars)

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
	spoilerContent = null
}
