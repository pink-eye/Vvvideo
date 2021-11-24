import { getSelector } from '../global'

const activateSidebarBtn = btn => {
	let givenBtn = btn
	givenBtn.classList.add('_active')
	givenBtn = null
}

const deactivateLastSidebarBtn = _ => {
	let lastActiveSidebarBtn = getSelector('.sidebar').querySelector('.sidebar__btn._active')

	lastActiveSidebarBtn && lastActiveSidebarBtn.classList.remove('_active')

	lastActiveSidebarBtn = null
}

export { activateSidebarBtn, deactivateLastSidebarBtn }
