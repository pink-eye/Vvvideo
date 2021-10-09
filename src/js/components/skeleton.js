
const removeSkeleton = skeleton => {
	skeleton.classList.add('_removing');

	setTimeout(_ => {
		skeleton.hidden = true
		skeleton = null
	}, getDurationTimeout())
}

const resetSkeleton = skeleton => {
	skeleton.classList.remove('_removing')
	skeleton.hidden = false
}
