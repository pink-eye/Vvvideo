import { getSelector } from 'Global/utils'
import { AppStorage } from 'Global/app-storage'
import { initPages, disablePages } from 'Components/grid-btns'
import { fillAuthorCard } from 'Components/card/card-author'
import { showToast } from 'Components/toast'
import { resetIndicator } from 'Components/indicator'

const appStorage = new AppStorage()
let storage = appStorage.getStorage()

let isUpdated = false

export const openWinSubs = async _ => {
	const promises = []
	let channelInfoArray = null
	let subscriptions = getSelector('.subscriptions')
	let authorCardAll = subscriptions.querySelectorAll('.author')
	let btnSubscriptions = document.querySelector('button[data-win="subscriptions"]')

	let { subscriptions: subs } = storage

	subs.length > authorCardAll.length
		? initPages(subscriptions, subs, authorCardAll, 'author')
		: disablePages(subscriptions)

	for (let index = 0, { length } = authorCardAll; index < length; index += 1) {
		const authorCard = authorCardAll[index]
		const sub = subs[index]

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

	if (!isUpdated) {
		for (let index = 0, { length } = subs; index < length; index += 1) {
			const subscription = subs[index]

			if (!btnSubscriptions.classList.contains('_active')) return

			promises.push(API.scrapeChannelInfo(subscription.channelId))
		}

		try {
			channelInfoArray = [].concat.apply([], await Promise.all(promises))
		} catch ({ message }) {
			showToast('error', message)
		} finally {
			resetIndicator()
		}

		if (channelInfoArray && channelInfoArray.length > 0) {
			for (let index = 0, { length } = subs; index < length; index += 1) {
				const sub = storage.subscriptions[index]
				const channelInfo = channelInfoArray[index]

				if (!btnSubscriptions.classList.contains('_active')) return

				sub.avatar = channelInfo.authorThumbnails.at(-1).url
				sub.name = channelInfo.author
			}

			appStorage.updateStorage(storage)

			isUpdated = true
		}

		subscriptions = null
		authorCardAll = null
		btnSubscriptions = null
	}
}
