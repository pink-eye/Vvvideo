import { isChild } from 'Global/utils'
import { qualityItemHTML, captionItemHTML, captionItemDefaultHTML } from './helper'

export default class Menu {
	constructor() {
		this.isOpened = false
		this.config = {}

		this.menu = document.querySelector('.menu')
		this.menuContent = this.menu.querySelector('.menu__content')

		this.handleClick = this.handleClick.bind(this)
	}

	#showPanel(panel) {
		let menuPanel = this.menu.querySelector(`.menu__panel[data-panel="${panel}"]`)

		this.menuContent.classList.add('_opened')
		menuPanel.classList.add('_active')

		menuPanel = null
	}

	#hidePanel() {
		let menuPanelActive = this.menu.querySelector(`.menu__panel._active`)

		this.menuContent.classList.remove('_opened')
		menuPanelActive?.classList.remove('_active')

		menuPanelActive = null
	}

	#isMenuBtn(target) {
		return isChild(target, '.menu__btn')
	}

	#isPanelBtn(target) {
		return isChild(target, '.panel__btn')
	}

	handleClick(event) {
		let { target } = event

		if (this.#isMenuBtn(target)) {
			let menuBtn = target.closest('.menu__btn')
			const { panel } = menuBtn.dataset

			panel !== 'first' ? this.#showPanel(panel) : this.#hidePanel()

			menuBtn = null
		}

		if (this.#isPanelBtn(target)) {
			let panelBtn = target.closest('.panel__btn')

			if (panelBtn.classList.contains('_current')) {
				panelBtn = null
				return
			}

			const { panel } = target.closest('.menu__panel').dataset

			switch (panel) {
				case 'quality': {
					const reqFormat = this.config.formats.find(
						({ qualityLabel }) => qualityLabel === panelBtn.dataset.quality
					)
					this.config.handleClickQuality(reqFormat.url)
					this.#updateCurrents({ quality: reqFormat.qualityLabel })
					break
				}
				case 'speed': {
					this.config.handleClickSpeed(panelBtn.dataset.speed)
					this.#updateCurrents({ speed: panelBtn.textContent.trim() })
					break
				}
				case 'captions': {
					this.config.handleClickCaption(panelBtn.dataset)
					this.#updateCurrents({ captions: panelBtn.dataset.label })
					break
				}
			}

			panelBtn = null
		}

		target = null
	}

	open() {
		this.menu.addEventListener('click', this.handleClick)
		this.menu.classList.add('_opened')
		this.isOpened = true
	}

	close() {
		this.isOpened = false
		this.menu.classList.remove('_opened')
		this.menu.removeEventListener('click', this.handleClick)
		this.#hidePanel()
	}

	#insertQualities(formats) {
		let menuPanelListQuality = this.menu.querySelector(
			'.menu__panel[data-panel="quality"] > .panel__list'
		)

		for (let index = 0, { length } = formats; index < length; index += 1) {
			const { qualityLabel } = formats[index]
			menuPanelListQuality.insertAdjacentHTML('beforeEnd', qualityItemHTML(qualityLabel))
		}
		menuPanelListQuality = null
	}

	#insertCaptions(captions) {
		let menuPanelListCaptions = this.menu.querySelector(
			'.menu__panel[data-panel="captions"] > .panel__list'
		)

		for (let index = 0, { length } = captions; index < length; index += 1) {
			const caption = captions[index]
			menuPanelListCaptions.insertAdjacentHTML('afterBegin', captionItemHTML(caption))
		}

		menuPanelListCaptions.insertAdjacentHTML('afterBegin', captionItemDefaultHTML())
		menuPanelListCaptions = null
	}

	#hideMenuBtn(panel) {
		let menuBtnPanel = this.menu.querySelector(`.menu__btn[data-panel="${panel}"]`)

		menuBtnPanel.style.display = 'none'

		menuBtnPanel = null
	}

	#updateCurrents(current) {
		const currentArray = Object.entries(current)

		currentArray.forEach(([key, value]) => {
			let menuBtnCurrent = this.menu.querySelector(
				`.menu__btn[data-panel="${key}"] > .current`
			)
			let panelBtnAll = this.menu.querySelectorAll(
				`.menu__panel[data-panel="${key}"] .panel__btn`
			)
			let panelBtnLastCurrent = this.menu.querySelector(
				`.menu__panel[data-panel="${key}"] .panel__btn._current`
			)

			panelBtnLastCurrent?.classList.remove('_current')
			menuBtnCurrent.textContent = value

			for (let index = 0, { length } = panelBtnAll; index < length; index += 1) {
				let panelBtn = panelBtnAll[index]

				if (panelBtn.textContent.trim() === value) panelBtn.classList.add('_current')

				panelBtn = null
			}

			menuBtnCurrent = null
			panelBtnAll = null
		})
	}

	init(params) {
		if ('handleClickSpeed' in params) this.config.handleClickSpeed = params.handleClickSpeed

		if ('formats' in params) {
			this.config.formats = params.formats
			this.#insertQualities(this.config.formats)

			if ('handleClickQuality' in params) {
				this.config.handleClickQuality = params.handleClickQuality
			}
		}

		if ('captions' in params && params.captions.length) {
			this.config.captions = params.captions
			this.#insertCaptions(this.config.captions)

			if ('handleClickCaption' in params) {
				this.config.handleClickCaption = params.handleClickCaption
			}
		} else this.#hideMenuBtn('captions')

		this.#updateCurrents(params.current)
	}

	reset() {
		this.isOpened = false
		this.config = {}

		let menuPanelListQuality = this.menu.querySelector(
			'.menu__panel[data-panel="quality"] > .panel__list'
		)

		while (menuPanelListQuality.firstChild) menuPanelListQuality.firstChild.remove()

		menuPanelListQuality = null

		let menuBtnCaptions = this.menu.querySelector('.menu__btn[data-panel="captions"]')

		if (menuBtnCaptions.hasAttribute('style')) {
			menuBtnCaptions.removeAttribute('style')
		} else {
			let menuPanelListCaptions = this.menu.querySelector(
				'.menu__panel[data-panel="captions"] > .panel__list'
			)

			while (menuPanelListCaptions.firstChild) menuPanelListCaptions.firstChild.remove()

			menuPanelListCaptions = null
		}

		menuBtnCaptions = null

		this.close()
	}
}
