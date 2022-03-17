import cs from 'Global/cacheSelectors'
import { convertDurationToSeconds, convertSecondsToDuration, isChild } from 'Global/utils'
import AppStorage from 'Global/AppStorage'
import showToast from 'Components/toast'
import MicroModal from 'micromodal'
import { formatDuration } from 'Components/dialog-sb/helper'
import { uuidv4 } from 'Components/video-controls/sponsorblock'

export default class DialogSB {
	constructor() {
		this.dialogSb = cs.get('.dialog-sb')
		this.dialogSbStart = this.dialogSb.querySelector('input#start')
		this.dialogSbEnd = this.dialogSb.querySelector('input#end')
		this.dialogSbWarning = this.dialogSb.querySelector('.dialog-sb__warning')

		this.handleInputDialog = this.handleInputDialog.bind(this)
		this.handleClickDialog = this.handleClickDialog.bind(this)
	}

	#hideInvalidUI() {
		if (this.dialogSbStart.classList.contains('_error')) {
			this.dialogSbStart.classList.remove('_error')
			this.dialogSbEnd.classList.remove('_error')
			this.dialogSbWarning.hidden = true
		}
	}

	#showInvalidUI() {
		if (!this.dialogSbStart.classList.contains('_error')) {
			this.dialogSbStart.classList.add('_error')
			this.dialogSbEnd.classList.add('_error')
			this.dialogSbWarning.hidden = false
			this.dialogSbStart.focus()
		}
	}

	handleInputField({ target }) {
		let dialogSbField = target

		dialogSbField.value = formatDuration(dialogSbField.value)

		this.#hideInvalidUI()

		dialogSbField = null
	}

	handleInputDialog(event) {
		if (event.target.matches('input[type="text"]')) {
			this.handleInputField(event)
		}
	}

	handleClickDialog(event) {
		if (isChild(event.target, '.dialog-sb__btn_send')) {
			this.send()
		}

		if (isChild(event.target, '.dialog-sb__btn_cancel')) {
			MicroModal.close('dialog-sb')
		}
	}

	show() {
		if ('beforeOpen' in this.config) {
			this.config.beforeOpen()
		}

		this.dialogSb.addEventListener('click', this.handleClickDialog)
		this.dialogSb.addEventListener('input', this.handleInputDialog)

		MicroModal.show('dialog-sb', { awaitCloseAnimation: true, onClose: () => this.reset() })
	}

	isValidFields() {
		const { value: valueStart } = this.dialogSbStart
		const { value: valueEnd } = this.dialogSbEnd

		let patternTimecodeMMSS = /\b(?<!>)([0-5]?[0-9]):([0-5][0-9])(?!<)\b/gm
		let patternTimecodeHHMMSS = /\b(2[0-3]|[0-1]?[\d]):[0-5][\d]:[0-5][\d]\b/gm

		const isValid =
			((valueStart.match(patternTimecodeHHMMSS) && valueEnd.match(patternTimecodeHHMMSS)) ||
				(valueStart.match(patternTimecodeMMSS) && valueEnd.match(patternTimecodeMMSS))) &&
			convertDurationToSeconds(valueStart) < convertDurationToSeconds(valueEnd) &&
			convertDurationToSeconds(valueEnd) <= this.config.duration

		return isValid
	}

	send() {
		if (this.isValidFields()) {
			const { value: valueStart } = this.dialogSbStart
			const { value: valueEnd } = this.dialogSbEnd
			const { id: category } = this.dialogSb.querySelector('input[name="category"]:checked')

			const startTime = convertDurationToSeconds(valueStart)
			const endTime = convertDurationToSeconds(valueEnd)
			const segment = { startTime, endTime, category }

			API.postSponsorblockInfo(this.config.videoId, uuidv4(), segment)
				.then(() => {
					MicroModal.close('dialog-sb')
					showToast('good', 'Segment was sent successfully!')
				})
				.catch(({ message }) => showToast('error', message))
		} else this.#showInvalidUI()
	}

	toggleRecording(params) {
		const appStorage = new AppStorage()
		const storage = appStorage.get()
		const { disableSponsorblock } = storage.settings

		if (disableSponsorblock) return

		if (!this.isRecording) {
			this.dialogSbStart.value = convertSecondsToDuration(params.currentTime)

			showToast('info', 'Recording of segment is started...')

			if ('onStartRecording' in params) {
				params.onStartRecording()
			}
		} else {
			this.dialogSbEnd.value = convertSecondsToDuration(params.currentTime)

			this.show()

			if ('onEndRecording' in params) {
				params.onEndRecording()
			}
		}

		this.isRecording = !this.isRecording
	}

	init(config) {
		this.config = config
		this.isRecording = false
	}

	reset() {
		this.#hideInvalidUI()

		this.dialogSbStart.value = ''
		this.dialogSbEnd.value = ''

		this.dialogSb.removeEventListener('click', this.handleClickDialog)
		this.dialogSb.removeEventListener('input', this.handleInputDialog)

		this.isRecording &&= false
	}
}
