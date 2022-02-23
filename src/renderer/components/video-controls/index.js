import {
	getSelector,
	isEmpty,
	convertSecondsToDuration,
	scrollToTop,
	convertDurationToSeconds,
	hasFocus,
	isChild,
} from 'Global/utils'
import {
	getPosStroryboard,
	filterHLS,
	filterVideoAndAudio,
	getPreferredQuality,
	getHighestAudio,
	resetMediaEl,
	isPlaying,
	isPlayingLight,
	getVideoFormatsByDefaultFormat,
	getRequiredChapter,
} from 'Components/video-controls/helper'
import { toggleSponsorblock, getSegmentsSB } from 'Components/video-controls/sponsorblock'
import { removeSkeleton } from 'Components/skeleton'
import { showToast } from 'Components/toast'
import { getWatchedTime, rememberWatchedTime } from 'Layouts/win-history/helper'
import { recordSegmentSB } from 'Components/dialog-sb'
import { AppStorage } from 'Global/AppStorage'
import { setMenu, toggleMenu, resetMenu, isOpenedMenu } from './partials/menu'
import { showDecoration, hideDecoration, resetDecorations } from './partials/decorations'
import { hidePoster, resetPoster } from './partials/poster'
import {
	updateStoryboard,
	updateSeekTooltipTime,
	updateSeekTooltipPosition,
	updateSeekTooltipChapter,
	updateTimeElapsed,
	updateProgress,
	visualizeProgressBarChapters,
	updateBuffered,
	skipAhead,
	setProgress,
	resetProgress,
	visualizeSegmentsSB,
} from './partials/progress'

let state = {
	formats: null,
	captions: [],
}

let isFirstPlay = true
let isSync = false
let doesSkipSegments = true
let hls = null
let segmentsSB = []
let chapters = null
let currentChapter = null
let lastSeekTooltipChapter = null
let intervalWatchedProgress = null
let timeout = null
const configDialogSB = {
	onStart: () => {
		let controls = getSelector('.controls')
		let sponsorblockBtn = controls.querySelector('.controls-actions__btn_sponsorblock')
		sponsorblockBtn.dataset.tooltip = 'Stop segment (S)'
		changeIcon('controls-actions__btn_sponsorblock', 'img/svg/controls.svg#sponsorblock-stop')
		controls = null
		sponsorblockBtn = null
	},
	onEnd: () => {
		let controls = getSelector('.controls')
		let sponsorblockBtn = controls.querySelector('.controls-actions__btn_sponsorblock')
		sponsorblockBtn.dataset.tooltip = 'Start segment (S)'
		changeIcon('controls-actions__btn_sponsorblock', 'img/svg/controls.svg#sponsorblock')
		controls = null
		sponsorblockBtn = null
	},
}

const appStorage = new AppStorage()
let storage = null

const getMedia = () => {
	let audio = getSelector('.video').querySelector('audio')
	let video = getSelector('video')

	return { video, audio }
}

const trackHTML = ({ label, srclang, src }) =>
	`<track kind="subtitles" label="${label}" srclang="${srclang}" src="${src}" default></track>`

const handleCaption = ({ videoId, languageCode, simpleText }) => {
	const folder = 'temp'
	const file = `${videoId}.${languageCode}.vtt`
	const path = `${folder}/${file}`

	state.captions.push({ simpleText, srclang: languageCode, src: path })
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

const handleErrorLive = (event, { fatal, type }) => {
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

const startVideoLive = url => {
	let video = getSelector('video')

	hls = new Hls()
	hls.attachMedia(video)

	hls.on(Hls.Events.MEDIA_ATTACHED, () => hls.loadSource(url))

	hls.on(Hls.Events.ERROR, handleErrorLive)

	video = null
}

const prepareVideoPlayer = async data => {
	const { formats, videoDetails } = data

	if (!formats.length) return

	const { disableSeparatedStreams, enableProxy, proxy, defaultVideoFormat } = storage.settings

	if (videoDetails.isLive || disableSeparatedStreams) disableAudio()

	if (videoDetails.isLive) state.formats = filterHLS(formats)
	else {
		if (!disableSeparatedStreams)
			state.formats = getVideoFormatsByDefaultFormat(formats, defaultVideoFormat)

		if (!state.formats || state.formats.length === 0 || disableSeparatedStreams)
			state.formats = filterVideoAndAudio(formats)
	}

	if ('width' in state.formats[0]) {
		state.formats.sort((a, b) => b.width - a.width)
	}

	const currentQualityVideo = getPreferredQuality(state.formats) ?? state.formats[0]
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
	isSync = false

	video = null
}

const syncMedia = () => {
	let { video, audio } = getMedia()

	// if (!isSync) {
	audio.currentTime = video.currentTime
	isSync = true
	// }

	audio = null
	video = null
}

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

			let audio = getSelector('.video').querySelector('audio')

			if (audio) {
				let video = getSelector('video')

				if (isPlaying(video) && isPlaying(audio)) syncMedia()

				video = null
			}

			audio = null
		} catch ({ message }) {
			showToast('error', message)
		}
	}

	givenEl = null
}

const startVideoFromLastPoint = () => {
	const { id } = getSelector('.video').dataset

	if (isEmpty(id)) return

	const videoWatchedTime = getWatchedTime(id)

	if (videoWatchedTime) {
		getSelector('video').currentTime = videoWatchedTime
		isSync = false
	}
}

const playVideoPlayer = async () => {
	let { video, audio } = getMedia()

	if (isFirstPlay) {
		startVideoFromLastPoint()
		isFirstPlay = false
	}

	await playEl(video)
	await playEl(audio)

	audio = null
	video = null
}

const pauseVideoPlayer = () => {
	let { video, audio } = getMedia()

	pauseEl(video)
	pauseEl(audio)

	audio = null
	video = null
}

const switchQuality = url => {
	const { currentTime, paused } = getSelector('video')

	if (!paused) {
		pauseVideoPlayer()
		changeVideoSrc(url, currentTime)
		playVideoPlayer()
	} else changeVideoSrc(url, currentTime)
}

const changeSpeed = speed => {
	let { video, audio } = getMedia()

	if (audio) audio.playbackRate = speed

	video.playbackRate = speed

	video = null
	audio = null
}

const switchCaption = ({ label, srclang, src }) => {
	let video = getSelector('video')

	removeTracks()

	if (src) {
		video.insertAdjacentHTML('afterBegin', trackHTML({ label, srclang, src }))
	} else {
		video.textTracks.mode = 'hidden'
	}

	video = null
}

const togglePlay = () => {
	let { video, audio } = getMedia()

	let conditionTogglePlay = audio ? video.paused && audio.paused : video.paused

	if (conditionTogglePlay) {
		showDecoration('play', true)
		playVideoPlayer()
	} else {
		showDecoration('pause', true)
		pauseVideoPlayer()
	}

	hidePoster()
	isSync = false

	audio = null
	video = null
}

const changeIcon = (className, iconPath) => {
	queueMicrotask(() => {
		let controls = getSelector('.controls')
		let controlsSwitchIcon = controls.querySelector(`.${className} svg > use`)

		controlsSwitchIcon.setAttribute('xlink:href', iconPath)

		controls = null
		controlsSwitchIcon = null
	})
}

const showIconPlay = () => changeIcon('controls__state', 'img/svg/controls.svg#play')

const showIconPause = () => changeIcon('controls__state', 'img/svg/controls.svg#pause')

const showIconOpenFullscreen = () =>
	changeIcon('controls-actions__btn_screen', 'img/svg/controls.svg#open-fullscreen')

const showIconCloseFullscreen = () =>
	changeIcon('controls-actions__btn_screen', 'img/svg/controls.svg#close-fullscreen')

const toggleIconPlayPause = () => (getSelector('video').paused ? showIconPlay() : showIconPause())

const toggleIconFullscreen = () => {
	let controls = getSelector('.controls')
	let actionsScreen = controls.querySelector('.controls-actions__btn_screen')

	if (document.fullscreenElement) {
		showIconCloseFullscreen()
		actionsScreen.dataset.tooltip = 'Close fullscreen (F)'
	} else {
		showIconOpenFullscreen()
		actionsScreen.dataset.tooltip = 'Fullscreen (F)'
	}

	actionsScreen = null
	controls = null
}

const updateBarChapter = () => {
	if (!chapters || chapters.length === 0) return

	const { currentTime } = getSelector('video')
	const { title, start_time } = getRequiredChapter(chapters, currentTime)

	if (currentChapter && title === currentChapter) return

	currentChapter = title

	let controls = getSelector('.controls')
	let barChapter = controls.querySelector('.controls__current-chapter')

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

	for (let index = 0, { length } = timecodeAll; index < length; index += 1) {
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
	let progress = getSelector('.progress')

	if (progress.matches(':hover')) {
		progress = null
		return
	}

	if (isOpenedMenu()) return

	let controls = getSelector('.controls')
	let dropdownActive = controls.querySelector('.dropdown._active')
	let top = getSelector('.video').querySelector('.top')

	if (!dropdownActive) {
		controls.classList.remove('_opened')
		top.classList.remove('_opened')
	}

	dropdownActive = null
	controls = null
	top = null
	progress = null
}

const showBars = () => {
	let top = getSelector('.video').querySelector('.top')
	let controls = getSelector('.controls')

	controls.classList.add('_opened')
	top.classList.add('_opened')

	controls = null
	top = null
}

const toggleFullscreen = () => {
	let videoWrapper = getSelector('.video').querySelector('.video__wrapper')

	document.fullscreenElement ? document.exitFullscreen() : videoWrapper.requestFullscreen()

	videoWrapper = null
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

const toggleMute = () => {
	let { video, audio } = getMedia()

	audio ? toggleMuteEl(audio) : toggleMuteEl(video)

	video = null
	audio = null
}

const skipSegmentSB = () => {
	const { disableSponsorblock, notifySkipSegment } = storage.settings

	if (disableSponsorblock || segmentsSB.length === 0) return

	let video = getSelector('video')

	if (!isPlaying(video)) {
		video = null
		return
	}

	segmentsSB.forEach(({ startTime, endTime }) => {
		const { currentTime } = video

		if (currentTime > startTime && currentTime < endTime) {
			video.currentTime = endTime
			isSync = false

			if (notifySkipSegment) showToast('info', 'Segment is skipped!')

			video = null
			return
		}
	})
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
	}, 500)
}

const handleWaitingVideo = () => {
	let { audio } = getMedia()

	startDecorationLoad()
	audio && audio.pause()

	audio = null
}

const handleWaitingAudio = () => {
	let { video } = getMedia()

	startDecorationLoad()
	video.pause()

	video = null
}

const handleTimeUpdate = () => {
	let { video, audio } = getMedia()

	if (audio) {
		const diff = Math.abs(video.currentTime - audio.currentTime)
		if (diff > 0.5) syncMedia()
	}

	updateTimeElapsed()
	updateProgress()
	updateBarChapter()
	toggleIconPlayPause()

	doesSkipSegments && skipSegmentSB()

	video = null
	audio = null
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
	let { video } = getMedia()

	video.currentTime = 0
	isSync = false

	pauseVideoPlayer()

	video = null
}

const handleMouseMoveProgressSeek = event => {
	let video = getSelector('video')
	let progress = getSelector('.progress')
	let progressBar = progress.querySelector('.progress__bar')

	const duration = isEmpty(hls) ? video.duration : video.currentTime
	const skipTo = (event.offsetX / event.target.offsetParent.clientWidth) * duration
	const rectProgressBar = progressBar.getBoundingClientRect()
	const posCursor = event.pageX - rectProgressBar.left
	const { posX, posY } = getPosStroryboard(video.duration, skipTo, 100)

	const params = { duration, skipTo, posCursor, storyboard: { posX, posY } }

	if (isEmpty(hls)) updateStoryboard(params)

	updateSeekTooltipTime(params)
	updateSeekTooltipPosition(params)

	if (chapters?.length) {
		const { title } = getRequiredChapter(chapters, skipTo)

		if (lastSeekTooltipChapter !== title) {
			lastSeekTooltipChapter = title

			params.chapter = title
			updateSeekTooltipChapter(params)
		}
	}

	video = null
	progress = null
	progressBar = null
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
		if (keyCode === 77) toggleMute()

		// S
		if (keyCode === 83) recordSegmentSB(configDialogSB)

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

let timeoutMouseMove = null

const handleMouseMoveControls = () => {
	clearTimeout(timeoutMouseMove)
	timeoutMouseMove = setTimeout(hideBars, 3000)
	showBars()
}

const handleClickVideoPlayer = event => {
	let { target } = event

	if (isChild(target, '.controls-actions__btn_screen')) {
		toggleFullscreen()
	}

	if (isChild(target, '.controls__decorations')) {
		togglePlay()
	}

	if (isChild(target, '.controls-actions__btn_sponsorblock')) {
		recordSegmentSB(configDialogSB)
	}

	target = null
}

const handleMouseMoveVideoPlayer = event => {
	let { target } = event

	if (isChild(target, '.progress__seek')) {
		handleMouseMoveProgressSeek(event)
		return
	}

	if (isChild(target, '.controls')) {
		handleMouseMoveControls()
		return
	}

	target = null
}

const handleInputVideoPlayer = event => {
	let { target } = event

	if (isChild(target, '.volume__seek')) {
		handleInputVolumeSeek()
		return
	}

	if (isChild(target, '.progress__seek')) {
		const seekedTime = skipAhead(event)

		let { video, audio } = getMedia()

		video.currentTime = seekedTime
		isSync = false

		audio = null
		video = null
		return
	}

	target = null
}

const handleCanPlayThroughVideo = () => {
	let { video, audio } = getMedia()

	if (!isPlaying(audio)) playVideoPlayer()

	audio = null
	video = null
}

const handleCanPlayThroughAudio = () => {
	let { video, audio } = getMedia()

	if (!isPlaying(video)) playVideoPlayer()

	video = null
	audio = null
}

const handlePlaying = () => hideDecoration('load')

const handleProgress = () => {
	if (!isEmpty(hls)) return

	let { video, audio } = getMedia()

	updateBuffered({ video, audio })

	video = null
	audio = null
}

export const initVideoPlayer = async data => {
	let controls = getSelector('.controls')
	let videoParent = getSelector('.video')
	let videoWrapper = videoParent.querySelector('.video__wrapper')
	let videoSkeleton = videoParent.querySelector('.video-skeleton')

	storage = appStorage.get()
	const { settings } = storage
	timeout = settings.disableTransition ? 1 : 0

	const currentQuality = await prepareVideoPlayer(data)

	const onLoadedData = () => {
		if (videoSkeleton) removeSkeleton(videoSkeleton)

		videoSkeleton = null
	}

	if (!state.formats || state.formats.length === 0) {
		onLoadedData()
		return
	}

	const { video, audio } = getMedia()

	video.addEventListener('loadedmetadata', onLoadedData, { once: true })

	if (data.videoDetails.isLive) startVideoLive(currentQuality.url)

	const captionsTracklist = data.player_response?.captions?.playerCaptionsTracklistRenderer

	if (captionsTracklist) {
		const { captionTracks } = captionsTracklist

		if (captionTracks?.length > 0) {
			loadCaptions(data, captionTracks, handleCaption)
		}
	}

	loadSegmentsSB(data, handleSegmentsSB)

	const initVideo = () => {
		let volumeBar = controls.querySelector('.volume__bar')
		let volumeSeek = controls.querySelector('.volume__seek')
		let topTitle = videoParent.querySelector('.top__title')
		let topAuthor = videoParent.querySelector('.top__author')
		let storyboard = controls.querySelector('.seek-tooltip__storyboard')
		const { videoDetails } = data

		topTitle.textContent = videoDetails.title
		topAuthor.textContent = videoDetails.author.name

		let configProgress = { storyboard: {} }

		if (settings.disableStoryboard || videoDetails.storyboards.length === 0)
			configProgress.storyboard.display = 'none'

		if (storyboard && videoDetails?.storyboards && videoDetails.storyboards.length > 0)
			configProgress.storyboard.url = videoDetails.storyboards.at(0).templateUrl

		setProgress(configProgress)

		chapters = videoDetails.chapters
		volumeBar.value = volumeSeek.value

		doesSkipSegments ||= true

		if (chapters?.length) visualizeProgressBarChapters(chapters)

		intervalWatchedProgress = setInterval(() => {
			let video = getSelector('video')

			if (!isPlaying(video)) return

			rememberWatchedTime()

			video = null
		}, 90000)

		setMenu({
			formats: state.formats,
			captions: state.captions,
			handleClickQuality: url => switchQuality(url),
			handleClickSpeed: speed => changeSpeed(speed),
			handleClickCaption: caption => switchCaption(caption),
			current: {
				quality: currentQuality.qualityLabel,
				speed: 'x1',
				captions: 'No captions',
			},
		})

		volumeSeek = null
		volumeBar = null
		topTitle = null
		topAuthor = null
		storyboard = null
		videoParent = null
		controls = null
	}

	controls.addEventListener('mouseleave', hideBars)

	let actionsMore = controls.querySelector('.controls-actions__btn_more')
	actionsMore.addEventListener('click', toggleMenu)
	actionsMore = null

	// MEDIA LISTENERS

	video.addEventListener('loadeddata', initVideo, { once: true })

	const { autoplay } = settings

	if (autoplay) {
		const handleCanPlay = () => {
			hidePoster()
			startDecorationLoad()
		}

		video.addEventListener('canplay', handleCanPlay, { once: true })
	}

	video.addEventListener('canplaythrough', handleCanPlayThroughVideo)
	video.addEventListener('waiting', handleWaitingVideo)
	video.addEventListener('playing', handlePlaying)

	if (audio) {
		audio.addEventListener('canplaythrough', handleCanPlayThroughAudio)
		audio.addEventListener('waiting', handleWaitingAudio)
	}

	video.addEventListener('progress', handleProgress)
	video.addEventListener('timeupdate', handleTimeUpdate)

	if (!hls) {
		video.addEventListener('error', handleError)

		if (audio) {
			audio.addEventListener('error', handleError)
		}

		video.addEventListener('ended', handleEnd)
	}

	videoParent.addEventListener('input', handleInputVideoPlayer)
	videoParent.addEventListener('click', handleClickVideoPlayer)
	videoParent.addEventListener('mousemove', handleMouseMoveVideoPlayer)
	videoWrapper.addEventListener('fullscreenchange', toggleIconFullscreen)

	// HOT KEYS

	document.addEventListener('keydown', handleKeyDownWithinVideo)

	videoWrapper = null
}

export const resetVideoPlayer = () => {
	rememberWatchedTime()

	let { video, audio } = getMedia()
	let videoParent = getSelector('.video')
	let videoWrapper = videoParent.querySelector('.video__wrapper')
	let controls = getSelector('.controls')
	let barChapter = controls.querySelector('.controls__current-chapter')
	let actionsMore = controls.querySelector('.controls-actions__btn_more')

	actionsMore.removeEventListener('click', toggleMenu)

	resetDecorations()
	resetMenu()
	resetProgress()

	state.captions.length = 0
	state.formats = null
	isFirstPlay ||= true
	isSync &&= false
	doesSkipSegments ||= true
	segmentsSB.length = 0
	chapters = null
	currentChapter = null
	lastSeekTooltipChapter = null
	intervalWatchedProgress && clearInterval(intervalWatchedProgress)
	intervalWatchedProgress = null

	removeTracks()

	barChapter.textContent = ''

	if (!isEmpty(hls)) {
		hls.detachMedia()
		hls.destroy()
		hls = null
	}

	resetPoster()

	video.removeEventListener('canplaythrough', handleCanPlayThroughVideo)
	video.removeEventListener('waiting', handleWaitingVideo)
	video.removeEventListener('playing', handlePlaying)

	if (audio) {
		audio.removeEventListener('canplaythrough', handleCanPlayThroughAudio)
		audio.removeEventListener('waiting', handleWaitingAudio)
		audio.removeEventListener('error', handleError)
	}

	video.removeEventListener('progress', handleProgress)
	video.removeEventListener('timeupdate', handleTimeUpdate)
	video.removeEventListener('error', handleError)
	video.removeEventListener('ended', handleEnd)

	videoParent.removeEventListener('click', handleClickVideoPlayer)
	videoParent.removeEventListener('input', handleInputVideoPlayer)
	videoParent.removeEventListener('mousemove', handleMouseMoveVideoPlayer)

	videoWrapper.removeEventListener('fullscreenchange', toggleIconFullscreen)

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
	videoWrapper = null
	video = null
	audio = null
	controls = null
	barChapter = null
	actionsMore = null
}
