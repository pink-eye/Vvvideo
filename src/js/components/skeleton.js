const removeSkeleton = skeleton => {
	let givenSkeleton = skeleton

	if (!givenSkeleton.classList.contains('_active')) givenSkeleton.classList.add('_removing')

	const onRemoveSkeleton = _ => {
		givenSkeleton.hidden ||= true
		givenSkeleton = null
	}

	setTimeout(onRemoveSkeleton, getDurationTimeout())
}

const resetSkeleton = skeleton => {
	let givenSkeleton = skeleton
	if (givenSkeleton.classList.contains('_removing')) givenSkeleton.classList.remove('_removing')

	givenSkeleton.hidden &&= false
	givenSkeleton = null
}
