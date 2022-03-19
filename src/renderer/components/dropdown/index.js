import { queryClosestByClass } from 'Global/utils'

export default class Dropdown {
	constructor(config) {
		this.callback = config.onClick
		this.dropdown = config.element
		this.initialHead = config.head
		this.isFirstTime = true

		this.handleClickBtn = this.handleClickBtn.bind(this)
		this.toggle = this.toggle.bind(this)
		this.focusCurrentChoice = this.focusCurrentChoice.bind(this)
	}

	toggle() {
		if (!this.isOpened) {
			this.dropdown.classList.add('_active')
			this.dropdownList.addEventListener('click', this.handleClickBtn)
			setTimeout(this.focusCurrentChoice, 100)
		} else {
			this.dropdown.classList.remove('_active')
			this.dropdownList.removeEventListener('click', this.handleClickBtn)
		}

		this.isOpened = !this.isOpened
	}

	#updateHead(choice) {
		const textNode = this.dropdownHead.childNodes[0]
		textNode.data = choice
	}

	focusCurrentChoice() {
		let dropdownBtnCurrent = this.dropdownList.querySelector('._current')

		if (dropdownBtnCurrent) {
			dropdownBtnCurrent.classList.remove('_current')

			dropdownBtnCurrent = null
		}

		for (let index = 0, { length } = this.dropdownBtnAll; index < length; index += 1) {
			let dropdownBtn = this.dropdownBtnAll[index]

			if (this.dropdownHead.textContent.trim() === dropdownBtn.textContent.trim()) {
				dropdownBtn.focus()
				dropdownBtn.classList.add('_current')
			}

			dropdownBtn = null
		}
	}

	handleClickBtn({ target }) {
		let dropdownBtn = queryClosestByClass(target, 'dropdown__btn')

		if (!dropdownBtn) return

		const newChoice = dropdownBtn.textContent
		this.#updateHead(newChoice)
		this.focusCurrentChoice()
		this.callback(dropdownBtn)

		dropdownBtn = null
	}

	init() {
		this.isOpened = false

		this.dropdownHead = this.dropdown.querySelector('.dropdown__head')
		this.dropdownList = this.dropdown.querySelector('.dropdown__list')
		this.dropdownBtnAll = this.dropdownList.querySelectorAll('.dropdown__btn')

		if (this.isFirstTime) {
			this.isFirstTime = false
			this.#updateHead(this.initialHead)
		}

		this.dropdownHead.addEventListener('click', this.toggle)
	}

	reset() {
		if (this.isOpened) this.toggle()

		this.dropdownHead.removeEventListener('click', this.toggle)

		this.dropdownHead = null
		this.dropdownList = null
		this.dropdownBtnAll = null
	}
}
