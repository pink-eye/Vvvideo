import cs from 'Global/CacheSelectors'
import AppStorage from 'Global/AppStorage'
import showToast from 'Components/toast'
import { fillVideoCard } from 'Components/card/card-video'
import Pages from 'Components/grid-btns'
import { calculatePublishedDate } from 'Layouts/win-latest/helper'
import { resetGrid } from 'Components/grid'
import indicator from 'Components/indicator'

const WinLatest = () => {
	const latest = cs.get('.latest')
	const btnLatest = document.querySelector('button[data-win="latest"]')
	const pages = Pages()
	let latestArray = null

	const fetchData = id => {
		return new Promise((resolve, reject) => {
			API.scrapeChannelVideos(id)
				.then(data => {
					let { items } = data

					for (let index = 0, { length } = items; index < length; index += 1) {
						const video = items[index]

						video.publishedDate = video.liveNow
							? new Date().getTime()
							: calculatePublishedDate(video.publishedText)
					}

					resolve(items)
				})
				.catch(reject)
		})
	}

	const fill = () => {
		const videoAll = latest.querySelectorAll('.card')

		if (latestArray.length > videoAll.length) {
			pages.init({ element: latest, type: 'video', data: latestArray })
		}

		for (let index = 0, { length } = videoAll; index < length; index += 1) {
			const video = videoAll[index]

			if (latestArray[index]) {
				fillVideoCard(video, index, latestArray)
			} else {
				video.hidden = true
			}
		}
	}

	const init = () => {
		const appStorage = new AppStorage()
		const { subscriptions } = appStorage.get()
		let promises = []

		if (subscriptions?.length) {
			for (let index = 0, { length } = subscriptions; index < length; index += 1) {
				const subscription = subscriptions[index]
				promises.push(fetchData(subscription.channelId))
			}
		} else {
			showToast('info', `Oops... You don't have subscriptions`)
			return
		}

		indicator.show()

		Promise.all(promises)
			.then(data => {
				if (!btnLatest.classList.contains('_active')) return

				latestArray = data.flat()
				latestArray.sort((a, b) => b.publishedDate - a.publishedDate)
				showToast('good', 'Latest uploads is got successfully')

				fill()
			})
			.catch(({ message }) => {
				showToast('error', message)

				fill()
			})
			.finally(() => indicator.hide())
	}

	const reset = () => {
		resetGrid(latest)
		pages.reset()
	}

	return {
		init,
		reset,
	}
}

const winLatest = WinLatest()

export default winLatest
