import { getSelector, isChild } from 'Global/utils'

let isOpened = false
let config = {}

const showPanel = panel => {
	let controls = getSelector('.controls')
	let menu = controls.querySelector('.menu')
	let menuContent = menu.querySelector('.menu__content')
	let menuPanel = menu.querySelector(`.menu__panel[data-panel="${panel}"]`)

	menuContent.classList.add('_opened')
	menuPanel.classList.add('_active')

	menuContent = null
	menuPanel = null
	menu = null
	controls = null
}

const hidePanel = () => {
	let controls = getSelector('.controls')
	let menu = controls.querySelector('.menu')
	let menuContent = menu.querySelector('.menu__content')
	let menuPanelActive = menu.querySelector(`.menu__panel._active`)

	menuContent.classList.remove('_opened')
	menuPanelActive?.classList.remove('_active')

	menuContent = null
	menuPanelActive = null
	menu = null
	controls = null
}

const isMenuBtn = target => isChild(target, '.menu__btn')
const isPanelBtn = target => isChild(target, '.panel__btn')

const handleClickMenu = event => {
	let { target } = event

	if (isMenuBtn(target)) {
		let menuBtn = target.closest('.menu__btn')
		const { panel } = menuBtn.dataset

		panel !== 'first' ? showPanel(panel) : hidePanel()

		menuBtn = null
	}

	if (isPanelBtn(target)) {
		let panelBtn = target.closest('.panel__btn')

		if (panelBtn.classList.contains('_current')) {
			panelBtn = null
			return
		}

		const { panel } = target.closest('.menu__panel').dataset

		switch (panel) {
			case 'quality':
				const reqFormat = config.formats.find(
					({ qualityLabel }) => qualityLabel === panelBtn.dataset.quality
				)
				config.handleClickQuality(reqFormat.url)
				updateCurrents({ quality: reqFormat.qualityLabel })
				break
			case 'speed':
				config.handleClickSpeed(panelBtn.dataset.speed)
				updateCurrents({ speed: panelBtn.textContent.trim() })
				break
			case 'captions':
				config.handleClickCaption(panelBtn.dataset)
				updateCurrents({ captions: panelBtn.dataset.label })
				break
		}

		panelBtn = null
	}

	target = null
}

export const openMenu = () => {
	let controls = getSelector('.controls')
	let menu = controls.querySelector('.menu')

	menu.addEventListener('click', handleClickMenu)
	menu.classList.add('_opened')
	isOpened = true

	menu = null
	controls = null
}

export const closeMenu = () => {
	let controls = getSelector('.controls')
	let menu = controls.querySelector('.menu')

	menu.classList.remove('_opened')
	isOpened = false
	menu.removeEventListener('click', handleClickMenu)
	hidePanel()

	menu = null
	controls = null
}

export const isOpenedMenu = () => isOpened

const qualityItemHTML = quality => `<li class="panel__item">
										<button class="panel__btn btn-reset" data-quality="${quality}">
											${quality}
										</button>
									</li>`

const captionItemHTML = ({ simpleText, srclang, src }) => `<li class="panel__item">
															<button
															class="panel__btn btn-reset"
															data-label="${simpleText}"
															data-srclang="${srclang}"
															data-src="${src}">
																${simpleText}
															</button>
														</li>`

const captionItemDefaultHTML = () => `<li class="panel__item">
										<button
										class="panel__btn btn-reset"
										data-label="No captions">
											No captions
										</button>
									</li>`

const insertQualities = formats => {
	let controls = getSelector('.controls')
	let menu = controls.querySelector('.menu')

	let menuPanelListQuality = menu.querySelector(
		'.menu__panel[data-panel="quality"] > .panel__list'
	)

	for (let index = 0, { length } = formats; index < length; index += 1) {
		const { qualityLabel } = formats[index]
		menuPanelListQuality.insertAdjacentHTML('beforeEnd', qualityItemHTML(qualityLabel))
	}

	menuPanelListQuality = null
	controls = null
	menu = null
}

const insertCaptions = captions => {
	let controls = getSelector('.controls')
	let menu = controls.querySelector('.menu')

	let menuPanelListCaptions = menu.querySelector(
		'.menu__panel[data-panel="captions"] > .panel__list'
	)

	for (let index = 0, { length } = captions; index < length; index += 1) {
		const caption = captions[index]
		menuPanelListCaptions.insertAdjacentHTML('afterBegin', captionItemHTML(caption))
	}

	menuPanelListCaptions.insertAdjacentHTML('afterBegin', captionItemDefaultHTML())

	menuPanelListCaptions = null

	controls = null
	menu = null
}

const hideMenuBtn = panel => {
	let controls = getSelector('.controls')
	let menu = controls.querySelector('.menu')
	let menuBtnPanel = menu.querySelector(`.menu__btn[data-panel="${panel}"]`)

	menuBtnPanel.style.display = 'none'

	controls = null
	menu = null
	menuBtnPanel = null
}

const updateCurrents = current => {
	let controls = getSelector('.controls')
	let menu = controls.querySelector('.menu')

	const currentArray = Object.entries(current)

	currentArray.forEach(([key, value]) => {
		let menuBtnCurrent = menu.querySelector(`.menu__btn[data-panel="${key}"] > .current`)
		let panelBtnAll = menu.querySelectorAll(`.menu__panel[data-panel="${key}"] .panel__btn`)
		let panelBtnLastCurrent = menu.querySelector(
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

	controls = null
	menu = null
}

export const setMenu = params => {
	if ('handleClickSpeed' in params) config.handleClickSpeed = params.handleClickSpeed

	if ('formats' in params) {
		config.formats = params.formats
		insertQualities(config.formats)
		if ('handleClickQuality' in params) config.handleClickQuality = params.handleClickQuality
	}

	if ('captions' in params && params.captions.length) {
		config.captions = params.captions
		insertCaptions(config.captions)
		if ('handleClickCaption' in params) config.handleClickCaption = params.handleClickCaption
	} else hideMenuBtn('captions')

	updateCurrents(params.current)
}

export const resetMenu = () => {
	let controls = getSelector('.controls')
	let menu = controls.querySelector('.menu')

	let menuPanelListQuality = menu.querySelector(
		'.menu__panel[data-panel="quality"] > .panel__list'
	)

	while (menuPanelListQuality.firstChild) menuPanelListQuality.firstChild.remove()

	menuPanelListQuality = null

	let menuBtnCaptions = menu.querySelector('.menu__btn[data-panel="captions"]')

	if (menuBtnCaptions.hasAttribute('style')) {
		menuBtnCaptions.removeAttribute('style')
	} else {
		let menuPanelListCaptions = menu.querySelector(
			'.menu__panel[data-panel="captions"] > .panel__list'
		)

		while (menuPanelListCaptions.firstChild) menuPanelListCaptions.firstChild.remove()

		menuPanelListCaptions = null
	}

	menuBtnCaptions = null

	closeMenu()

	controls = null
	menu = null
}

export const toggleMenu = () => (isOpened ? closeMenu() : openMenu())
