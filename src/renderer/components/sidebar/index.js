import cs from 'Global/CacheSelectors'
import { getDurationTimeout } from 'Global/utils'
import AppStorage from 'Global/AppStorage'

const appStorage = new AppStorage()

const Sidebar = () => {
	let mainContent = cs.get('.main__content')
	let sidebar = cs.get('.sidebar')

	const activateBtn = btn => {
		let givenBtn = btn
		givenBtn.classList.add('_active')
		givenBtn = null
	}

	const deactivateLastBtn = () => {
		let lastActiveSidebarBtn = sidebar.querySelector('.sidebar__btn._active')

		if (!lastActiveSidebarBtn) return

		lastActiveSidebarBtn.classList.remove('_active')

		lastActiveSidebarBtn = null
	}

	const handleOpenMenu = () => {
		let sidebarBtn = sidebar.querySelector('.sidebar__btn')
		let sidebarBtnActive = sidebar.querySelector('.sidebar__btn._active')

		sidebarBtnActive ? sidebarBtnActive.focus() : sidebarBtn.focus()

		sidebarBtn = null
		sidebarBtnActive = null
	}

	const open = () => {
		const timeout = getDurationTimeout()

		timeout > 0
			? sidebar.addEventListener('transitionend', handleOpenMenu, { once: true })
			: handleOpenMenu()

		sidebar.classList.remove('_closed')

		const { notAdaptContent } = appStorage.get().settings

		if (!notAdaptContent) mainContent.style.setProperty('--margin', '86px')
	}

	const close = () => {
		let mainContent = cs.get('.main__content')

		sidebar.classList.add('_closed')

		const { notAdaptContent } = appStorage.get().settings

		if (!notAdaptContent) mainContent.style.setProperty('--margin', '0')
	}

	return { activateBtn, deactivateLastBtn, open, close }
}

const sidebar = Sidebar()

export default sidebar
