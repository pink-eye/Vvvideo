import { getSelector } from 'Global/utils'
import { AppStorage } from 'Global/app-storage'
import { initPages, disablePages } from 'Components/grid-btns'
import { fillAuthorCard } from 'Components/card/card-author'
import { showToast } from 'Components/toast'
import { startIndicator, resetIndicator } from 'Components/indicator'

const updateSubscriptionData = async storage => {
	let { subscriptions } = storage

	if (subscriptions.length === 0) return undefined

	let promises = []
	let channelInfoArray = null
	let btnSubscriptions = document.querySelector('button[data-win="subscriptions"]')

	for (let index = 0, { length } = subscriptions; index < length; index += 1) {
		const subscription = subscriptions[index]

		if (!btnSubscriptions.classList.contains('_active')) return

		promises.push(API.scrapeChannelInfo(subscription.channelId))
	}

	try {
		startIndicator()
		channelInfoArray = [].concat.apply([], await Promise.all(promises))

		if (channelInfoArray && channelInfoArray.length > 0) {
			for (let index = 0, { length } = subscriptions; index < length; index += 1) {
				const channelInfo = channelInfoArray[index]
				const { authorThumbnails, author } = channelInfo

				if (!btnSubscriptions.classList.contains('_active')) return

				subscriptions[index].avatar = authorThumbnails.at(-1).url
				subscriptions[index].name = author
			}
		}
	} catch ({ message }) {
		showToast('error', message)
	} finally {
		resetIndicator()
	}

	btnSubscriptions = null

	return subscriptions
}

export const openWinSubs = async _ => {
	const appStorage = new AppStorage()
	let storage = appStorage.get()
	let subscriptions = getSelector('.subscriptions')
	let authorCardAll = subscriptions.querySelectorAll('.author')

	storage.subscriptions.length > authorCardAll.length
		? initPages(subscriptions, storage.subscriptions, authorCardAll, 'author')
		: disablePages(subscriptions)

	for (let index = 0, { length } = authorCardAll; index < length; index += 1) {
		const authorCard = authorCardAll[index]
		const sub = storage.subscriptions[index]

		if (sub) {
			const { name, channelId, avatar = '' } = sub

			let authorParams = {
				parent: authorCard,
				id: channelId,
				avatarSrc: avatar,
				name,
			}

			fillAuthorCard(authorParams)

			authorParams = null
		} else authorCard.hidden = true
	}

	const updatedSubscriptions = await updateSubscriptionData(storage)

	if (updatedSubscriptions) {
		storage.subscriptions = updatedSubscriptions

		appStorage.update(storage)
	}

	subscriptions = null
	authorCardAll = null
}
