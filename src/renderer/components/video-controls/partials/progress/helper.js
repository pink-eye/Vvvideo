const round = (n, d) => Number(~~(n + 'e' + d) + 'e-' + d)

export const getPosStroryboard = (videoDuration, currentTime, count) => {
	const interval = round(videoDuration / count, 2)
	const currentFrame = Math.floor(currentTime / interval)

	let column = currentFrame
	let row = 0

	if (currentFrame > 9 && currentFrame < 90) {
		while (column > 9) {
			column -= 9
			row += 1
		}
	} else if (currentFrame >= 90 && currentFrame <= 99) {
		column = 9
		row = 9
	}

	const posX = 160 * column
	const posY = 90 * row

	return { posX, posY }
}

export const sponsorblockItemHTML = ({ left, width }) =>
	`<li class="sponsorblock__item" style="--left:${left};--width:${width};"></li>`

export const progressBarChapterHTML = left =>
	`<li class="progress__chapter" style="--left: ${left}"></li>`
