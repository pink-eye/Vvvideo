let increment = null
let page = null
let itemArray = []
let hasContinuation = null

const disablePages = parent => {
	resetPages(parent)

	let btns = parent.querySelector('.btns')

	btns && (btns.hidden ||= true)

	btns = null
}

const enablePages = parent => {
	let btns = parent.querySelector('.btns')

	btns && (btns.hidden &&= false)

	btns = null
}

const createPages = _ => `<div class="grid__btns btns" hidden>
							<button disabled class="btns__prev btn-secondary onclick-effect btn-reset">
								<svg width="28px" height="28px">
									<use xlink:href='img/svg/nav.svg#arrow'></use>
								</svg>
								previous page
							</button>
							<span class="grid__count">1</span>
							<button class="btns__next btn-secondary onclick-effect btn-reset">
								<svg width="28px" height="28px">
									<use xlink:href='img/svg/nav.svg#arrow'></use>
								</svg>
								next page
							</button>
						</div>`

const resetPages = parent => {
	let grid = parent.querySelector('.grid')
	let btns = grid.querySelector('.btns')

	if (btns) {
		btns.remove()
		grid.insertAdjacentHTML('beforeEnd', createPages())
	}

	itemArray.length = 0

	btns = null
	grid = null
}

const nextPage = (parent, cardAll, typeCard, btnNextPage, btnPrevPage) => {
	typeCard !== 'author' ? resetGrid(parent) : resetGridAuthorCard()

	if (increment < itemArray.length - 1) {
		let firstCard = cardAll[0]
		firstCard.focus()

		increment += 20
		page += 1

		getDataMore(typeCard)
		recycleDOM(cardAll, typeCard)
		scrollToElem(getCoordY(firstCard))
		updateCount(parent)

		let givenBtnPrevPage = btnPrevPage

		givenBtnPrevPage.disabled &&= false

		firstCard = null
		givenBtnPrevPage = null
	}

	if (page * 20 > itemArray.length - 1) {
		let givenBtnNextPage = btnNextPage
		givenBtnNextPage.disabled = true
		givenBtnNextPage = null
	}
}

const prevPage = (parent, cardAll, typeCard, btnNextPage, btnPrevPage) => {
	typeCard !== 'author' ? resetGrid(parent) : resetGridAuthorCard()

	if (page === 2) {
		let givenBtnPrevPage = btnPrevPage
		givenBtnPrevPage.disabled = true
		givenBtnPrevPage = null
	}

	if (page > 1) {
		let firstCard = cardAll[0]
		firstCard.focus()

		increment -= 20
		page -= 1

		recycleDOM(cardAll, typeCard)
		scrollToElem(getCoordY(firstCard))
		updateCount(parent)

		let givenBtnNextPage = btnNextPage

		givenBtnNextPage.disabled &&= false

		firstCard = null
		givenBtnNextPage = null
	}
}

const getDataMore = async typeCard => {
	if (!hasContinuation) return

	let dataMore = null

	try {
		switch (typeCard) {
			case 'video':
				dataMore = await API.scrapeVideosMore(hasContinuation)
				break

			case 'playlist':
				dataMore = await API.scrapePlaylistsMore(hasContinuation)
				break

			case 'rich':
				dataMore = await API.scrapeSearchResultsMore(hasContinuation)
				dataMore.items = filterSearchResults(dataMore.items)
				break
		}
	} catch (error) {
		showToast('error', error.message)
	}

	if (dataMore) {
		itemArray.push(...dataMore.items)
		hasContinuation = dataMore.continuation
	}
}

const recycleDOM = async (cardAll, typeCard) => {
	for (let index = 0, { length } = cardAll; index < length; index += 1) {
		const card = cardAll[index]
		const nextItem = itemArray[index + increment]

		if (nextItem) {
			card.hidden &&= false

			let type = typeCard

			if (typeCard === 'rich') {
				type = nextItem.type
				card.dataset.win = `${type}`
				card.classList.add(`_${type}`)
			}

			switch (type) {
				case 'video':
					fillVideoCard(card, index + increment, itemArray)
					break

				case 'playlist':
					fillPlaylistCard(card, index + increment, itemArray)
					break

				case 'channel':
					fillChannelCard(card, index + increment, itemArray)
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
	}
}

const updateCount = (parent) => {
	let gridCount = parent.querySelector('.grid__count')

	gridCount && (gridCount.textContent = page)

	gridCount = null
}

const resetCount = parent => {
	let gridCount = parent.querySelector('.grid__count')

	if (gridCount && +gridCount.textContent !== 1) gridCount.textContent = 1

	gridCount = null
}

const resetBtns = (btnNextPage, btnPrevPage) => {
	let givenBtnNextPage = btnNextPage
	let givenBtnPrevPage = btnPrevPage

	givenBtnNextPage.disabled &&= false
	givenBtnPrevPage.disabled ||= true

	givenBtnNextPage = null
	givenBtnPrevPage = null
}

const initPages = (parent, data, cardAll, typeCard, continuation = null) => {
	resetPages(parent)

	increment = 0
	page = 1
	itemArray.push(...data)
	hasContinuation = continuation

	let btnNextPage = parent.querySelector('.btns__next')
	let btnPrevPage = parent.querySelector('.btns__prev')

	const handleClickNextPage = _ => {
		nextPage(parent, cardAll, typeCard, btnNextPage, btnPrevPage)
	}

	const handleClickPrevPage = _ => {
		prevPage(parent, cardAll, typeCard, btnNextPage, btnPrevPage)
	}

	btnNextPage.addEventListener('click', handleClickNextPage)
	btnPrevPage.addEventListener('click', handleClickPrevPage)

	enablePages(parent)
	resetCount(parent)
	resetBtns(btnNextPage, btnPrevPage)
	getDataMore(typeCard)
}

const scrapeInfoToSwitchPage = winActive => {
	let cardAll = null
	let btnNextPage = null
	let btnPrevPage = null
	let typeCard = null
	let tabContentActive = null

	if (winActive.classList.contains('channel')) {
		tabContentActive = winActive.querySelector('.tab-content._active')

		if (tabContentActive) {
			cardAll = tabContentActive.querySelectorAll('.card')
			btnPrevPage = tabContentActive.querySelector('.btns__prev')
			btnNextPage = tabContentActive.querySelector('.btns__next')
			typeCard = cardAll[0].dataset.win
		}
	} else {
		cardAll = winActive.classList.contains('subscriptions')
			? winActive.querySelectorAll('.author')
			: winActive.querySelectorAll('.card')

		btnPrevPage = winActive.querySelector('.btns__prev')
		btnNextPage = winActive.querySelector('.btns__next')

		if (winActive.classList.contains('subscriptions')) typeCard = 'author'
		else if (winActive.classList.contains('search-results')) typeCard = 'rich'
		else typeCard = cardAll[0].dataset.win
	}

	return { cardAll, btnNextPage, btnPrevPage, typeCard, tabContentActive }
}
