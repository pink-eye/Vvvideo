let increment = null;
let page = null;
let itemArray = [];
let hasContinuation = null;

const disablePages = parent => {
	let btns = parent.querySelector('.btns');

	btns && (btns.hidden ||= true)

	btns = null;
}

const enablePages = parent => {
	let btns = parent.querySelector('.btns');

	btns &&	(btns.hidden &&= false);

	btns = null;
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

const resetPages = async parent => {
	let grid = parent.querySelector('.grid');
	let btns = grid.querySelector('.btns');

	if (btns) {
		btns.remove()
		grid.insertAdjacentHTML('beforeEnd', createPages());

		btns = null;
		grid = null;
	}

	itemArray.length = 0;
}

const nextPage = (parent, cardAll, typeCard, btnNextPage, btnPrevPage) => {
	typeCard !== 'author' ? resetGrid(parent) : resetGridAuthorCard()

	if (increment < itemArray.length - 1) {
		let firstCard = cardAll[0]
		firstCard.focus()

		increment += 20
		getDataMore(typeCard)
		recycleDOM(increment, cardAll, typeCard)
		scrollToElem(getCoordY(firstCard))
		page++
		updateCount(page, parent)

		btnPrevPage.disabled &&= false

		firstCard = null
	}

	if (page * 20 > itemArray.length - 1)
		btnNextPage.disabled = true
}

const prevPage = (parent, cardAll, typeCard, btnNextPage, btnPrevPage) => {
	typeCard !== 'author'
		? resetGrid(parent)
		: resetGridAuthorCard()

	if (page === 2) btnPrevPage.disabled = true

	if (page > 1) {
		let firstCard = cardAll[0]
		firstCard.focus()

		increment -= 20;
		recycleDOM(increment, cardAll, typeCard)
		scrollToElem(getCoordY(firstCard))
		page--
		updateCount(page, parent)

		btnNextPage.disabled &&= false

		firstCard = null
	}
}

const getDataMore = async typeCard => {
	if (!hasContinuation) return

	let dataMore = null

	try {
		switch (typeCard) {
			case 'video':
				dataMore = await API.scrapeVideosMore(hasContinuation);
				break;

			case 'playlist':
				dataMore = await API.scrapePlaylistsMore(hasContinuation);
				break;

			case 'rich':
				dataMore = await API.scrapeSearchResultsMore(hasContinuation);
				dataMore.items = filterSearchResults(dataMore.items)
				break;
		}
	} catch (error) {
		showToast('error', error.message)
	}

	if (dataMore) {
		itemArray.push(...dataMore.items);
		hasContinuation = dataMore.continuation;
	}
}

const recycleDOM = async (increment, cardAll, typeCard) => {
	for (let index = 0, length = cardAll.length; index < length; index++) {
		const card = cardAll[index];
		const nextItem = itemArray[index + increment]

		if (nextItem) {
			card.hidden &&= false

			switch (typeCard) {
				case "video":
					fillVideoCard(card, index + increment, itemArray);
					break;

				case "author":
					const { avatar, name, channelId } = nextItem

					let authorParams = {
						parent: card,
						avatarSrc: avatar,
						name: name,
						id: channelId,
					}

					fillAuthorCard(authorParams);

					authorParams = null
					break;

				case "playlist":
					fillPlaylistCard(card, index + increment, itemArray);
					break;

				case "rich":
					const { type } = nextItem

					card.dataset.win = `${type}`
					card.classList.add(`_${type}`);

					switch (type) {
						case 'video':
							fillVideoCard(card, index + increment, itemArray);
							break;

						case 'channel':
							fillChannelCard(card, index + increment, itemArray);
							break;

						case 'playlist':
							fillPlaylistCard(card, index + increment, itemArray);
							break;
					}
			}
		} else card.hidden = true;
	}
}

const updateCount = (page, parent) => {
	let gridCount = parent.querySelector('.grid__count');

	gridCount && (gridCount.textContent = page);

	gridCount = null;
}

const resetCount = parent => {
	let gridCount = parent.querySelector('.grid__count');

	if (gridCount && +gridCount.textContent !== 1)
		gridCount.textContent = 1;

	gridCount = null;
}

const resetBtns = (btnNextPage, btnPrevPage) => {
	btnNextPage.disabled &&= false
	btnPrevPage.disabled ||= true
}

const initPages = (parent, data, cardAll, typeCard, continuation = null) => {
	resetPages(parent)

	increment = 0;
	page = 1;
	itemArray.push(...data);
	hasContinuation = continuation;

	let btnNextPage = parent.querySelector('.btns__next');
	let btnPrevPage = parent.querySelector('.btns__prev');

	const handleClickNextPage = _ => {
		nextPage(parent, cardAll, typeCard, btnNextPage, btnPrevPage)
	}

	const handleClickPrevPage = _ => {
		prevPage(parent, cardAll, typeCard, btnNextPage, btnPrevPage)
	}

	btnNextPage.addEventListener('click', handleClickNextPage);
	btnPrevPage.addEventListener('click', handleClickPrevPage);

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
			btnPrevPage = tabContentActive.querySelector('.btns__prev');
			btnNextPage = tabContentActive.querySelector('.btns__next');
			typeCard = cardAll[0].dataset.win
		}
	} else {
		cardAll = winActive.classList.contains('subscriptions')
			? winActive.querySelectorAll('.author')
			: winActive.querySelectorAll('.card')

		btnPrevPage = winActive.querySelector('.btns__prev');
		btnNextPage = winActive.querySelector('.btns__next');
		typeCard = winActive.classList.contains('subscriptions')
			? 'author'
			: winActive.classList.contains('search-results')
				? 'rich'
				: cardAll[0].dataset.win
	}

	return { cardAll, btnNextPage, btnPrevPage, typeCard, tabContentActive }
}
