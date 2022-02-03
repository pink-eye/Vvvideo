import { getDurationTimeout } from 'Global/utils'

const removeSkeleton = skeleton => {
	let givenSkeleton = skeleton
	const timeout = getDurationTimeout()

	if (!givenSkeleton.classList.contains('_active')) givenSkeleton.classList.add('_removing')

	const hideSkeleton = () => {
		givenSkeleton.hidden ||= true
		givenSkeleton = null
	}

	timeout > 0
		? givenSkeleton.addEventListener('transitionend', hideSkeleton, { once: true })
		: hideSkeleton()
}

const resetSkeleton = skeleton => {
	let givenSkeleton = skeleton
	if (givenSkeleton.classList.contains('_removing')) givenSkeleton.classList.remove('_removing')

	givenSkeleton.hidden &&= false
	givenSkeleton = null
}

export { removeSkeleton, resetSkeleton }
