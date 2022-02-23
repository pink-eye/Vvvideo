import { getSelector, convertSecondsToDuration, convertToPercentage } from 'Global/utils'

export const updateStoryboard = params => {
	let seekTooltipStoryboard = getSelector('.progress').querySelector('.seek-tooltip__storyboard')

	const { storyboard } = params

	seekTooltipStoryboard.style.setProperty('--posX', `-${storyboard.posX}px`)
	seekTooltipStoryboard.style.setProperty('--posY', `-${storyboard.posY}px`)

	seekTooltipStoryboard = null
}

export const updateSeekTooltipTime = params => {
	const { duration, skipTo } = params

	if (skipTo < 0 || skipTo > duration) return

	let progress = getSelector('.progress')
	let progressSeek = progress.querySelector('.progress__seek')
	let seekTooltipTime = progress.querySelector('.seek-tooltip__time')

	const skipToTime = convertSecondsToDuration(skipTo)
	progressSeek.setAttribute('data-seek', skipTo)
	seekTooltipTime.textContent = skipToTime

	progress = null
	progressSeek = null
	seekTooltipTime = null
}

export const updateSeekTooltipPosition = params => {
	let progress = getSelector('.progress')
	let seekTooltip = progress.querySelector('.seek-tooltip')

	const { posCursor } = params

	seekTooltip.style.setProperty('--left', `${posCursor}px`)

	progress = null
	seekTooltip = null
}

export const updateSeekTooltipChapter = params => {
	const { duration, skipTo, chapter } = params

	if (skipTo < 0 && skipTo > duration) return

	let seekTooltipChapter = getSelector('.progress').querySelector('.seek-tooltip__chapter')

	seekTooltipChapter.textContent = chapter

	seekTooltipChapter = null
}

export const updateTimeElapsed = () => {
	let progress = getSelector('.progress')
	let timeElapsed = progress.querySelector('.progress__time_elapsed')
	const { currentTime } = getSelector('video')
	const time = convertSecondsToDuration(currentTime)

	timeElapsed.textContent = time
	timeElapsed.setAttribute('datetime', time)

	progress = null
	timeElapsed = null
}

export const updateProgress = () => {
	let progress = getSelector('.progress')
	let progressSeek = progress.querySelector('.progress__seek')
	const { currentTime, duration } = getSelector('video')

	progressSeek.value = currentTime
	progress.style.setProperty('--progress', `${convertToPercentage(currentTime, duration)}%`)

	progress = null
	progressSeek = null
}

const progressBarChapterHTML = left => `<li class="progress__chapter" style="--left: ${left}"></li>`

export const visualizeProgressBarChapters = (chapters) => {
	let progress = getSelector('.progress')
	let progressChapters = progress.querySelector('.progress__chapters')
	const { duration } = getSelector('video')

	for (let index = 0, { length } = chapters; index < length; index += 1) {
		const { start_time } = chapters[index]
		const offsetLeft = `${convertToPercentage(start_time, duration)}%`
		progressChapters.insertAdjacentHTML('beforeEnd', progressBarChapterHTML(offsetLeft))
	}

	progress = null
	progressChapters = null
}

const getMinBuffered = ({ video, audio }) => {
	const vBuffered = video.buffered
	const aBuffered = audio?.buffered

	const videoLastBuffered = vBuffered.end(vBuffered.length - 1)
	const audioLastBuffered = aBuffered?.length ? aBuffered.end(aBuffered.length - 1) : null

	const minBuffered = audioLastBuffered
		? Math.min(videoLastBuffered, audioLastBuffered)
		: videoLastBuffered

	return minBuffered
}

export const updateBuffered = ({ video, audio }) => {
	if (!video.buffered.length) return

	let progress = getSelector('.progress')

	const minBuffered = getMinBuffered({ video, audio })
	progress.style.setProperty('--buffered', `${convertToPercentage(minBuffered, video.duration)}%`)

	progress = null
}

export const skipAhead = ({ target }) => {
	let progress = getSelector('.progress')
	let progressSeek = progress.querySelector('.progress__seek')
	let video = getSelector('video')
	const skipTo = target.dataset.seek ? target.dataset.seek : target.value

	progress.style.setProperty('--progress', `${convertToPercentage(skipTo, video.duration)}%`)
	progressSeek.value = skipTo

	document.activeElement.blur()

	progress = null
	progressSeek = null
	video = null

	return skipTo
}

const sponsorblockItemHTML = ({ left, width }) =>
	`<li class="sponsorblock__item" style="--left:${left};--width:${width};"></li>`

export const visualizeSegmentsSB = segments => {
	let video = getSelector('video')
	let progressSponsorblock = getSelector('.progress').querySelector('.progress__sponsorblock')

	for (let index = 0, { length } = segments; index < length; index += 1) {
		const { startTime, endTime, videoDuration } = segments[index]
		const segmentLength = endTime - startTime
		const vDuration = videoDuration !== 0 ? videoDuration : video.duration
		const width = `${convertToPercentage(segmentLength, vDuration)}%`
		const left = `${convertToPercentage(startTime, vDuration)}%`

		progressSponsorblock.insertAdjacentHTML('beforeEnd', sponsorblockItemHTML({ width, left }))
	}

	video = null
	progressSponsorblock = null
}

export const setProgress = config => {
	const { duration } = getSelector('video')
	const timeDurationContent = convertSecondsToDuration(duration)

	let progress = getSelector('.progress')
	let progressSeek = progress.querySelector('.progress__seek')
	let timeDuration = progress.querySelector('.progress__time_duration')
	let storyboard = progress.querySelector('.seek-tooltip__storyboard')

	progressSeek.setAttribute('max', duration)
	timeDuration.textContent = timeDurationContent
	timeDuration.setAttribute('datetime', timeDurationContent)

	if ('storyboard' in config) {
		if ('display' in config.storyboard) storyboard.style.display = config.storyboard.display
		if ('url' in config.storyboard)
			storyboard.style.setProperty('--url', `url(${config.storyboard.url})`)
	}

	progress = null
	progressSeek = null
	timeDuration = null
	storyboard = null
}

export const resetProgress = () => {
	let progress = getSelector('.progress')
	let progressChapters = progress.querySelector('.progress__chapters')
	let seekTooltip = progress.querySelector('.seek-tooltip')
	let seekTooltipChapter = seekTooltip.querySelector('.seek-tooltip__chapter')
	let timeDuration = progress.querySelector('.progress__time_duration')
	let timeElapsed = progress.querySelector('.progress__time_elapsed')
	let storyboard = progress.querySelector('.seek-tooltip__storyboard')
	let sponsorblock = progress.querySelector('.sponsorblock')

	while (sponsorblock.firstChild) sponsorblock.firstChild.remove()
	while (progressChapters.firstChild) progressChapters.firstChild.remove()

	timeDuration.textContent = '0:00'
	timeElapsed.textContent = '0:00'
	timeDuration.removeAttribute('datetime')
	timeElapsed.removeAttribute('datetime')
	progress.removeAttribute('style')
	seekTooltipChapter.textContent = ''

	if (storyboard.hasAttribute('style')) storyboard.removeAttribute('style')

	progress = null
	progressChapters = null
	seekTooltip = null
	seekTooltipChapter = null
	timeDuration = null
	timeElapsed = null
	storyboard = null
	sponsorblock = null
}
