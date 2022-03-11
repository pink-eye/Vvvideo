import { resetVideoCard } from 'Components/card/card-video'
import { resetChannelCard } from 'Components/card/card-rich'
import { resetPlaylistCard } from 'Components/card/card-playlist'
import { resetSkeleton } from 'Components/skeleton'

const resetCard = card => {
	let givenCard = card
	let skeletonAll = givenCard.querySelectorAll('.skeleton')
	let cardTitle = givenCard.querySelector('.card__title span')
	let cardImg = givenCard.querySelector('.card__image img')

	if (skeletonAll.length > 0) {
		for (let index = 0, { length } = skeletonAll; index < length; index += 1) {
			let skeleton = skeletonAll[index]

			resetSkeleton(skeleton)

			skeleton = null
		}
	}

	givenCard.removeAttribute('data-id')
	cardTitle.textContent = '...'
	cardImg.removeAttribute('src')

	switch (givenCard.dataset.win) {
		case 'video':
			resetVideoCard(givenCard)
			break

		case 'channel':
			resetChannelCard(givenCard)
			break

		case 'playlist':
			resetPlaylistCard(givenCard)
			break
	}

	givenCard.disabled ||= true
	givenCard.hidden &&= false

	let recentWin = givenCard.closest('.win')

	if (recentWin && recentWin.classList.contains('search-results')) {
		const typeArray = ['_video', '_playlist', '_channel']

		typeArray.forEach(type => {
			if (givenCard.classList.contains(type)) {
				givenCard.classList.remove(type)
				return
			}
		})
	}

	givenCard = null
	skeletonAll = null
	recentWin = null
	cardTitle = null
	cardImg = null
}

export default resetCard
