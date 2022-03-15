import cs from 'Global/cacheSelectors'
import { resetGrid } from 'Components/grid'
import { fillVideoCard } from 'Components/card/card-video'
import { fillPlaylistCard } from 'Components/card/card-playlist'
import showToast from 'Components/toast'
import { initPages, disablePages } from 'Components/grid-btns'

export const hideLastTab = () => {
	let channel = cs.get('.channel')
	let tabsPanelActive = channel.querySelector('.tabs__panel._active')

	if (tabsPanelActive && tabsPanelActive.classList.contains('_active')) {
		tabsPanelActive.classList.remove('_active')
		resetGrid(tabsPanelActive)
	}

	let tabActive = channel.querySelector('.tabs__btn._active')

	if (tabActive && tabActive.classList.contains('_active')) {
		tabActive.classList.remove('_active')
	}

	tabsPanelActive = null
	channel = null
	tabActive = null
}

const showRequiredTab = async tab => {
	const channelTab = tab.dataset.tab
	let channel = cs.get('.channel')

	if (tab && !tab.classList.contains('_active')) tab.classList.add('_active')

	let reqTabContent = channel.querySelector(`.tabs__panel[data-tab=${channelTab}]`)

	if (reqTabContent && !reqTabContent.classList.contains('_active'))
		reqTabContent.classList.add('_active')

	let data = null
	const channelId = channel.dataset.id

	try {
		switch (channelTab) {
			case 'Videos':
				data = await API.scrapeChannelVideos(channelId)
				break

			case 'Playlists':
				data = await API.scrapeChannelPlaylists(channelId)
				break
		}
	} catch ({ message }) {
		showToast('error', message)
	}

	if (data && channelTab !== 'About' && reqTabContent.classList.contains('_active')) {
		const { items, continuation } = data
		let cardAll = reqTabContent.querySelectorAll('.card')
		const typeCard = channelTab === 'Videos' ? 'video' : 'playlist'

		items.length > cardAll.length
			? initPages(reqTabContent, items, cardAll, typeCard, continuation)
			: disablePages(reqTabContent)

		for (let index = 0, { length } = cardAll; index < length; index += 1) {
			let card = cardAll[index]

			items[index]
				? typeCard === 'video'
					? fillVideoCard(card, index, items)
					: fillPlaylistCard(card, index, items)
				: (card.hidden = true)

			card = null
		}

		cardAll = null
	}

	reqTabContent = null
	channel = null
}

const handleClickTab = async ({ currentTarget }) => {
	let tab = currentTarget

	if (!tab.classList.contains('_active')) {
		hideLastTab()
		await showRequiredTab(tab)
	}

	tab = null
}

export const initTabs = primary => {
	let tabAll = cs.get('.channel').querySelectorAll('.tabs__btn')

	if (tabAll.length === 0) return

	let primaryTab = tabAll[primary]

	showRequiredTab(primaryTab)

	for (let index = 0, { length } = tabAll; index < length; index += 1) {
		let tab = tabAll[index]

		tab.addEventListener('click', handleClickTab)

		tab = null
	}

	primaryTab = null
	tabAll = null
}

export const destroyTabs = () => {
	let tabAll = cs.get('.channel').querySelectorAll('.tabs__btn')

	if (tabAll.length === 0) return

	for (let index = 0, { length } = tabAll; index < length; index += 1) {
		let tab = tabAll[index]

		tab.removeEventListener('click', handleClickTab)

		tab = null
	}

	tabAll = null
}
