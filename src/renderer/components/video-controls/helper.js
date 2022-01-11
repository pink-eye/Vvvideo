import { AppStorage } from 'Global/app-storage'

export const getMin = (a, b) => (a > b ? b : a)

export const round = (n, d) => Number(~~(n + 'e' + d) + 'e-' + d)

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

export const getHighestVideo = formats => API.YTDLChooseFormat(formats, 'highestvideo')

export const getHighestAudio = formats => API.YTDLChooseFormat(formats, 'highestaudio')

export const filterFormats = (formats, fn) => Object.values(formats).filter(fn)

export const filterVideoWebm = formats =>
	filterFormats(
		formats,
		format => format.container === 'webm' && format.hasVideo && !format.isDashMPD && !format?.type
	)

export const filterVideoMP4NoAudio = formats =>
	filterFormats(
		formats,
		format =>
			format.container === 'mp4' && format.hasVideo && !format.hasAudio && !format.isDashMPD && !format?.type
	)

export const filterVideoAndAudio = formats => filterFormats(formats, format => format.hasAudio && format.hasVideo)

export const filterHLS = formats => filterFormats(formats, format => format.isHLS && format.hasAudio && format.hasVideo)

export const getPreferredQuality = formats => {
	if (formats.length === 0) return null

	const appStorage = new AppStorage()
	const storage = appStorage.get()
	const { defaultQuality } = storage.settings

	return defaultQuality === 'highest'
		? getHighestVideo(formats)
		: formats.find(el => el.qualityLabel.includes(defaultQuality))
}
