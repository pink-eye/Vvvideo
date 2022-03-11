import { getDurationTimeout, getSelector } from 'Global/utils'
import AppStorage from 'Global/AppStorage'

const appStorage = new AppStorage()

const activateSidebarBtn = btn => {
	let givenBtn = btn
	givenBtn.classList.add('_active')
	givenBtn = null
}

const deactivateLastSidebarBtn = () => {
	let lastActiveSidebarBtn = getSelector('.sidebar').querySelector('.sidebar__btn._active')

	if (!lastActiveSidebarBtn) return

	lastActiveSidebarBtn.classList.remove('_active')

	lastActiveSidebarBtn = null
}

const isLargeScreen = () => (window.innerWidth - 1600) / 2 > 226

const handleOpenMenu = () => {
	let sidebar = getSelector('.sidebar')
	let sidebarBtn = sidebar.querySelector('.sidebar__btn')
	let sidebarBtnActive = sidebar.querySelector('.sidebar__btn._active')

	sidebarBtnActive ? sidebarBtnActive.focus() : sidebarBtn.focus()

	sidebarBtn = null
	sidebarBtnActive = null
	sidebar = null
}

export const openSidebar = () => {
	let mainContent = getSelector('.main__content')
	let sidebar = getSelector('.sidebar')

	const timeout = getDurationTimeout()

	timeout > 0
		? sidebar.addEventListener('transitionend', handleOpenMenu, { once: true })
		: handleOpenMenu()

	sidebar.classList.remove('_closed')

	const { notAdaptContent } = appStorage.get().settings

	if (!isLargeScreen() && !notAdaptContent) mainContent.style.setProperty('--margin', '86px')

	sidebar = null
	mainContent = null
}

export const closeSidebar = () => {
	let mainContent = getSelector('.main__content')
	let sidebar = getSelector('.sidebar')

	sidebar.classList.add('_closed')

	const { notAdaptContent } = appStorage.get().settings

	if (!isLargeScreen() && !notAdaptContent) mainContent.style.setProperty('--margin', '0')

	sidebar = null
	mainContent = null
}

export { activateSidebarBtn, deactivateLastSidebarBtn }
