import { resetAuthorCard } from './author-card'
import { resetCard } from './card'

const resetGridAuthorCard = _ => {
	let subscriptions = _io_q('.subscriptions')
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
	const cardAll = parent.querySelectorAll('.card')

	if (cardAll.length > 0) {
		for (let index = 0, { length } = cardAll; index < length; index += 1) {
			const card = cardAll[index]
			resetCard(card)
		}
	}
}

export { resetGrid, resetGridAuthorCard }
