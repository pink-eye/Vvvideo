import cs from 'Global/cacheSelectors'
import { openSidebar, closeSidebar } from 'Components/sidebar'

const toggleMenu = () => {
	let burger = cs.get('.header').querySelector('.burger')

	if (!burger.classList.contains('_active')) {
		burger.classList.add('_active')

		openSidebar()
	} else {
		burger.classList.remove('_active')

		closeSidebar()
	}

	burger = null
}

export default toggleMenu
