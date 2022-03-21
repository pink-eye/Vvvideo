import { scrollToElem, getCoordY } from 'Global/utils'
import { filterSearchResults } from 'Layouts/win-search-results/helper'
import { resetGrid, resetGridAuthorCard } from 'Components/grid'
import showToast from 'Components/toast'
import { fillAuthorCard } from 'Components/card/card-author'
import { fillVideoCard } from 'Components/card/card-video'
import { fillPlaylistCard } from 'Components/card/card-playlist'
import { fillChannelCard } from 'Components/card/card-rich'
import { gridBtnsHTML } from './helper'

const Pages = () => {
	let win = null
	let typeCard = null
	let grid = null
	let cardAll = null
	let btns = null
	let btnsCount = null
	let btnsNext = null
	let btnsPrev = null

	const numCards = 20
	let increment = 0
	let page = 1
	let itemArray = []
	let hasContinuation = null

	const displayCount = () => {
		btnsCount.textContent = page
	}

	const recycleGrid = () => {
		typeCard !== 'author' ? resetGrid(win) : resetGridAuthorCard()

		for (let index = 0, { length } = cardAll; index < length; index += 1) {
			let card = cardAll[index]
			const nextItemIndex = index + increment
			const nextItem = itemArray[nextItemIndex]

			if (nextItem) {
				card.hidden &&= false

				let type = typeCard

				if (typeCard === 'rich') {
					type = nextItem.type
					card.dataset.win = type
					card.classList.add(`_${type}`)
				}

				switch (type) {
					case 'video':
						fillVideoCard(card, nextItemIndex, itemArray)
						break

					case 'playlist':
						fillPlaylistCard(card, nextItemIndex, itemArray)
						break

					case 'channel':
						fillChannelCard(card, nextItemIndex, itemArray)
						break

					case 'author':
						const { avatar, name, channelId } = nextItem

						let authorParams = {
							parent: card,
							avatarSrc: avatar,
							name: name,
							id: channelId,
						}

						fillAuthorCard(authorParams)

						authorParams = null
						break
				}
			} else card.hidden = true

			card = null
		}
	}

	const fetchDataMore = async () => {
		let data = null

		try {
			switch (typeCard) {
				case 'video':
					data = await API.scrapeVideosMore(hasContinuation)
					break

				case 'playlist':
					data = await API.scrapePlaylistsMore(hasContinuation)
					break

				case 'rich':
					data = await API.scrapeSearchResultsMore(hasContinuation)
					data.items = filterSearchResults(data.items)
					break
			}

			return data
		} catch (error) {
			throw Error(error)
		}
	}

	const expandItemArray = () => {
		fetchDataMore()
			.then(data => {
				const { items, continuation } = data
				itemArray.push(...items)
				hasContinuation = continuation
			})
			.catch(({ message }) => showToast('error', message))
	}

	const openNext = () => {
		if (increment < itemArray.length - 1) {
			increment += numCards
			page += 1

			recycleGrid()
			displayCount()

			let firstCard = cardAll[0]
			firstCard.focus()
			const firstCardCoordinateY = getCoordY(firstCard)
			scrollToElem(firstCardCoordinateY)

			btnsPrev.disabled &&= false

			if (hasContinuation) expandItemArray()
		}

		if (page * numCards > itemArray.length - 1) {
			btnsNext.disabled = true
		}
	}

	const openPrevious = () => {
		if (page === 2) {
			btnsPrev.disabled = true
		}

		if (page > 1) {
			increment -= numCards
			page -= 1

			recycleGrid()
			displayCount()

			let firstCard = cardAll[0]
			firstCard.focus()
			const firstCardCoordinateY = getCoordY(firstCard)
			scrollToElem(firstCardCoordinateY)

			btnsNext.disabled &&= false
		}
	}

	const initBtns = () => {
		btnsNext.addEventListener('click', openNext)
		btnsPrev.addEventListener('click', openPrevious)

		btnsNext.disabled &&= false
		btnsPrev.disabled ||= true
	}

	const init = config => {
		win ||= config.element
		typeCard ||= config.type
		itemArray = [...config.data]
		hasContinuation = config.continuation

		const cardClassName = typeCard === 'author' ? typeCard : 'card'

		grid ||= win.querySelector('.grid')
		grid.insertAdjacentHTML('beforeEnd', gridBtnsHTML())
		cardAll = grid.querySelectorAll(`.${cardClassName}`)
		btns = grid.querySelector('.btns')
		btnsCount = btns.querySelector('.btns__count')
		btnsNext = btns.querySelector('.btns__next')
		btnsPrev = btns.querySelector('.btns__prev')

		initBtns()
		displayCount()

		if (hasContinuation) expandItemArray()
	}

	const reset = () => {
		if (!btns) return

		btns.remove()

		btns = null
		btnsCount = null
		btnsNext = null
		btnsPrev = null

		increment = 0
		page = 1
		itemArray.length = 0
	}

	return {
		init,
		reset,
	}
}

export default Pages
