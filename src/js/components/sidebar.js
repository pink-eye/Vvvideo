const activateSidebarBtn = btn => {
	let givenBtn = btn
	givenBtn.classList.add('_active')
	givenBtn = null
}

const deactivateLastSidebarBtn = _ => {
	let lastActiveSidebarBtn = _io_q('.sidebar').querySelector('.sidebar__btn._active')

	lastActiveSidebarBtn && lastActiveSidebarBtn.classList.remove('_active')

	lastActiveSidebarBtn = null
}

export { activateSidebarBtn, deactivateLastSidebarBtn }
