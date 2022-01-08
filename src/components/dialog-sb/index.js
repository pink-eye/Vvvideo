import { getSelector, convertDurationToSeconds, convertSecondsToDuration } from 'Global/utils'
import { AppStorage } from 'Global/app-storage'
import { showToast } from 'Components/toast'
import { formatDuration } from 'Components/dialog-sb/helper'
import { uuidv4 } from 'Components/video-controls/sponsorblock'

let isRecording = false

let modal = null

const hideInvalidUI = _ => {
	let dialogSb = getSelector('.dialog-sb')
	let dialogSbStart = dialogSb.querySelector('input#start')
	let dialogSbEnd = dialogSb.querySelector('input#end')
	let dialogSbWarning = dialogSb.querySelector('.dialog-sb__warning')

	if (dialogSbStart.classList.contains('_error')) {
		dialogSbStart.classList.remove('_error')
		dialogSbEnd.classList.remove('_error')
		dialogSbWarning.hidden = true
	}

	dialogSb = null
	dialogSbStart = null
	dialogSbEnd = null
	dialogSbWarning = null
}

const handleInputDialogField = ({ target }) => {
	let dialogSbField = target

	dialogSbField.value = formatDuration(dialogSbField.value)

	hideInvalidUI()

	dialogSbField = null
}

const showDialogSB = _ => {
	if (document.fullscreenElement) document.exitFullscreen()

	let video = getSelector('video')
	let audio = getSelector('.video').querySelector('audio')

	video.pause()
	audio?.pause()

	hideInvalidUI()

	const dialogSb = getSelector('.dialog-sb')
	const dialogSbStart = dialogSb.querySelector('input#start')
	const dialogSbEnd = dialogSb.querySelector('input#end')

	dialogSbStart.addEventListener('input', handleInputDialogField)
	dialogSbEnd.addEventListener('input', handleInputDialogField)

	modal.open('dialog-sb')

	video = null
	audio = null
}

export const recordSegmentSB = _ => {
	const appStorage = new AppStorage()
	const storage = appStorage.getStorage()
	const { disableSponsorblock } = storage.settings

	if (disableSponsorblock) return

	let video = getSelector('video')

	if (!video.paused || !video.ended) {
		let dialogSb = getSelector('.dialog-sb')
		let controlsSponsorblock = getSelector('.controls').querySelector('.controls__sponsorblock')

		if (!isRecording) {
			let dialogSbStart = dialogSb.querySelector('input#start')
			dialogSbStart.value = convertSecondsToDuration(video.currentTime)

			controlsSponsorblock.classList.add('_record')

			showToast('info', 'Recording of segment is started...')

			dialogSbStart = null
		} else {
			let dialogSbEnd = dialogSb.querySelector('input#end')
			dialogSbEnd.value = convertSecondsToDuration(video.currentTime)

			controlsSponsorblock.classList.remove('_record')

			showDialogSB()

			dialogSbEnd = null
		}

		isRecording = !isRecording
		dialogSb = null
		controlsSponsorblock = null
	} else showToast('error', 'You must play video!')

	video = null
}

const resetDialogSB = _ => {
	let dialogSb = getSelector('.dialog-sb')
	let dialogSbStart = dialogSb.querySelector('input#start')
	let dialogSbEnd = dialogSb.querySelector('input#end')
	let controlsSponsorblock = getSelector('.controls').querySelector('.controls__sponsorblock')

	hideInvalidUI()

	dialogSbStart.removeEventListener('input', handleInputDialogField)

	dialogSbEnd.removeEventListener('input', handleInputDialogField)

	controlsSponsorblock.removeEventListener('click', recordSegmentSB)

	dialogSb = null
	dialogSbStart = null
	dialogSbEnd = null
	controlsSponsorblock = null
}

const isValidFields = _ => {
	let dialogSb = getSelector('.dialog-sb')

	const { value: valueStart } = dialogSb.querySelector('input#start')
	const { value: valueEnd } = dialogSb.querySelector('input#end')
	const { duration } = getSelector('video')

	let patternTimecodeMMSS = /\b(?<!>)([0-5]?[0-9]):([0-5][0-9])(?!<)\b/gm
	let patternTimecodeHHMMSS = /\b(2[0-3]|[0-1]?[\d]):[0-5][\d]:[0-5][\d]\b/gm

	const result =
		((valueStart.match(patternTimecodeHHMMSS) && valueEnd.match(patternTimecodeHHMMSS)) ||
			(valueStart.match(patternTimecodeMMSS) && valueEnd.match(patternTimecodeMMSS))) &&
		convertDurationToSeconds(valueStart) < convertDurationToSeconds(valueEnd) &&
		convertDurationToSeconds(valueEnd) <= convertDurationToSeconds(duration)

	dialogSb = null

	return result
}

const showInvalidUI = _ => {
	let dialogSb = getSelector('.dialog-sb')
	let dialogSbStart = dialogSb.querySelector('input#start')
	let dialogSbEnd = dialogSb.querySelector('input#end')
	let dialogSbWarning = dialogSb.querySelector('.dialog-sb__warning')

	if (!dialogSbStart.classList.contains('_error')) {
		dialogSbStart.classList.add('_error')
		dialogSbEnd.classList.add('_error')
		dialogSbWarning.hidden ||= false
		dialogSbStart.focus()
	}

	dialogSb = null
	dialogSbStart = null
	dialogSbEnd = null
	dialogSbWarning = null
}

const sendSegmentSB = async _ => {
	if (isValidFields()) {
		let dialogSb = getSelector('.dialog-sb')

		const { id: videoId } = getSelector('.video').dataset
		const { id: category } = dialogSb.querySelector('input[name="category"]:checked')
		const { value: valueStart } = dialogSb.querySelector('input#start')
		const { value: valueEnd } = dialogSb.querySelector('input#end')

		const startTime = convertDurationToSeconds(valueStart)
		const endTime = convertDurationToSeconds(valueEnd)
		const segment = { startTime, endTime, category }

		try {
			await API.postSponsorblockInfo(videoId, uuidv4(), segment)
			modal.close()
			showToast('good', 'Segment was sent successfully!')
		} catch ({ message }) {
			showToast('error', message)
		}

		dialogSb = null
	} else showInvalidUI()
}

const onCloseModal = _ => {
	let video = getSelector('.video')

	video.play()

	resetDialogSB()

	video = null
}

export const initDialogSB = _ => {
	const dialogSb = getSelector('.dialog-sb')
	const dialogSbBtnSend = dialogSb.querySelector('.dialog-sb__btn_send')
	const dialogSbBtnCancel = dialogSb.querySelector('.dialog-sb__btn_cancel')
	const controlsSponsorblock = getSelector('.controls').querySelector('.controls__sponsorblock')

	isRecording &&= false

	modal = new GraphModal({ isClose: onCloseModal })

	dialogSbBtnSend.addEventListener('click', sendSegmentSB)

	dialogSbBtnCancel.addEventListener('click', _ => modal.close())

	controlsSponsorblock.addEventListener('click', recordSegmentSB)
}
