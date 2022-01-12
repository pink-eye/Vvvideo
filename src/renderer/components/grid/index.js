import { getSelector } from 'Global/utils'
import { resetCard } from 'Components/card'
import { resetAuthorCard } from 'Components/card/card-author'

const resetGridAuthorCard = () => {
	let subscriptions = getSelector('.subscriptions')
	let authorCardAll = subscriptions.querySelectorAll('.author')

	if (authorCardAll.length > 0) {
		for (let index = 0, { length } = authorCardAll; index < length; index += 1) {
			const authorCard = authorCardAll[index]
			resetAuthorCard(authorCard)
		}
	}

	subscriptions = null
	authorCardAll = null
}

const resetGrid = parent => {
	let cardAll = parent.querySelectorAll('.card')

	if (cardAll.length === 0) return

	for (let index = 0, { length } = cardAll; index < length; index += 1) {
		const card = cardAll[index]
		resetCard(card)
	}

	cardAll = null
}

export { resetGrid, resetGridAuthorCard }
