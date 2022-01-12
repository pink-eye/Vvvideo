import { getDurationTimeout, getSelector, invokeFunctionByTimeout } from 'Global/utils'
import { AppStorage } from 'Global/app-storage'

const isLargeScreen = () => (window.innerWidth - 1600) / 2 > 226

export const toggleMenu = () => {
	let burger = getSelector('.header').querySelector('.burger')
	let sidebar = getSelector('.sidebar')
	let sidebarBtn = sidebar.querySelector('.sidebar__btn')
	let sidebarBtnActive = sidebar.querySelector('.sidebar__btn._active')

	const appStorage = new AppStorage()
	const { notAdaptContent } = appStorage.get().settings

	if (!burger.classList.contains('_active')) {
		burger.classList.add('_active')
		sidebar.classList.remove('_closed')

		if (!isLargeScreen() && !notAdaptContent)
			getSelector('.main__content').style.setProperty('--margin', '227px')

		const onOpenMenu = () => {
			sidebarBtnActive ? sidebarBtnActive.focus() : sidebarBtn.focus()

			sidebarBtn = null
			sidebarBtnActive = null
		}

		const timeout = getDurationTimeout()
		invokeFunctionByTimeout(onOpenMenu, timeout)
	} else {
		burger.classList.remove('_active')
		sidebar.classList.add('_closed')

		if (!isLargeScreen() && !notAdaptContent)
			getSelector('.main__content').style.setProperty('--margin', '0')
	}

	burger = null
	sidebar = null
}
