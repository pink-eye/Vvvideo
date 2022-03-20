import cs from 'Global/CacheSelectors'
import { queryClosestByClass } from 'Global/utils'
import { resetGrid } from 'Components/grid'
import { fillVideoCard } from 'Components/card/card-video'
import { fillPlaylistCard } from 'Components/card/card-playlist'
import showToast from 'Components/toast'
import { initPages, disablePages } from 'Components/grid-btns'

const Tabs = () => {
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
		} catch ({ message }) {
			showToast('error', message)
		}
	}

	const fillTabPanel = (tabPanel, data) => {
		const { items, continuation } = data
		const tab = tabPanel.dataset.tab
		const typeCard = tab === 'Videos' ? 'video' : 'playlist'
		let cardAll = tabPanel.querySelectorAll('.card')

		items.length > cardAll.length
			? initPages(tabPanel, items, cardAll, typeCard, continuation)
			: disablePages(tabPanel)

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

	const show = async tab => {
		const channelTab = tab.dataset.tab

		if (tab && !tab.classList.contains('_active')) tab.classList.add('_active')

		let requiredTabPanel = tabs.querySelector(`.tabs__panel[data-tab=${channelTab}]`)

		if (requiredTabPanel && !requiredTabPanel.classList.contains('_active')) {
			requiredTabPanel.classList.add('_active')
		}

		const channelId = channel.dataset.id
		const data = await fetchData(channelTab, channelId)

		if (data && channelTab !== 'About' && requiredTabPanel.classList.contains('_active')) {
			fillTabPanel(requiredTabPanel, data)
		}

		requiredTabPanel = null
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
