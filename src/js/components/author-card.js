const fillAuthorCard = ({ parent, avatarSrc = '', name, subs = '', id }) => {
	let authorAvatar = parent.querySelector('.author__avatar img')
	let authorInfo = parent.querySelector('.author__info')
	let authorName = authorInfo.querySelector('.author__name span')
	let authorSubs = authorInfo.querySelector('.author__subs span')
	let avatarSkeleton = parent.querySelector('.avatar-skeleton')
	let skeletonAll = authorInfo.querySelectorAll('.skeleton')

	parent.disabled &&= false

	if (!isEmpty(avatarSrc)) {
		authorAvatar.src = avatarSrc

		const onLoadImage = _ => {
			removeSkeleton(avatarSkeleton)

			authorAvatar = null
			avatarSkeleton = null
		}

		const onErrorImage = _ => {
			showToast('error', 'Could not load images :(')
		}

		authorAvatar.addEventListener('load', onLoadImage, { once: true })
		authorAvatar.addEventListener('error', onErrorImage, { once: true })
	}

	if (!isEmpty(name) && authorName.textContent !== name) {
		authorName.textContent = name
		removeSkeleton(skeletonAll[0])
		parent.dataset.name = name
	}

	if (!isEmpty(subs) && authorSubs.textContent !== subs) {
		authorSubs.textContent = subs
		removeSkeleton(skeletonAll[1])
	}

	parent.dataset.id = id

	authorInfo = null
	authorName = null
	authorSubs = null
	skeletonAll = null
	parent = null
}

const resetAuthorCard = parent => {
	let authorAvatar = parent.querySelector('.author__avatar img')
	let authorInfo = parent.querySelector('.author__info')
	let authorName = authorInfo.querySelector('.author__name span')
	let authorSubs = authorInfo.querySelector('.author__subs span')
	let skeletonAll = parent.querySelectorAll('.skeleton')

	if (skeletonAll.length > 0) {
		for (let index = 0, { length } = skeletonAll; index < length; index += 1) {
			const skeleton = skeletonAll[index]
			resetSkeleton(skeleton)
		}
	}

	parent.removeAttribute('data-id')
	parent.removeAttribute('data-name')
	authorAvatar.removeAttribute('src')
	authorName.textContent = '...'
	authorSubs.textContent = '...'

	parent.disabled ||= true

	parent.hidden &&= false

	skeletonAll = null
	authorAvatar = null
	authorInfo = null
	authorName = null
	authorSubs = null
}
