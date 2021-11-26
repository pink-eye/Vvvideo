import { getSelector } from '../../js/global'
import { resetGrid } from '../../js/components/grid'
import { fillVideoCard, fillPlaylistCard } from '../../js/components/card'
import { showToast } from './toast'
import { initPages, disablePages } from '../../js/components/pages'

export const hideLastTab = _ => {
	let channel = getSelector('.channel')
	let tabContentActive = channel.querySelector('.tab-content._active')

	if (tabContentActive && tabContentActive.classList.contains('_active')) {
		tabContentActive.classList.remove('_active')
		resetGrid(tabContentActive)
	}

	let tabActive = channel.querySelector('.body-channel__tab._active')

	if (tabActive && tabActive.classList.contains('_active')) {
		tabActive.classList.remove('_active')
	}

	tabContentActive = null
	channel = null
	tabActive = null
}

const showRequiredTab = async tab => {
	const channelTab = tab.dataset.tab
	let channel = getSelector('.channel')

	if (tab && !tab.classList.contains('_active')) tab.classList.add('_active')

	let reqTabContent = channel.querySelector(`.tab-content[data-tab=${channelTab}]`)

	if (reqTabContent && !reqTabContent.classList.contains('_active')) reqTabContent.classList.add('_active')

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
	} catch (error) {
		showToast('error', error.message)
	}

	if (data && channelTab !== 'About') {
		const { items, continuation } = data
		let cardAll = reqTabContent.querySelectorAll('.card')
		const typeCard = channelTab === 'Videos' ? 'video' : 'playlist'

		items.length > cardAll.length
			? initPages(reqTabContent, items, cardAll, typeCard, continuation)
			: disablePages(reqTabContent)

		for (let index = 0, { length } = cardAll; index < length; index += 1) {
			const card = cardAll[index]

			items[index]
				? typeCard === 'video'
					? fillVideoCard(card, index, items)
					: fillPlaylistCard(card, index, items)
				: (card.hidden = true)
		}

		cardAll = null
	}

	reqTabContent = null
	channel = null
}

const handleClickTab = async event => {
	let tab = event.currentTarget

	if (!tab.classList.contains('_active')) {
		hideLastTab()
		await showRequiredTab(tab)
	}

	tab = null
}

export const initTabs = primary => {
	const tabAll = getSelector('.channel').querySelectorAll('.body-channel__tab')
	let primaryTab = tabAll[primary]

	showRequiredTab(primaryTab)

	if (tabAll.length > 0) {
		for (let index = 0, { length } = tabAll; index < length; index += 1) {
			const tab = tabAll[index]

			tab.addEventListener('click', handleClickTab)
		}
	}

	primaryTab = null
}

export const destroyTabs = _ => {
	let tabAll = getSelector('.channel').querySelectorAll('.body-channel__tab')

	if (tabAll.length > 0) {
		for (let index = 0, { length } = tabAll; index < length; index += 1) {
			const tab = tabAll[index]

			tab.removeEventListener('click', handleClickTab)
		}
	}

	tabAll = null
}
