import { getDurationTimeout, getSelector } from 'Global/utils'
import { AppStorage } from 'Global/app-storage'

const isLargeScreen = () => (window.innerWidth - 1600) / 2 > 226

export const toggleMenu = () => {
	let burger = getSelector('.header').querySelector('.burger')
	let sidebar = getSelector('.sidebar')
	let sidebarBtn = sidebar.querySelector('.sidebar__btn')
	let sidebarBtnActive = sidebar.querySelector('.sidebar__btn._active')
	let mainContent = getSelector('.main__content')

	const appStorage = new AppStorage()
	const { notAdaptContent } = appStorage.get().settings

	if (!burger.classList.contains('_active')) {
		burger.classList.add('_active')
		sidebar.classList.remove('_closed')

		const timeout = getDurationTimeout()

		const onOpenMenu = () => {
			sidebarBtnActive ? sidebarBtnActive.focus() : sidebarBtn.focus()

			sidebarBtn = null
			sidebarBtnActive = null
			mainContent = null
		}

		if (!isLargeScreen() && !notAdaptContent) mainContent.style.setProperty('--margin', '227px')

		timeout > 0
			? mainContent.addEventListener('transitionend', onOpenMenu, { once: true })
			: onOpenMenu()
	} else {
		burger.classList.remove('_active')
		sidebar.classList.add('_closed')

		if (!isLargeScreen() && !notAdaptContent) mainContent.style.setProperty('--margin', '0')

		mainContent = null
	}

	burger = null
	sidebar = null
}
