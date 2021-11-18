const handleInputDialogField = event => {
	let dialogSbField = event.target
	dialogSbField.value = formatDuration(dialogSbField.value)

	hideInvalidUI()

	dialogSbField = null
}

const resetDialogSB = _ => {
	let dialogSb = _io_q('.dialog-sb')
	let dialogSbStart = dialogSb.querySelector('input#start')
	let dialogSbEnd = dialogSb.querySelector('input#end')
	let controlsSponsorblock = _io_q('.controls').querySelector('.controls__sponsorblock')

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
	let dialogSb = _io_q('.dialog-sb')
	let dialogSbStart = dialogSb.querySelector('input#start')
	let dialogSbEnd = dialogSb.querySelector('input#end')

	let patternTimecodeMSS = /^[0-9]:[0-5][0-9]$/g
	let patternTimecodeMMSS = /^[0-5][0-9]:[0-5][0-9]$/g
	let patternTimecodeHMMSS = /^[0-9]:[0-5][0-9]:[0-5][0-9]$/g
	let patternTimecodeHHMMSS = /^[0-2][0-3]:[0-5][0-9]:[0-5][0-9]$/g

	let result =
		((dialogSbStart.value.match(patternTimecodeHHMMSS) && dialogSbEnd.value.match(patternTimecodeHHMMSS)) ||
			(dialogSbStart.value.match(patternTimecodeHMMSS) && dialogSbEnd.value.match(patternTimecodeHMMSS)) ||
			(dialogSbStart.value.match(patternTimecodeMMSS) && dialogSbEnd.value.match(patternTimecodeMMSS)) ||
			(dialogSbStart.value.match(patternTimecodeMSS) && dialogSbEnd.value.match(patternTimecodeMSS))) &&
		convertDurationToSeconds(dialogSbStart.value) < convertDurationToSeconds(dialogSbEnd.value) &&
		convertDurationToSeconds(dialogSbEnd.value) <= convertDurationToSeconds(timeDuration.textContent)

	dialogSb = null
	dialogSbStart = null
	dialogSbEnd = null

	return result
}

const showInvalidUI = _ => {
	let dialogSb = _io_q('.dialog-sb')
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

const hideInvalidUI = _ => {
	let dialogSb = _io_q('.dialog-sb')
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

const sendSegmentSB = async _ => {
	let videoId = _io_q('.video').dataset.id
	let dialogSb = _io_q('.dialog-sb')
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

const recordSegmentSB = _ => {
	const { disableSponsorblock } = storage.settings

	if (disableSponsorblock) return

	let video = _io_q('video')
	let controlsSponsorblock = _io_q('.controls').querySelector('.controls__sponsorblock')

	let dialogSb = _io_q('.dialog-sb')

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

const showDialogSB = _ => {
	if (document.fullscreenElement) toggleFullscreen()

	pauseVideoPlayer()
	hideInvalidUI()

	const dialogSb = _io_q('.dialog-sb')
	const dialogSbStart = dialogSb.querySelector('input#start')
	const dialogSbEnd = dialogSb.querySelector('input#end')

	dialogSbStart.addEventListener('input', handleInputDialogField)
	dialogSbEnd.addEventListener('input', handleInputDialogField)

	const modal = new GraphModal()
	modal.open('dialog-sb')
}

let isRecording = false

const onCloseModal = _ => {
	playVideoPlayer()
	resetDialogSB()
}

const initDialogSB = _ => {
	const dialogSb = _io_q('.dialog-sb')
	const dialogSbBtnSend = dialogSb.querySelector('.dialog-sb__btn_send')
	const dialogSbBtnCancel = dialogSb.querySelector('.dialog-sb__btn_cancel')
	const controlsSponsorblock = _io_q('.controls').querySelector('.controls__sponsorblock')

	isRecording &&= false


	const modal = new GraphModal({ isClose: onCloseModal })

	dialogSbBtnSend.addEventListener('click', sendSegmentSB)

	dialogSbBtnCancel.addEventListener('click', _ => {
		modal.close()
	})

	controlsSponsorblock.addEventListener('click', recordSegmentSB)
}
