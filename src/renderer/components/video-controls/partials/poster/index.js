import cs from 'Global/cacheSelectors'
export const hidePoster = () => {
	let videoPoster = cs.get('.video').querySelector('.video__poster')

	if (!videoPoster.classList.contains('_hidden')) videoPoster.classList.add('_hidden')

	videoPoster = null
}

export const resetPoster = () => {
	let videoPoster = cs.get('.video').querySelector('.video__poster')
	let videoPosterImg = videoPoster.querySelector('img')

	if (videoPoster.classList.contains('_hidden')) videoPoster.classList.remove('_hidden')
	videoPosterImg.removeAttribute('src')

	videoPoster = null
}
