
const removeSkeleton = skeleton => {
	skeleton.classList.add('_removing');

	const onRemoveSkeleton = () => {
		skeleton.hidden = true
		skeleton = null
	}

	setTimeout(onRemoveSkeleton, getDurationTimeout())
}

const resetSkeleton = skeleton => {
	skeleton.classList.remove('_removing')
	skeleton.hidden = false
}
