import { getSelector } from 'Global/utils'
import { openSidebar, closeSidebar } from 'Components/sidebar'

export const toggleMenu = () => {
	let burger = getSelector('.header').querySelector('.burger')

	if (!burger.classList.contains('_active')) {
		burger.classList.add('_active')

		openSidebar()
	} else {
		burger.classList.remove('_active')

		closeSidebar()
	}

	burger = null
}
