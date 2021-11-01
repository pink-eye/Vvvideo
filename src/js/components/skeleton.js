const removeSkeleton = skeleton => {
	if (!skeleton.classList.contains('_active'))
		skeleton.classList.add('_removing');

	const onRemoveSkeleton = _ => {
		skeleton.hidden ||= true
		skeleton = null
	}

	setTimeout(onRemoveSkeleton, getDurationTimeout())
}

const resetSkeleton = skeleton => {
	if (skeleton.classList.contains('_removing'))
		skeleton.classList.remove('_removing')

	skeleton.hidden &&= false
}
