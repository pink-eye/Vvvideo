const activateSidebarBtn = btn => {
	btn.classList.add('_active');
}

const deactivateLastSidebarBtn = _ => {
	let lastActiveSidebarBtn = sidebar.querySelector('.sidebar__btn._active');

	if (lastActiveSidebarBtn)
		lastActiveSidebarBtn.classList.remove('_active');

	lastActiveSidebarBtn = null;
}
