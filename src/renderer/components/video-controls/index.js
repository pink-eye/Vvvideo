import {
	getSelector,
	convertToPercentage,
	isEmpty,
	convertSecondsToDuration,
	scrollToTop,
	convertDurationToSeconds,
	hasFocus,
} from 'Global/utils'
import {
	getMin,
	getPosStroryboard,
	filterHLS,
	filterVideoAndAudio,
	filterVideoMP4NoAudio,
	filterVideoWebm,
	getPreferredQuality,
	getHighestAudio,
} from 'Components/video-controls/helper'
import {
	toggleSponsorblock,
	createSponsorblockItemHTML,
	getSegmentsSB,
} from 'Components/video-controls/sponsorblock'
import { initDropdown } from 'Components/dropdown'
import { removeSkeleton } from 'Components/skeleton'
import { showToast } from 'Components/toast'
import { getWatchedTime, rememberWatchedTime } from 'Layouts/win-history/helper'
import { initDialogSB, recordSegmentSB } from 'Components/dialog-sb'
import { AppStorage } from 'Global/AppStorage'

let hasListeners = false
let isFirstPlay = true
let isSync = false
let doesSkipSegments = true
let hls = null
let segmentsSB = []
let videoFormats = null
let chapters = null
let currentChapter = null
let lastSeekTooltipChapter = null
let intervalWatchedProgress = null
let timeout = null

const appStorage = new AppStorage()
let storage = null

const resetMediaEl = el => {
	let givenEl = el

	givenEl.pause()
	givenEl.removeAttribute('src')
	givenEl.load()

	givenEl = null
}

const getMedia = () => {
	let audio = getSelector('.video').querySelector('audio')
	let video = getSelector('video')

	return { video, audio }
}

const createQualityItemHTML = quality => `<li class="dropdown__item">
											<button class="dropdown__btn btn-reset">${quality}</button>
										</li>`

const createCaptionItemHTML = (simpleText, srclang, src) => `<li class="dropdown__item">
												<button
												class="dropdown__btn btn-reset"
												data-label="${simpleText}"
												data-srclang="${srclang}"
												data-src="${src}">
													${simpleText}
												</button>
											</li>`

const createTrackHTML = ({ label, srclang, src }) =>
	`<track kind="subtitles" label="${label}" srclang="${srclang}" src="${src}" default></track>`

const createStoryboardHTML = () => `<div class="seek-tooltip__storyboard"></div>`

const insertQualityList = videoFormats => {
	let controls = getSelector('.controls')
	let quality = controls.querySelector('.controls__quality')
	let qualityList = quality.querySelector('.dropdown__list')

	for (let index = 0, { length } = videoFormats; index < length; index += 1) {
		const { qualityLabel } = videoFormats[index]
		qualityList.insertAdjacentHTML('beforeEnd', createQualityItemHTML(qualityLabel))
	}

	controls = null
	quality = null
	qualityList = null
}

const createCaptionItemDefault = () => `<li class="dropdown__item">
											<button class="dropdown__btn btn-reset">No captions</button>
										</li>`

const handleCaption = ({ videoId, languageCode, simpleText }) => {
	let controls = getSelector('.controls')
	let captions = controls.querySelector('.controls__captions')
	let captionList = captions.querySelector('.dropdown__list')

	const folder = 'temp'
	const file = `${videoId}.${languageCode}.vtt`
	const path = `${folder}/${file}`

	captionList.insertAdjacentHTML(
		'afterBegin',
		createCaptionItemHTML(simpleText, languageCode, path)
	)

	if (!captionList.textContent.includes('No captions'))
		captionList.insertAdjacentHTML('afterBegin', createCaptionItemDefault())

	captions.hidden &&= false

	controls = null
	captions = null
	captionList = null
}

const loadCaptions = (data, captionTracks, callback) => {
	for (let index = 0, { length } = captionTracks; index < length; index += 1) {
		const { languageCode } = captionTracks[index]

		API.getCaption(data, languageCode)
			.then(callback)
			.catch(({ message }) => showToast('error', message))
	}
}

const removeTracks = () => {
	let video = getSelector('video')

	while (video.firstChild) video.firstChild.remove()

	video = null
}

const disableAudio = () => {
	let audio = getSelector('.video').querySelector('audio')

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
					showToast('error', 'Fatal error was occurred. Cannot recover :(')
					hls.destroy()
					break
			}
		}
	}

	hls.on(Hls.Events.ERROR, handleError)

	video = null
}

const getVideoFormatsByDefaultFormat = (formats, defaultVideoFormat) => {
	let requiredFormats = null

	switch (defaultVideoFormat) {
		case 'mp4':
			requiredFormats = filterVideoMP4NoAudio(formats)

			if (requiredFormats?.length > 0) break
			else return getVideoFormatsByDefaultFormat(formats, 'webm')

		case 'webm':
			requiredFormats = filterVideoWebm(formats)

			if (requiredFormats?.length > 0) break
			else return getVideoFormatsByDefaultFormat(formats, 'mp4')
	}

	return requiredFormats
}

const prepareVideoPlayer = async data => {
	const { formats, videoDetails } = data

	if (formats.length === 0) return

	const { disableSeparatedStreams, enableProxy, proxy, defaultVideoFormat } = storage.settings

	if (videoDetails.isLive || disableSeparatedStreams) disableAudio()

	if (videoDetails.isLive) videoFormats = filterHLS(formats)
	else {
		if (!disableSeparatedStreams)
			videoFormats = getVideoFormatsByDefaultFormat(formats, defaultVideoFormat)

		if (!videoFormats || videoFormats.length === 0 || disableSeparatedStreams)
			videoFormats = filterVideoAndAudio(formats)
	}

	if ('width' in videoFormats[0]) {
		videoFormats.sort((a, b) => b.width - a.width)
	}

	const currentQualityVideo = getPreferredQuality(videoFormats) ?? videoFormats[0]
	const currentQualityAudio = getHighestAudio(formats)

	let urlRequests = null

	try {
		urlRequests = await Promise.all([
			API.makeRequest(currentQualityVideo.url),
			API.makeRequest(currentQualityAudio.url),
		])
	} catch ({ message }) {
		showToast('error', message)
		return
	}

	const [videoResponse, audioResponse] = urlRequests
	const isOK = videoResponse.statusCode === 200 && audioResponse.statusCode === 200

	if (isOK) {
		let { video, audio } = getMedia()

		video.src = currentQualityVideo.url
		audio && (audio.src = currentQualityAudio.url)

		video = null
		audio = null

		return currentQualityVideo
	} else {
		const id = videoDetails.videoId

		let updatedData = null

		try {
			updatedData = enableProxy
				? await API.scrapeVideoProxy(id, proxy)
				: await API.scrapeVideo(id)
		} catch {
			showToast('error', 'Oops... Check net connection')
			return
		}

		return prepareVideoPlayer(updatedData)
	}
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
	let icon = getSelector(`#${action}`)

	if (!icon.hidden) {
		const startAnimation = () => {
			if (icon.classList.contains('_active')) icon.classList.remove('_active')

			setTimeout(endAnimation, 300)
		}

		const endAnimation = () => {
			icon.hidden ||= true

			icon = null
		}

		setTimeout(startAnimation, 300)
	}
}

const showDecoration = (action, doHide) => {
	let icon = getSelector(`#${action}`)

	if (!icon.hidden) return

	icon.hidden = false

	const startAnimation = () => {
		if (!icon.classList.contains('_active')) icon.classList.add('_active')

		icon = null
	}

	setTimeout(startAnimation, 15)

	doHide && hideDecoration(action)
}

const syncMedia = () => {
	let { video, audio } = getMedia()

	if (!isSync) {
		audio.currentTime = video.currentTime
		isSync = true
	}

	audio = null
	video = null
}

const isPlaying = el => el && !el.paused && !el.ended && el.currentTime > 0 && el.readyState > 2

const isPlayingLight = el => el && !el.paused && !el.ended && el.currentTime >= 0

const pauseEl = el => {
	let givenEl = el

	if (isPlayingLight(givenEl)) {
		givenEl.pause()
		hideDecoration('load')
	}

	givenEl = null
}

const playEl = async el => {
	let givenEl = el

	if (!givenEl) return

	let playPromise = givenEl.play()

	if (playPromise !== undefined && !isPlaying(givenEl)) {
		hideDecoration('load')

		try {
			await playPromise
		} catch ({ message }) {
			showToast('error', message)
		}

		let audio = getSelector('.video').querySelector('audio')

		if (audio) {
			let video = getSelector('video')

			if (isPlaying(video) && isPlaying(audio)) syncMedia()

			video = null
		}

		audio = null
	}

	givenEl = null
}

const startVideoFromLastPoint = () => {
	const { id } = getSelector('.video').dataset

	if (isEmpty(id)) return

	const videoWatchedTime = getWatchedTime(id)

	if (videoWatchedTime) getSelector('video').currentTime = videoWatchedTime
}

const playVideoPlayer = async () => {
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

const pauseVideoPlayer = () => {
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

const hidePoster = () => {
	let videoPoster = getSelector('.video').querySelector('.video__poster')

	if (!videoPoster.classList.contains('_hidden')) videoPoster.classList.add('_hidden')

	videoPoster = null
}

const togglePlay = () => {
	let { video, audio } = getMedia()

	let conditionTogglePlay = audio ? video.paused && audio.paused : video.paused

	conditionTogglePlay ? playVideoPlayer() : pauseVideoPlayer()

	hidePoster()
	isSync = false

	audio = null
	video = null
}

const changeIcon = (className, iconPath) => {
	queueMicrotask(() => {
		let controls = getSelector('.controls')
		let controlsSwitchIcon = controls.querySelector(`.controls__${className} svg use`)

		controlsSwitchIcon.setAttribute('xlink:href', iconPath)

		controls = null
		controlsSwitchIcon = null
	})
}

const showIconPlay = () => changeIcon('switch', 'img/svg/controls.svg#play')

const showIconPause = () => changeIcon('switch', 'img/svg/controls.svg#pause')

const showIconOpenFullscreen = () => changeIcon('screen', 'img/svg/controls.svg#open-fullscreen')

const showIconCloseFullscreen = () => changeIcon('screen', 'img/svg/controls.svg#close-fullscreen')

const toggleIconPlayPause = () => (getSelector('video').paused ? showIconPlay() : showIconPause())

const toggleIconFullscreen = () =>
	document.fullscreenElement ? showIconCloseFullscreen() : showIconOpenFullscreen()

const updateTimeElapsed = () => {
	let timeElapsed = getSelector('.time__elapsed')
	const { currentTime } = getSelector('video')
	const time = convertSecondsToDuration(~~currentTime)

	timeElapsed.textContent = time
	timeElapsed.setAttribute('datetime', time)

	timeElapsed = null
}

const updateBarChapter = () => {
	if (!chapters || chapters.length === 0) return

	const { currentTime } = getSelector('video')
	const { title, start_time } = getRequiredChapter(currentTime)

	if (currentChapter && title === currentChapter) return

	currentChapter = title

	let controls = getSelector('.controls')
	let barChapter = controls.querySelector('.time__chapter')

	barChapter.textContent = title

	highlightCurrentChapter(start_time)

	controls = null
	barChapter = null
}

const highlightCurrentChapter = time => {
	let videoParent = getSelector('.video')
	let spoilerContent = videoParent.querySelector('.spoiler__content')
	let lastHighlightedTimecode = spoilerContent.querySelector('.timecode.btn-accent')
	let timecodeAll = spoilerContent.querySelectorAll('.timecode')

	lastHighlightedTimecode?.classList.remove('btn-accent')

	for (let index = 0, { length } = timecodeAll; index < length; index++) {
		let timecode = timecodeAll[index]

		if (timecode.textContent.includes(convertSecondsToDuration(time))) {
			timecode.classList.add('btn-accent')
			break
		}

		timecode = null
	}

	videoParent = null
	spoilerContent = null
	timecodeAll = null
	lastHighlightedTimecode = null
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

const hideBars = () => {
	let controls = getSelector('.controls')
	let dropdownActive = controls.querySelector('.dropdown._active')
	let topBar = getSelector('.video').querySelector('.top-bar')

	if (!dropdownActive) {
		controls.classList.remove('_opened')
		topBar.classList.remove('_opened')
	}

	dropdownActive = null
	controls = null
	topBar = null
}

const showBars = () => {
	let topBar = getSelector('.video').querySelector('.top-bar')
	let controls = getSelector('.controls')

	controls.classList.add('_opened')
	topBar.classList.add('_opened')

	controls = null
	topBar = null
}

const toggleFullscreen = () => {
	let videoWrapper = getSelector('.video').querySelector('.video__wrapper')

	document.fullscreenElement ? document.exitFullscreen() : videoWrapper.requestFullscreen()

	videoWrapper = null
}

const updateStoryboard = params => {
	let storyboard = getSelector('.controls').querySelector('.seek-tooltip__storyboard')

	if (storyboard && isEmpty(hls)) {
		const { skipTo } = params
		const { posX, posY } = getPosStroryboard(getSelector('video').duration, skipTo, 100)

		storyboard.style.setProperty('--posX', `-${posX}px`)
		storyboard.style.setProperty('--posY', `-${posY}px`)
	}

	storyboard = null
}

const updateProgress = () => {
	let progress = getSelector('.progress')
	let progressSeek = progress.querySelector('.progress__seek')
	let video = getSelector('video')

	progressSeek.value = Math.floor(video.currentTime)
	progress.style.setProperty(
		'--progress',
		`${convertToPercentage(Math.floor(video.currentTime), ~~video.duration)}%`
	)

	progress = null
	progressSeek = null
	video = null
}

const createProgressBarChapter = left =>
	`<div class="progress__chapter" style="--left: ${left}"></div>`

const insertProgressBarChapters = () => {
	if (!chapters || chapters.length === 0) return

	let progress = getSelector('.progress')
	let progressBar = progress.querySelector('.progress__bar')
	const { duration } = getSelector('video')

	for (let index = 0, { length } = chapters; index < length; index++) {
		const { start_time } = chapters[index]
		const offsetLeft = `${convertToPercentage(start_time, duration)}%`
		progressBar.insertAdjacentHTML('beforeEnd', createProgressBarChapter(offsetLeft))
	}

	progress = null
	progressBar = null
}

const getRequiredChapter = time => {
	let requiredChapter = null

	chapters.forEach(chapter => {
		if (chapter.start_time < time) {
			requiredChapter = chapter
			return
		}
	})

	return requiredChapter
}

const updateSeekTooltipChapters = params => {
	const { duration, skipTo } = params

	if (!chapters || chapters.length === 0 || (skipTo < 0 && skipTo > Math.floor(duration))) return

	const requiredChapter = getRequiredChapter(skipTo)

	if (!requiredChapter) return

	const { title } = requiredChapter

	if (lastSeekTooltipChapter === title) return

	lastSeekTooltipChapter = title
	let controls = getSelector('.controls')
	let seekTooltipChapter = controls.querySelector('.seek-tooltip__chapter')

	seekTooltipChapter.textContent = title

	controls = null
	seekTooltipChapter = null
}

const updateSeekTooltipTime = params => {
	const { duration, skipTo } = params

	if (skipTo < 0 && skipTo > Math.floor(duration)) return

	let controls = getSelector('.controls')
	let progressSeek = controls.querySelector('.progress__seek')
	let seekTooltipTime = controls.querySelector('.seek-tooltip__time')

	const skipToTime = convertSecondsToDuration(skipTo)
	progressSeek.setAttribute('data-seek', skipTo)
	seekTooltipTime.textContent = skipToTime

	controls = null
	progressSeek = null
	seekTooltipTime = null
}

const updateSeekTooltipPosition = params => {
	let controls = getSelector('.controls')
	let seekTooltip = controls.querySelector('.seek-tooltip')

	const { widthProgressBar, posCursor } = params

	if (posCursor < widthProgressBar * 0.1) {
		seekTooltip.style.left = `${widthProgressBar * 0.1}px`
	}

	if (posCursor > widthProgressBar * 0.1 && posCursor < widthProgressBar * 0.9) {
		seekTooltip.style.left = `${posCursor}px`
	}

	if (posCursor > widthProgressBar * 0.9) {
		seekTooltip.style.left = `${widthProgressBar * 0.9}px`
	}

	controls = null
	seekTooltip = null
}

const updateBuffered = () => {
	let progress = getSelector('.progress')
	let { video, audio } = getMedia()

	if (isEmpty(hls)) {
		if (video.buffered.length > 0) {
			let videoLastBuffered = video.buffered.end(video.buffered.length - 1)
			let audioLastBuffered =
				audio && audio.buffered.length > 0
					? audio.buffered.end(audio.buffered.length - 1)
					: null
			let minBuffered = audioLastBuffered
				? getMin(videoLastBuffered, audioLastBuffered)
				: videoLastBuffered
			progress.style.setProperty(
				'--buffered',
				`${convertToPercentage(minBuffered, ~~video.duration)}%`
			)
		}
	}

	progress = null
	audio = null
	video = null
}

const skipAhead = event => {
	let progress = getSelector('.progress')
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

const toggleMuteVideoPlayer = () => {
	let { video, audio } = getMedia()

	audio ? toggleMuteEl(audio) : toggleMuteEl(video)

	video = null
	audio = null
}

const startDecorationLoad = () => {
	let { video, audio } = getMedia()

	let timeoutDecorationLoad = setTimeout(() => {
		let conditionDecorationLoad = audio
			? video.readyState > 2 && audio.readyState > 2
			: video.readyState > 2

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

const skipSegmentSB = () => {
	const { disableSponsorblock, notifySkipSegment } = storage.settings

	if (disableSponsorblock || segmentsSB.length === 0) return

	let video = getSelector('video')

	if (isPlaying(video)) {
		const { currentTime } = video

		for (let index = 0, { length } = segmentsSB; index < length; index += 1) {
			const { startTime, endTime } = segmentsSB[index]

			if (currentTime > startTime && currentTime < endTime) {
				setTimeout(() => {
					video.currentTime = endTime

					isSync = false

					if (notifySkipSegment) showToast('info', 'Segment is skipped!')

					video = null
				}, 500)

				return
			}
		}
	}
}

const handleLoadingVideo = () => {
	let { video, audio } = getMedia()

	if (audio && !isPlaying(video)) audio.pause()

	startDecorationLoad()

	audio = null
	video = null
}

const handleLoadingAudio = () => {
	let { video, audio } = getMedia()

	if (!isPlaying(audio)) video.pause()

	startDecorationLoad()

	audio = null
	video = null
}

const handleTimeUpdate = () => {
	let { video, audio } = getMedia()

	if (!isSync && isPlaying(audio) && isPlaying(video)) syncMedia()

	updateTimeElapsed()
	updateProgress()
	updateBarChapter()
	toggleIconPlayPause()

	doesSkipSegments && skipSegmentSB()

	audio = null
	video = null
}

const handleAbort = () => {
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

const handleError = ({ target }) => {
	let { video, audio } = getMedia()

	showToast('error', target.error.message)
	pauseEl(video)
	pauseEl(audio)

	audio = null
	video = null
}

export const handleClickTimecode = ({ target }) => {
	let video = getSelector('video')

	if (!video.src) {
		video = null

		return
	}

	let { textContent } = target
	if (!target.classList.contains('timecode')) return

	video.currentTime = convertDurationToSeconds(textContent)
	isSync = false
	document.activeElement.blur()
	scrollToTop()

	video = null
}

const handleInputVolumeSeek = () => {
	let { video, audio } = getMedia()

	audio ? updateVolumeEl(audio) : updateVolumeEl(video)

	audio = null
	video = null
}

const handleEnd = () => {
	let { video, audio } = getMedia()

	pauseVideoPlayer()
	audio && (audio.currentTime = 0)
	video.currentTime = 0

	audio = null
	video = null
}

const handleMouseMoveProgressSeek = event => {
	let video = getSelector('video')

	const duration = isEmpty(hls)
		? +event.target.getAttribute('max')
		: Math.floor(video.currentTime)
	const skipTo = ~~((event.offsetX / event.target.clientWidth) * duration)
	const rectVideo = video.getBoundingClientRect()
	const widthProgressBar = video.offsetWidth - 40
	const posCursor = event.pageX - rectVideo.left - 20

	const params = { duration, skipTo, widthProgressBar, posCursor }

	updateStoryboard(params)
	updateSeekTooltipTime(params)
	updateSeekTooltipPosition(params)
	updateSeekTooltipChapters(params)

	video = null
}

const forwardTime = () => {
	getSelector('video').currentTime += 10
	isSync = false
}

const backwardTime = () => {
	getSelector('video').currentTime -= 10
	isSync = false
}

const handleKeyDownWithinVideo = ({ keyCode }) => {
	if (
		getSelector('.video').classList.contains('_active') &&
		(hasFocus(getSelector('body')) || hasFocus(null))
	) {
		// ENTER || SPACE
		if (keyCode === 13 || keyCode === 32) togglePlay()

		// ARROW LEFT
		if (keyCode === 37) backwardTime()

		// ARROW RIGHT
		if (keyCode === 39) forwardTime()

		// M
		if (keyCode === 77) toggleMuteVideoPlayer()

		// S
		if (keyCode === 83) recordSegmentSB()

		// V
		const { disableSponsorblock } = storage.settings

		if (keyCode === 86 && !disableSponsorblock) {
			doesSkipSegments = !doesSkipSegments

			showToast(
				'info',
				doesSkipSegments
					? 'Sponsorblock is enabled again'
					: 'Sponsorblock is disabled on this video'
			)
		}

		// F
		if (keyCode === 70) toggleFullscreen()
	}
}

const handleSegmentsSB = segments => {
	if (!segments || segments.length === 0) return

	segmentsSB = segments
	fillSegmentsSB(segmentsSB)
	visualizeSegmentsSB(segmentsSB)
}

const loadSegmentsSB = (data, callback) => {
	const { notifySkipSegment, disableSponsorblock } = storage.settings

	if (disableSponsorblock) {
		toggleSponsorblock(disableSponsorblock)
		return
	}

	getSegmentsSB(data.videoDetails.videoId)
		.then(callback)
		.catch(
			() =>
				notifySkipSegment &&
				showToast('info', `Sponsorblock doesn't have segments for this video`)
		)
}

const visualizeSegmentsSB = segments => {
	let video = getSelector('video')
	let progressSponsorblock = getSelector('.controls').querySelector('.progress__sponsorblock')

	for (let index = 0, { length } = segments; index < length; index += 1) {
		const { startTime, endTime, videoDuration } = segments[index]
		const segmentLength = endTime - startTime
		const vDuration = videoDuration !== 0 ? videoDuration : video.duration
		const width = `${convertToPercentage(segmentLength, vDuration)}%`
		const left = `${convertToPercentage(startTime, vDuration)}%`
		const sponsorblockItemHTML = createSponsorblockItemHTML({ width, left })

		progressSponsorblock.insertAdjacentHTML('beforeEnd', sponsorblockItemHTML)
	}

	video = null
	progressSponsorblock = null
}

let timeoutMouseMove = null

const handleMouseMoveControls = () => {
	clearTimeout(timeoutMouseMove)
	timeoutMouseMove = setTimeout(hideBars, 3000)
	showBars()
}

const match = (target, className) =>
	target.classList.contains(className) || target.closest(`.${className}`)

const handleClickVideoPlayer = event => {
	let { target } = event

	if (match(target, 'controls__switch') || match(target, 'controls__decorations')) {
		togglePlay()
		return
	}

	if (match(target, 'controls__screen')) {
		toggleFullscreen()
		return
	}

	target = null
}

const handleMouseMoveVideoPlayer = event => {
	let { target } = event

	if (match(target, 'progress__seek')) {
		handleMouseMoveProgressSeek(event)
		return
	}

	if (match(target, 'controls')) {
		handleMouseMoveControls()
		return
	}

	target = null
}

const handleInputVideoPlayer = event => {
	let { target } = event

	if (match(target, 'volume__seek')) {
		handleInputVolumeSeek()
		return
	}

	if (match(target, 'progress__seek')) {
		skipAhead(event)
		return
	}

	target = null
}

const handleCanPlayThrough = ({ target }) => {
	if (!isPlayingLight(target)) {
		playVideoPlayer()
	}
}

const handlePlaying = () => hideDecoration('load')

export const initVideoPlayer = async data => {
	let controls = getSelector('.controls')
	let videoParent = getSelector('.video')
	let videoWrapper = videoParent.querySelector('.video__wrapper')
	let videoSkeleton = videoParent.querySelector('.video-skeleton')
	let hasCaptions = false

	storage = appStorage.get()
	timeout = storage.settings.disableTransition ? 1 : 0

	const currentQuality = await prepareVideoPlayer(data)

	const onLoadedData = () => {
		if (videoSkeleton) removeSkeleton(videoSkeleton)

		videoSkeleton = null
	}

	if (!videoFormats || videoFormats.length === 0) {
		onLoadedData()
		return
	}

	const { video, audio } = getMedia()

	video.addEventListener('loadedmetadata', onLoadedData, { once: true })

	if (data.videoDetails.isLive) startVideoLive(currentQuality.url)

	let quality = controls.querySelector('.controls__quality')
	let qualityCurrent = quality.querySelector('.dropdown__head')

	qualityCurrent.textContent = currentQuality.qualityLabel
	insertQualityList(videoFormats)

	quality = null
	qualityCurrent = null

	if (data.player_response.captions) {
		const { captionTracks } = data.player_response.captions.playerCaptionsTracklistRenderer

		if (captionTracks?.length > 0) {
			hasCaptions = true

			loadCaptions(data, captionTracks, handleCaption)
		}
	}

	loadSegmentsSB(data, handleSegmentsSB)

	const initVideo = () => {
		let progress = getSelector('.progress')
		let progressSeek = progress.querySelector('.progress__seek')
		let timeDuration = controls.querySelector('.time__duration')
		let volumeBar = controls.querySelector('.volume__bar')
		let volumeSeek = controls.querySelector('.volume__seek')
		const videoDuration = ~~video.duration
		const time = convertSecondsToDuration(videoDuration)

		chapters = data.videoDetails.chapters
		progressSeek.setAttribute('max', videoDuration)
		timeDuration.textContent = time
		timeDuration.setAttribute('datetime', time)
		volumeBar.value = volumeSeek.value

		doesSkipSegments ||= true

		insertProgressBarChapters()

		intervalWatchedProgress = setInterval(() => {
			let video = getSelector('video')

			if (!isPlaying(video)) return

			rememberWatchedTime()

			video = null
		}, 90000)

		progressSeek = null
		progress = null
		volumeSeek = null
		volumeBar = null
		timeDuration = null
		controls = null
	}

	// MEDIA LISTENERS

	video.addEventListener('loadeddata', initVideo, { once: true })

	const { autoplay } = storage.settings

	if (autoplay) {
		const handleCanPlay = () => {
			hidePoster()
			showDecoration('load', false)
		}

		video.addEventListener('canplay', handleCanPlay, { once: true })
	}

	video.addEventListener('canplaythrough', handleCanPlayThrough)

	video.addEventListener('waiting', handleLoadingVideo)

	video.addEventListener('playing', handlePlaying)

	if (audio) {
		audio.addEventListener('waiting', handleLoadingAudio)

		audio.addEventListener('playing', handlePlaying)
	}

	video.addEventListener('progress', updateBuffered)

	video.addEventListener('timeupdate', handleTimeUpdate)

	video.addEventListener('error', handleError)

	if (audio) {
		audio.addEventListener('error', handleError)
	}

	video.addEventListener('ended', handleEnd)

	videoParent.addEventListener('input', handleInputVideoPlayer)

	videoParent.addEventListener('click', handleClickVideoPlayer)

	videoParent.addEventListener('mousemove', handleMouseMoveVideoPlayer)

	controls.addEventListener('mouseleave', hideBars)

	videoWrapper.addEventListener('fullscreenchange', toggleIconFullscreen)

	// HOT KEYS

	document.addEventListener('keydown', handleKeyDownWithinVideo)

	if (!hasListeners) {
		hasListeners = true

		const controlsQuality = controls.querySelector('.controls__quality')

		initDropdown(controlsQuality, btn => {
			for (let index = 0, { length } = videoFormats; index < length; index += 1) {
				const { qualityLabel, url } = videoFormats[index]

				if (qualityLabel === btn.textContent) chooseQuality(url)
			}
		})

		let controlsCaptions = controls.querySelector('.controls__captions')

		if (hasCaptions) {
			initDropdown(
				controlsCaptions,
				btn => {
					removeTracks()

					if (btn.dataset.src) {
						const { label, src, srclang } = btn.dataset
						video.insertAdjacentHTML(
							'afterBegin',
							createTrackHTML({ label, srclang, src })
						)
					} else video.textTracks.mode = 'hidden'
				},
				{ changeHead: true }
			)
		} else {
			controlsCaptions = null
		}

		if (isEmpty(hls)) {
			const controlsSpeed = controls.querySelector('.controls__speed')

			initDropdown(controlsSpeed, btn => {
				const { speed } = btn.dataset

				audio && (audio.playbackRate = speed)

				video.playbackRate = speed

				isSync = false
			})
		}

		initDialogSB()
	}

	videoParent = null
	videoWrapper = null
}

export const resetVideoPlayer = () => {
	rememberWatchedTime()

	let { video, audio } = getMedia()
	let videoParent = getSelector('.video')
	let videoWrapper = videoParent.querySelector('.video__wrapper')
	let controls = getSelector('.controls')
	let sponsorblock = controls.querySelector('.sponsorblock')
	let sponsorblockBtn = controls.querySelector('.controls__sponsorblock')
	let progress = getSelector('.progress')
	let progressBar = progress.querySelector('.progress__bar')
	let seekTooltip = controls.querySelector('.seek-tooltip')
	let storyboard = seekTooltip.querySelector('.seek-tooltip__storyboard')
	let seekTooltipChapter = seekTooltip.querySelector('.seek-tooltip__chapter')
	let timeDuration = controls.querySelector('.time__duration')
	let barChapter = controls.querySelector('.time__chapter')
	let quality = controls.querySelector('.controls__quality')
	let qualityList = quality.querySelector('.dropdown__list')
	let captions = controls.querySelector('.controls__captions')
	let captionList = captions.querySelector('.dropdown__list')
	let timeElapsed = controls.querySelector('.time__elapsed')
	let speed = controls.querySelector('.controls__speed')
	let speedCurrent = speed.querySelector('.dropdown__head')

	const decorationArray = ['play', 'pause', 'load']

	for (let index = 0, { length } = decorationArray; index < length; index++) {
		const decoration = decorationArray[index]

		let decorationSelector = getSelector(`#${decoration}`)
		decorationSelector.hidden ||= true
		if (decorationSelector.classList.contains('_active'))
			decorationSelector.classList.remove('_active')

		decorationSelector = null
	}

	isFirstPlay ||= true
	isSync &&= false
	doesSkipSegments ||= true
	segmentsSB.length = 0
	chapters = null
	videoFormats = null
	currentChapter = null
	lastSeekTooltipChapter = null
	intervalWatchedProgress && clearInterval(intervalWatchedProgress)
	intervalWatchedProgress = null

	captions.hidden ||= true

	while (sponsorblock.firstChild) sponsorblock.firstChild.remove()

	while (progressBar.firstChild) progressBar.firstChild.remove()

	if (sponsorblockBtn.classList.contains('_record')) sponsorblockBtn.classList.remove('_record')

	while (qualityList.firstChild) qualityList.firstChild.remove()
	while (captionList.firstChild) captionList.firstChild.remove()

	removeTracks()

	speedCurrent.textContent = 'x1'
	barChapter.textContent = ''

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
	seekTooltipChapter.textContent = ''

	storage = appStorage.get()

	const { disableStoryboard } = storage.settings

	if (!disableStoryboard && !storyboard)
		seekTooltip.insertAdjacentHTML('afterBegin', createStoryboardHTML())

	video.removeEventListener('canplaythrough', handleCanPlayThrough)

	videoWrapper.removeEventListener('fullscreenchange', toggleIconFullscreen)

	video.removeEventListener('waiting', handleLoadingVideo)

	video.removeEventListener('playing', handlePlaying)

	if (audio) {
		audio.removeEventListener('waiting', handleLoadingAudio)

		audio.removeEventListener('playing', handlePlaying)
	}

	video.removeEventListener('progress', updateBuffered)

	video.removeEventListener('timeupdate', handleTimeUpdate)

	video.removeEventListener('error', handleError)

	if (audio) {
		audio.removeEventListener('error', handleError)
	}

	video.removeEventListener('ended', handleEnd)

	videoParent.removeEventListener('click', handleClickVideoPlayer)

	videoParent.removeEventListener('input', handleInputVideoPlayer)

	videoParent.removeEventListener('mousemove', handleMouseMoveVideoPlayer)

	controls.removeEventListener('mouseleave', hideBars)

	document.removeEventListener('keydown', handleKeyDownWithinVideo)

	resetMediaEl(video)

	audio
		? resetMediaEl(audio)
		: videoWrapper.insertAdjacentHTML(
				'beforeEnd',
				'<audio crossorigin="anonymous" referrerpolicy="no-referrer" preload></audio>'
		  )

	controls.hidden &&= false

	showIconPlay()
	showIconOpenFullscreen()

	API.clearTempFolder()

	videoParent = null
	seekTooltipChapter = null
	videoWrapper = null
	video = null
	audio = null
	controls = null
	sponsorblock = null
	sponsorblockBtn = null
	progress = null
	seekTooltip = null
	storyboard = null
	progressBar = null
	barChapter = null
	timeDuration = null
	quality = null
	captionList = null
	captions = null
	qualityList = null
	timeElapsed = null
	speed = null
	speedCurrent = null
}
