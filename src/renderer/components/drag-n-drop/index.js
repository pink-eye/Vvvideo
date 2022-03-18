import cs from 'Global/CacheSelectors'
import { reloadApp } from 'Global/utils'

const noop = () => {}

export default class DragNDrop {
	constructor() {
		this.dndBody = cs.get('.settings').querySelector('.drag-n-drop')
		this.dndTip = this.dndBody.querySelector('.drag-n-drop__tip')
		this.dndField = this.dndBody.querySelector('.drag-n-drop__field')
		this.dndImport = this.dndBody.querySelector('.drag-n-drop__btn.btn-accent')
		this.tips = {
			invalidFile: "I've not found a JSON file.\n Ensure you interacted this area",
			success: 'Successfully! Wait for refresh...',
			fail: "The file doesn't contain subscriptions",
			default: 'Drag and drop your file here or click in this area',
			file: "I've got a",
		}
		this.classNames = {
			valid: '_valid',
			invalid: '_invalid',
			info: '_info',
		}
		this.isDisabledImport = true

		this.handleFile = this.handleFile.bind(this)
		this.handleClickImport = this.handleClickImport.bind(this)
	}

	#enableImport() {
		if (!this.isDisabledImport) return

		this.isDisabledImport = false
		this.dndImport.disabled = false
		this.dndImport.addEventListener('click', this.handleClickImport)
	}

	#disableImport() {
		if (this.isDisabledImport) return

		this.isDisabledImport = true
		this.dndImport.disabled = true
		this.dndImport.removeEventListener('click', this.handleClickImport)
	}

	#resetState() {
		const classNameArray = Object.values(this.classNames)

		classNameArray.forEach(className => {
			if (this.dndBody.classList.contains(className)) {
				this.dndBody.classList.remove(className)
				return
			}
		})
		this.dndTip.textContent = this.tips.default
	}

	#setState(className, tip) {
		this.#resetState()
		this.dndBody.classList.add(className)
		this.dndTip.textContent = tip
	}

	handleFile(event) {
		this.file = event.target.files[0]

		this.#setState(this.classNames.info, `${this.tips.file} ${this.file.name}`)
		this.#enableImport()
	}

	handleClickImport() {
		if (this.isDisabledImport) return

		const isJSON = /\.(json)$/i.test(this.file.name)

		if (this.dndField.value === '' || !isJSON) {
			this.#setState(this.classNames.invalid, this.tips.invalidFile)
		} else {
			this.#disableImport()
			this.#readFile(this.file)
		}
	}

	#readFile(file) {
		const reader = new FileReader()
		reader.readAsText(file)

		const handleLoadReader = () => {
			const data = JSON.parse(reader.result)
			const hasSubscriptions = data.subscriptions

			if (!hasSubscriptions) {
				this.#setState(this.classNames.invalid, this.tips.fail)
			} else {
				this.#setState(this.classNames.valid, this.tips.success)
				this.afterReadFile(data)
				setTimeout(reloadApp, 3000)
			}
		}

		reader.addEventListener('load', handleLoadReader, { once: true })
	}

	init(config) {
		this.afterReadFile = config.afterReadFile || noop

		this.dndField.addEventListener('change', this.handleFile)
	}

	reset() {
		if (!this.file) return

		this.#resetState()
		this.#disableImport()
		this.file = null

		this.dndField.removeEventListener('change', this.handleFile)
	}
}
