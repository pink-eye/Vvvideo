import cs from 'Global/cacheSelectors'
import sidebar from 'Components/sidebar'

const toggleMenu = () => {
	let burger = cs.get('.header').querySelector('.burger')

	if (!burger.classList.contains('_active')) {
		burger.classList.add('_active')

		sidebar.open()
	} else {
		burger.classList.remove('_active')

		sidebar.close()
	}

	burger = null
}

export default toggleMenu
