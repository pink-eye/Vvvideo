import { getDurationTimeout, invokeFunctionByTimeout } from 'Global/utils'

const removeSkeleton = skeleton => {
	let givenSkeleton = skeleton

	if (!givenSkeleton.classList.contains('_active')) givenSkeleton.classList.add('_removing')

	const onRemoveSkeleton = () => {
		givenSkeleton.hidden ||= true
		givenSkeleton = null
	}

	const timeout = getDurationTimeout()
	invokeFunctionByTimeout(onRemoveSkeleton, timeout)
}

const resetSkeleton = skeleton => {
	let givenSkeleton = skeleton
	if (givenSkeleton.classList.contains('_removing')) givenSkeleton.classList.remove('_removing')

	givenSkeleton.hidden &&= false
	givenSkeleton = null
}

export { removeSkeleton, resetSkeleton }
