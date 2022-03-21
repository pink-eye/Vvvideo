import cs from 'Global/CacheSelectors'
import AppStorage from 'Global/AppStorage'
import Pages from 'Components/grid-btns'
import { fillAuthorCard } from 'Components/card/card-author'
import { resetGridAuthorCard } from 'Components/grid'
import showToast from 'Components/toast'
import indicator from 'Components/indicator'

const WinSubscriptions = () => {
	const subscriptions = cs.get('.subscriptions')
	const btnSubscriptions = document.querySelector('button[data-win="subscriptions"]')
	const appStorage = new AppStorage()
	const pages = Pages()
	let storage = null

	const updateData = (data, callback) => {
		const subscriptionsData = data

		if (!subscriptionsData || !subscriptionsData.length) return

		const promises = []

		for (let index = 0, { length } = subscriptionsData; index < length; index += 1) {
			const subscription = subscriptionsData[index]

			if (!btnSubscriptions.classList.contains('_active')) return

			promises.push(API.scrapeChannelInfo(subscription.channelId))
		}

		let channelInfoArray = null

		indicator.show()
		Promise.all(promises)
			.then(newData => {
				let hasUpdate = false

				if (newData?.length) {
					channelInfoArray = newData.flat()

					for (
						let index = 0, { length } = subscriptionsData;
						index < length;
						index += 1
					) {
						const channelInfo = channelInfoArray[index]
						const { authorThumbnails, author } = channelInfo
						const avatarURL = authorThumbnails.at(-1).url
						const subscription = subscriptionsData[index]
						const isEqual =
							subscription.avatar === avatarURL && subscription.name === author

						if (!isEqual) {
							hasUpdate ||= true
							subscriptionsData[index].avatar = authorThumbnails.at(-1).url
							subscriptionsData[index].name = author
						}
					}

					if (hasUpdate) callback(subscriptionsData)
				}
			})
			.catch(({ message }) => showToast('error', message))
			.finally(() => indicator.hide())

		return subscriptionsData
	}

	const getData = () => {
		storage = appStorage.get()

		return storage.subscriptions
	}

	const fill = data => {
		const authorCardAll = subscriptions.querySelectorAll('.author')

		if (data.length > authorCardAll.length) {
			pages.init({ element: subscriptions, data, type: 'author' })
		}

		for (let index = 0, { length } = authorCardAll; index < length; index += 1) {
			const authorCard = authorCardAll[index]
			const subscription = data[index]

			if (subscription) {
				const { name, channelId, avatar = '' } = subscription

				const authorParams = {
					parent: authorCard,
					id: channelId,
					avatarSrc: avatar,
					name,
				}

				fillAuthorCard(authorParams)
			} else authorCard.hidden = true
		}
	}

	const init = () => {
		const data = getData()

		if (!data) return

		fill(data)

		updateData(data, updatedData => {
			if (!updatedData) return

			storage.subscriptions = updatedData
			appStorage.update(storage)
		})
	}

	const reset = () => {
		resetGridAuthorCard(subscriptions)
		pages.reset()
	}

	return {
		init,
		reset,
	}
}

const winSubscriptions = WinSubscriptions()

export default winSubscriptions
