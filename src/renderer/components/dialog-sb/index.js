import cs from 'Global/cacheSelectors'
import {
	convertDurationToSeconds,
	convertSecondsToDuration,
	isChild,
} from 'Global/utils'
import AppStorage from 'Global/AppStorage'
import showToast from 'Components/toast'
import { formatDuration } from 'Components/dialog-sb/helper'
import { uuidv4 } from 'Components/video-controls/sponsorblock'

let isRecording = false
let modal = null

const hideInvalidUI = () => {
	let dialogSb = cs.get('.dialog-sb')
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

const handleInputField = ({ target }) => {
	let dialogSbField = target

	dialogSbField.value = formatDuration(dialogSbField.value)

	hideInvalidUI()

	dialogSbField = null
}

const handleInputDialog = event => {
	let { target } = event

	if (target.matches('input[type="text"]')) {
		handleInputField(event)
	}

	target = null
}

const handleClickDialog = event => {
	let { target } = event

	if (isChild(target, '.dialog-sb__btn_send')) {
		sendSegmentSB()
	}

	if (isChild(target, '.dialog-sb__btn_cancel')) {
		modal.close()
	}

	target = null
}

const showDialogSB = () => {
	if (document.fullscreenElement) document.exitFullscreen()

	let video = cs.get('video')
	let audio = cs.get('.video').querySelector('audio')

	video.pause()
	audio && audio.pause()

	hideInvalidUI()

	let dialogSb = cs.get('.dialog-sb')

	dialogSb.addEventListener('click', handleClickDialog)
	dialogSb.addEventListener('input', handleInputDialog)

	modal.open('dialog-sb')

	video = null
	audio = null
	dialogSb = null
}

const recordSegmentSB = ({ onStart, onEnd }) => {
	const appStorage = new AppStorage()
	const storage = appStorage.get()
	const { disableSponsorblock } = storage.settings

	if (disableSponsorblock) return

	modal = new GraphModal({ isClose: handleCloseModal })

	let video = cs.get('video')

	if (!video.paused || !video.ended) {
		let dialogSb = cs.get('.dialog-sb')

		if (!isRecording) {
			let dialogSbStart = dialogSb.querySelector('input#start')
			dialogSbStart.value = convertSecondsToDuration(video.currentTime)

			onStart()
			showToast('info', 'Recording of segment is started...')

			dialogSbStart = null
		} else {
			let dialogSbEnd = dialogSb.querySelector('input#end')
			dialogSbEnd.value = convertSecondsToDuration(video.currentTime)

			onEnd()
			showDialogSB()

			dialogSbEnd = null
		}

		isRecording = !isRecording
		dialogSb = null
	} else showToast('error', 'You must play video!')

	video = null
}

const resetDialogSB = () => {
	let dialogSb = cs.get('.dialog-sb')
	let dialogSbStart = dialogSb.querySelector('input#start')
	let dialogSbEnd = dialogSb.querySelector('input#end')

	hideInvalidUI()

	dialogSbStart.value = ''
	dialogSbEnd.value = ''

	dialogSb.removeEventListener('click', handleClickDialog)
	dialogSb.removeEventListener('input', handleInputDialog)

	isRecording &&= false

	dialogSb = null
	dialogSbStart = null
	dialogSbEnd = null
}

const isValidFields = () => {
	let dialogSb = cs.get('.dialog-sb')

	const { value: valueStart } = dialogSb.querySelector('input#start')
	const { value: valueEnd } = dialogSb.querySelector('input#end')
	const { duration } = cs.get('video')

	let patternTimecodeMMSS = /\b(?<!>)([0-5]?[0-9]):([0-5][0-9])(?!<)\b/gm
	let patternTimecodeHHMMSS = /\b(2[0-3]|[0-1]?[\d]):[0-5][\d]:[0-5][\d]\b/gm

	const result =
		((valueStart.match(patternTimecodeHHMMSS) && valueEnd.match(patternTimecodeHHMMSS)) ||
			(valueStart.match(patternTimecodeMMSS) && valueEnd.match(patternTimecodeMMSS))) &&
		convertDurationToSeconds(valueStart) < convertDurationToSeconds(valueEnd) &&
		convertDurationToSeconds(valueEnd) <= duration

	dialogSb = null

	return result
}

const showInvalidUI = () => {
	let dialogSb = cs.get('.dialog-sb')
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

const sendSegmentSB = async () => {
	if (isValidFields()) {
		let dialogSb = cs.get('.dialog-sb')

		const { id: videoId } = cs.get('.video').dataset
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

const handleCloseModal = () => {
	let video = cs.get('video')

	video.play()

	resetDialogSB()

	video = null
}

export default recordSegmentSB
