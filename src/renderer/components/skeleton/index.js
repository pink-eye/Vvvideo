const removeSkeleton = skeleton => {
	queueMicrotask(() => {
		let givenSkeleton = skeleton

		givenSkeleton.hidden ||= true

		givenSkeleton = null
	})
}

const resetSkeleton = skeleton => {
	queueMicrotask(() => {
		let givenSkeleton = skeleton

		givenSkeleton.hidden &&= false

		givenSkeleton = null
	})
}

export { removeSkeleton, resetSkeleton }
