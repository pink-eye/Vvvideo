import { getSelector, convertDurationToSeconds, formatDuration, uuidv4, convertSecondsToDuration } from '../global'
import { isPlaying, toggleFullscreen, playVideoPlayer, pauseVideoPlayer } from './video-player'
import { showToast } from './toast'
import { AppStorage } from './app-storage'

let isRecording = false

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

const handleInputDialogField = event => {
	let dialogSbField = event.target
	dialogSbField.value = formatDuration(dialogSbField.value)

	hideInvalidUI()

	dialogSbField = null
}

const showDialogSB = _ => {
	if (document.fullscreenElement) toggleFullscreen()

	pauseVideoPlayer()
	hideInvalidUI()

	const dialogSb = getSelector('.dialog-sb')
	const dialogSbStart = dialogSb.querySelector('input#start')
	const dialogSbEnd = dialogSb.querySelector('input#end')

	dialogSbStart.addEventListener('input', handleInputDialogField)
	dialogSbEnd.addEventListener('input', handleInputDialogField)

	const modal = new GraphModal()
	modal.open('dialog-sb')
}

export const recordSegmentSB = _ => {
	const appStorage = new AppStorage()
	const storage = appStorage.getStorage()
	const { disableSponsorblock } = storage.settings

	if (disableSponsorblock) return

	let video = getSelector('video')
	let controlsSponsorblock = getSelector('.controls').querySelector('.controls__sponsorblock')

	let dialogSb = getSelector('.dialog-sb')

	if (isPlaying(video)) {
		if (!isRecording) {
			let dialogSbStart = dialogSb.querySelector('input#start')
			dialogSbStart.value = convertSecondsToDuration(video.currentTime)

			isRecording = true

			controlsSponsorblock.classList.add('_record')

			showToast('info', 'Recording of segment is started...')

			dialogSbStart = null
		} else {
			let dialogSbEnd = dialogSb.querySelector('input#end')
			dialogSbEnd.value = convertSecondsToDuration(video.currentTime)

			isRecording = false

			controlsSponsorblock.classList.remove('_record')

			showDialogSB()

			dialogSbEnd = null
		}
	} else showToast('error', 'You must play video!')

	video = null
	controlsSponsorblock = null
	dialogSb = null
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
	let dialogSbStart = dialogSb.querySelector('input#start')
	let dialogSbEnd = dialogSb.querySelector('input#end')
	let video = getSelector('video')

	const videoDuration = video.duration

	const patternTimecodeMSS = /^[0-9]:[0-5][0-9]$/g
	const patternTimecodeMMSS = /^[0-5][0-9]:[0-5][0-9]$/g
	const patternTimecodeHMMSS = /^[0-9]:[0-5][0-9]:[0-5][0-9]$/g
	const patternTimecodeHHMMSS = /^[0-2][0-3]:[0-5][0-9]:[0-5][0-9]$/g

	const result =
		((dialogSbStart.value.match(patternTimecodeHHMMSS) && dialogSbEnd.value.match(patternTimecodeHHMMSS)) ||
			(dialogSbStart.value.match(patternTimecodeHMMSS) && dialogSbEnd.value.match(patternTimecodeHMMSS)) ||
			(dialogSbStart.value.match(patternTimecodeMMSS) && dialogSbEnd.value.match(patternTimecodeMMSS)) ||
			(dialogSbStart.value.match(patternTimecodeMSS) && dialogSbEnd.value.match(patternTimecodeMSS))) &&
		convertDurationToSeconds(dialogSbStart.value) < convertDurationToSeconds(dialogSbEnd.value) &&
		convertDurationToSeconds(dialogSbEnd.value) <= convertDurationToSeconds(videoDuration)

	dialogSb = null
	dialogSbStart = null
	dialogSbEnd = null
	video = null

	return result
}

const showInvalidUI = _ => {
	let dialogSb = getSelector('.dialog-sb')
	let dialogSbStart = dialogSb.querySelector('input#start')
	let dialogSbEnd = dialogSb.querySelector('input#end')
	let dialogSbWarning = dialogSb.querySelector('.dialog-sb__warning')

	dialogSbStart.classList.add('_error')
	dialogSbEnd.classList.add('_error')
	dialogSbWarning.hidden = false
	dialogSbStart.focus()

	dialogSb = null
	dialogSbStart = null
	dialogSbEnd = null
	dialogSbWarning = null
}

const sendSegmentSB = async _ => {
	let videoId = getSelector('.video').dataset.id
	let dialogSb = getSelector('.dialog-sb')
	let dialogSbStart = dialogSb.querySelector('input#start')
	let dialogSbEnd = dialogSb.querySelector('input#end')
	let dialogSbCategory = dialogSb.querySelector('input[name="category"]:checked')
	const modal = new GraphModal()

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
		}
	} else showInvalidUI()

	dialogSb = null
	dialogSbStart = null
	dialogSbEnd = null
	dialogSbCategory = null
}

const onCloseModal = _ => {
	playVideoPlayer()
	resetDialogSB()
}

export const initDialogSB = _ => {
	const dialogSb = getSelector('.dialog-sb')
	const dialogSbBtnSend = dialogSb.querySelector('.dialog-sb__btn_send')
	const dialogSbBtnCancel = dialogSb.querySelector('.dialog-sb__btn_cancel')
	const controlsSponsorblock = getSelector('.controls').querySelector('.controls__sponsorblock')

	isRecording &&= false

	const modal = new GraphModal({ isClose: onCloseModal })

	dialogSbBtnSend.addEventListener('click', sendSegmentSB)

	dialogSbBtnCancel.addEventListener('click', _ => {
		modal.close()
	})

	controlsSponsorblock.addEventListener('click', recordSegmentSB)
}
