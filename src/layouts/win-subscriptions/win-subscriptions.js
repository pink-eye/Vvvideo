import { initPages, disablePages } from '../../js/components/pages'
import { fillAuthorCard } from '../card-author/author-card'
import { showToast } from './toast'
import { getSelector, isEmpty, getDurationTimeout } from '../../js/global'
import { AppStorage } from '../../js/components/app-storage'
import { resetIndicator } from './indicator'

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
		} catch (error) {
			showToast('error', error.message)
		} finally {
			resetIndicator()
		}

		if (channelInfoArray && channelInfoArray.length > 0) {
			for (let index = 0, { length } = subs; index < length; index += 1) {
				const sub = subs[index]
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
