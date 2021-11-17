const isLargeScreen = _ => (innerWidth - 1600) / 2 > 226

const toggleMenu = _ => {
	let burger = _io_q('.header').querySelector('.burger')
	let sidebar = _io_q('.sidebar')
	let sidebarBtn = sidebar.querySelector('.sidebar__btn')
	let sidebarBtnActive = sidebar.querySelector('.sidebar__btn._active')

	const { notAdaptContent } = storage.settings

	if (!burger.classList.contains('_active')) {
		burger.classList.add('_active')
		sidebar.classList.remove('_closed')

		if (!isLargeScreen() && !notAdaptContent) _io_q('.main__content').style.setProperty('--margin', '227px')

		const onOpenMenu = _ => {
			sidebarBtnActive ? sidebarBtnActive.focus() : sidebarBtn.focus()

			sidebarBtn = null
			sidebarBtnActive = null
		}

		setTimeout(onOpenMenu, getDurationTimeout())
	} else {
		burger.classList.remove('_active')
		sidebar.classList.add('_closed')

		if (!isLargeScreen() && !notAdaptContent) _io_q('.main__content').style.setProperty('--margin', '0')
	}

	burger = null
	sidebar = null
}
