import { reloadApp, hasFocus } from 'Global/utils'
import AppStorage from 'Global/AppStorage'
import manageWin from 'Global/WinManager'
import checkForUpdate from 'Global/checkForUpdate'
import handleKeyDown from 'Global/shortcuts'
import openWinLatest from 'Layouts/win-latest'
import { applySettingsOnStart } from 'Layouts/win-settings'
import suggestions from 'Components/suggestions'
import overlay from 'Components/overlay'
import toggleMenu from 'Components/burger'
import showToast from 'Components/toast'
import initUpdateComponent from 'Components/update'
import removePreloader from 'Components/preloader'
import HideOnScroll from 'Global/HideOnScroll'
import cs from 'Global/CacheSelectors'

const handleClickWindow = ({ target }) => {
	if (!target.closest('.search')) {
		suggestions.hide()
		overlay.hide()
	}
}

document.addEventListener('DOMContentLoaded', async () => {
	const appStorage = new AppStorage()
	const storage = appStorage.get()

	if (!storage) {
		showToast('error', 'OH SHIT! I have no storage O_O')

		return
	}

	const currentAppVersion = await API.getAppVersion()
	const savedAppVersion = storage?.appVersion

	if (!savedAppVersion || currentAppVersion !== savedAppVersion) {
		const storageFromFile = await appStorage.getFromFile()

		if (storageFromFile?.appVersion === currentAppVersion) {
			appStorage.clearLocalStorage()
			storage.appVersion = currentAppVersion
			storage.settings = storageFromFile.settings
			appStorage.update(storage)

			showToast(
				'info',
				'The list of options has been updated so it has been reset. Check it out'
			)
		}
	}

	applySettingsOnStart()
	openWinLatest()
	suggestions.init()
	removePreloader()

	// MAIN SELECTORS
	let header = cs.get('.header')
	let sidebar = cs.get('.sidebar')
	let mainContent = cs.get('.main__content')

	// HIDE ON SCROLL

	new HideOnScroll({ selector: header })
	new HideOnScroll({ selector: sidebar, maxWidth: 767, conditionOnShow: () => hasFocus(sidebar) })

	// MANAGE WINDOWS

	mainContent.addEventListener('click', manageWin)
	mainContent = null

	sidebar.addEventListener('click', manageWin)

	window.addEventListener('click', handleClickWindow)

	// INIT SHORTCUTS
	document.addEventListener('keydown', handleKeyDown)

	// INIT BURGER
	let burger = header.querySelector('.burger')
	burger.addEventListener('click', toggleMenu)
	burger = null

	// INIT BTN TO RELOAD APP
	let headerReload = header.querySelector('.header__btn')
	headerReload.addEventListener('click', reloadApp)
	headerReload = null

	header = null
	sidebar = null

	if (!storage.settings.dontCheckForUpdate) {
		checkForUpdate()
			.then(([latestVersion, currentVersion]) => {
				if (latestVersion === currentVersion) return

				initUpdateComponent()
			})
			.catch(console.error)
	}
})
