import { isEmpty } from 'Global/utils'
import { removeSkeleton, resetSkeleton } from 'Components/skeleton'
import { handleErrorImage } from 'Components/card/helper'

export const fillAuthorCard = ({ parent, avatarSrc = '', name, subs = '', id }) => {
	let givenParent = parent
	let authorAvatar = givenParent.querySelector('.author__avatar img')
	let authorInfo = givenParent.querySelector('.author__info')
	let authorName = authorInfo.querySelector('.author__name span')
	let authorSubs = authorInfo.querySelector('.author__subs span')
	let avatarSkeleton = givenParent.querySelector('.avatar-skeleton')
	let skeletonAll = authorInfo.querySelectorAll('.skeleton')

	givenParent.disabled &&= false

	if (!isEmpty(avatarSrc)) {
		authorAvatar.src = avatarSrc

		const onLoadImage = () => {
			removeSkeleton(avatarSkeleton)

			authorAvatar = null
			avatarSkeleton = null
		}

		authorAvatar.addEventListener('load', onLoadImage, { once: true })
		authorAvatar.addEventListener('error', handleErrorImage, { once: true })
	}

	if (!isEmpty(name) && authorName.textContent !== name) {
		authorName.textContent = name
		removeSkeleton(skeletonAll[0])
		givenParent.dataset.name = name
	}

	if (!isEmpty(subs) && authorSubs.textContent !== subs) {
		authorSubs.textContent = subs
		removeSkeleton(skeletonAll[1])
	}

	givenParent.dataset.id = id

	authorInfo = null
	authorName = null
	authorSubs = null
	skeletonAll = null
	givenParent = null
}

export const resetAuthorCard = parent => {
	let givenParent = parent
	let authorAvatar = givenParent.querySelector('.author__avatar img')
	let authorInfo = givenParent.querySelector('.author__info')
	let authorName = authorInfo.querySelector('.author__name span')
	let authorSubs = authorInfo.querySelector('.author__subs span')
	let skeletonAll = givenParent.querySelectorAll('.skeleton')

	if (skeletonAll.length > 0) {
		for (let index = 0, { length } = skeletonAll; index < length; index += 1) {
			let skeleton = skeletonAll[index]

			resetSkeleton(skeleton)

			skeleton = null
		}
	}

	givenParent.removeAttribute('data-id')
	givenParent.removeAttribute('data-name')
	authorAvatar.removeAttribute('src')
	authorName.textContent = '...'
	authorSubs.textContent = '...'

	givenParent.disabled ||= true

	givenParent.hidden &&= false

	givenParent = null
	skeletonAll = null
	authorAvatar = null
	authorInfo = null
	authorName = null
	authorSubs = null
}
