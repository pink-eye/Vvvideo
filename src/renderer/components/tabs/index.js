import cs from 'Global/CacheSelectors'
import { queryClosestByClass } from 'Global/utils'
import { resetGrid } from 'Components/grid'
import { fillVideoCard } from 'Components/card/card-video'
import { fillPlaylistCard } from 'Components/card/card-playlist'
import showToast from 'Components/toast'
import Pages from 'Components/grid-btns'

const Tabs = () => {
	const pages = Pages()
	const channel = cs.get('.channel')
	const tabs = channel.querySelector('.tabs')
	const tabsList = tabs.querySelector('.tabs__list')
	const tabAll = tabs.querySelectorAll('.tabs__btn')
	const initialTabIndex = 0

	const hide = () => {
		let tabsPanelActive = tabs.querySelector('.tabs__panel._active')

		if (tabsPanelActive?.classList.contains('_active')) {
			tabsPanelActive.classList.remove('_active')
			resetGrid(tabsPanelActive)
			pages.reset()
		}

		let tabActive = tabs.querySelector('.tabs__btn._active')

		if (tabActive?.classList.contains('_active')) {
			tabActive.classList.remove('_active')
		}

		tabsPanelActive = null
		tabActive = null
	}

	const fetchData = async (tab, channelId) => {
		try {
			switch (tab) {
				case 'Videos':
					return await API.scrapeChannelVideos(channelId)

				case 'Playlists':
					return await API.scrapeChannelPlaylists(channelId)
			}
		} catch (error) {
			throw Error(error)
		}
	}

	const fillTabPanel = (tabPanel, data) => {
		const { items, continuation } = data
		const tab = tabPanel.dataset.tab
		const typeCard = tab === 'Videos' ? 'video' : 'playlist'
		let cardAll = tabPanel.querySelectorAll('.card')

		if (items.length > cardAll.length) {
			pages.init({ element: tabPanel, data: items, type: typeCard, continuation })
		}

		for (let index = 0, { length } = cardAll; index < length; index += 1) {
			let card = cardAll[index]

			if (items[index]) {
				switch (typeCard) {
					case 'video': {
						fillVideoCard(card, index, items)
						break
					}
					case 'playlist': {
						fillPlaylistCard(card, index, items)
						break
					}
				}
			} else {
				card.hidden = true
			}

			card = null
		}

		cardAll = null
	}

	const show = tab => {
		const channelTab = tab.dataset.tab

		if (tab && !tab.classList.contains('_active')) tab.classList.add('_active')

		let requiredTabPanel = tabs.querySelector(`.tabs__panel[data-tab=${channelTab}]`)

		if (requiredTabPanel && !requiredTabPanel.classList.contains('_active')) {
			requiredTabPanel.classList.add('_active')
		}

		const channelId = channel.dataset.id

		fetchData(channelTab, channelId)
			.then(data => {
				if (channelTab !== 'About' && requiredTabPanel.classList.contains('_active')) {
					fillTabPanel(requiredTabPanel, data)
				}

				requiredTabPanel = null
			})
			.catch(({ message }) => showToast('error', message))
	}

	const handleClickList = event => {
		let tabsBtn = queryClosestByClass(event.target, 'tabs__btn')

		if (!tabsBtn) return

		if (!tabsBtn.classList.contains('_active')) {
			hide()
			show(tabsBtn)
		}

		tabsBtn = null
	}

	const init = () => {
		const initialTab = tabAll[initialTabIndex]
		show(initialTab)

		tabsList.addEventListener('click', handleClickList)
	}

	const reset = () => {
		hide()
		tabsList.removeEventListener('click', handleClickList)
	}

	return {
		init,
		reset,
	}
}

const tabs = Tabs()

export default tabs
