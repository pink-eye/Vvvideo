import cs from 'Global/cacheSelectors'
import { convertSecondsToDuration, convertToPercentage } from 'Global/utils'
import { getPosStroryboard, progressBarChapterHTML, sponsorblockItemHTML } from './helper'

export default class Progress {
	constructor() {
		this.progress = cs.get('.progress')
		this.progressBar = this.progress.querySelector('.progress__bar')
		this.progressChapters = this.progress.querySelector('.progress__chapters')
		this.progressSeek = this.progress.querySelector('.progress__seek')
		this.progressSponsorblock = this.progress.querySelector('.progress__sponsorblock')
		this.seekTooltip = this.progress.querySelector('.seek-tooltip')
		this.storyboard = this.seekTooltip.querySelector('.seek-tooltip__storyboard')
		this.seekTooltipContainer = this.seekTooltip.querySelector('.seek-tooltip__container')
		this.seekTooltipChapter = this.seekTooltip.querySelector('.seek-tooltip__chapter')
	}

	init(config) {
		this.isLive = config.isLive
		this.duration = config.duration

		if (this.isLive) return

		const timeDuration = convertSecondsToDuration(this.duration)
		this.progress.dataset.timeDuration = timeDuration
		this.progressSeek.setAttribute('max', this.duration)

		if ('storyboard' in config) {
			const { storyboard } = config

			if ('display' in storyboard) {
				this.storyboard.style.display = storyboard.display
			}

			if ('url' in storyboard) {
				this.storyboard.style.setProperty('--url', `url(${storyboard.url})`)
			}
		}
	}

	#moveStoryboardImageSprite(skipTo) {
		const { posX, posY } = getPosStroryboard(this.duration, skipTo, 100)

		this.storyboard.style.setProperty('--pos-x', `-${posX}px`)
		this.storyboard.style.setProperty('--pos-y', `-${posY}px`)
	}

	#updateSeekTooltipTime(skipTo) {
		const timeSkipTo = convertSecondsToDuration(skipTo)

		this.progressSeek.setAttribute('data-seek', skipTo)
		this.seekTooltipContainer.dataset.time = timeSkipTo
	}

	#moveSeekTooltip(pageX) {
		const rectProgressBar = this.progressBar.getBoundingClientRect()
		const posCursor = pageX - rectProgressBar.left

		this.seekTooltip.style.setProperty('--left', `${posCursor}px`)
	}

	#updateSeekTooltipChapter(chapter) {
		this.seekTooltipChapter.textContent = chapter
	}

	updateSeekTooltip(params) {
		const { pageX, chapter, skipTo } = params

		this.#moveSeekTooltip(pageX)
		this.#updateSeekTooltipTime(skipTo)

		if (this.isLive) return

		this.#moveStoryboardImageSprite(skipTo)
		this.#updateSeekTooltipChapter(chapter)
	}

	updateTimeElapsed(params) {
		this.progress.dataset.timeElapsed = convertSecondsToDuration(params.currentTime)
	}

	update(params) {
		const { currentTime } = params

		this.updateTimeElapsed(params)

		if (this.isLive) return

		const progressValue = convertToPercentage(currentTime, this.duration)
		this.progress.style.setProperty('--progress', `${progressValue}%`)

		this.progressSeek.value = currentTime
	}

	visualizeChapters({ chapters }) {
		for (let index = 0, { length } = chapters; index < length; index += 1) {
			const { start_time } = chapters[index]
			const offsetLeft = `${convertToPercentage(start_time, this.duration)}%`
			this.progressChapters.insertAdjacentHTML(
				'beforeEnd',
				progressBarChapterHTML(offsetLeft)
			)
		}
	}

	#getMinBuffered({ video, audio }) {
		const vBuffered = video.buffered
		const aBuffered = audio?.buffered

		const videoLastBuffered = vBuffered.end(vBuffered.length - 1)
		const audioLastBuffered = aBuffered?.length ? aBuffered.end(aBuffered.length - 1) : null

		const minBuffered = audioLastBuffered
			? Math.min(videoLastBuffered, audioLastBuffered)
			: videoLastBuffered

		return minBuffered
	}

	updateBuffered({ video, audio }) {
		if (!video.buffered.length) return

		const minBuffered = this.#getMinBuffered({ video, audio })
		this.progress.style.setProperty(
			'--buffered',
			`${convertToPercentage(minBuffered, this.duration)}%`
		)
	}

	skipAhead({ target }) {
		const skipTo = target.dataset.seek ? target.dataset.seek : target.value

		this.progress.style.setProperty(
			'--progress',
			`${convertToPercentage(skipTo, this.duration)}%`
		)
		this.progressSeek.value = skipTo

		queueMicrotask(() => document.activeElement.blur())

		return skipTo
	}

	visualizeSegmentsSB(segments) {
		for (let index = 0, { length } = segments; index < length; index += 1) {
			const { startTime, endTime } = segments[index]
			const segmentLength = endTime - startTime
			const width = `${convertToPercentage(segmentLength, this.duration)}%`
			const left = `${convertToPercentage(startTime, this.duration)}%`

			this.progressSponsorblock.insertAdjacentHTML(
				'beforeEnd',
				sponsorblockItemHTML({ width, left })
			)
		}
	}

	reset() {
		while (this.progressSponsorblock.firstChild) this.progressSponsorblock.firstChild.remove()
		while (this.progressChapters.firstChild) this.progressChapters.firstChild.remove()

		this.progress.removeAttribute('data-time-elapsed')
		this.progress.removeAttribute('data-time-duration')
		this.progress.removeAttribute('style')
		this.seekTooltipChapter.textContent = ''
		this.seekTooltipContainer.removeAttribute('data-time')

		if (this.storyboard.hasAttribute('style')) this.storyboard.removeAttribute('style')
	}
}
