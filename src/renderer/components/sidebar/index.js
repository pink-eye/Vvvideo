import { getSelector } from 'Global/utils'

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

export { activateSidebarBtn, deactivateLastSidebarBtn }
