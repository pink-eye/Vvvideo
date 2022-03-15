import AppStorage from 'Global/AppStorage'

export const getHighestAudio = formats => API.YTDLChooseFormat(formats, 'highestaudio')

const filterFormats = (formats, fn) => Object.values(formats).filter(fn)

const filterVideoWebm = formats =>
	filterFormats(
		formats,
		format =>
			format.container === 'webm' && format.hasVideo && !format.isDashMPD && !format?.type
	)

const filterVideoMP4NoAudio = formats =>
	filterFormats(
		formats,
		format =>
			format.container === 'mp4' &&
			format.hasVideo &&
			!format.hasAudio &&
			!format.isDashMPD &&
			!format?.type
	)

export const filterVideoAndAudio = formats =>
	filterFormats(formats, format => format.hasAudio && format.hasVideo)

export const filterHLS = formats =>
	filterFormats(formats, format => format.isHLS && format.hasAudio && format.hasVideo)

export const getPreferredQuality = formats => {
	if (formats.length === 0) return null

	const appStorage = new AppStorage()
	const storage = appStorage.get()
	const { defaultQuality } = storage.settings

	return defaultQuality === 'highest'
		? getHighestVideo(formats)
		: formats.find(el => el.qualityLabel.includes(defaultQuality))
}

export const resetMediaEl = el => {
	let givenEl = el

	givenEl.pause()
	givenEl.removeAttribute('src')
	givenEl.load()

	givenEl = null
}

export const isPlaying = el =>
	el && !el.paused && !el.ended && el.currentTime > 0 && el.readyState > 2

export const isPlayingLight = el => el && !el.paused && !el.ended && el.currentTime >= 0

export const getVideoFormatsByDefaultFormat = (formats, defaultVideoFormat) => {
	let requiredFormats = null

	switch (defaultVideoFormat) {
		case 'mp4':
			requiredFormats = filterVideoMP4NoAudio(formats)

			if (requiredFormats?.length > 0) break
			else return getVideoFormatsByDefaultFormat(formats, 'webm')

		case 'webm':
			requiredFormats = filterVideoWebm(formats)

			if (requiredFormats?.length > 0) break
			else return getVideoFormatsByDefaultFormat(formats, 'mp4')
	}

	return requiredFormats
}

export const getRequiredChapter = (chapters, time) => {
	let requiredChapter = null

	chapters.forEach(chapter => {
		if (chapter.start_time < time) {
			requiredChapter = chapter
			return
		}
	})

	return requiredChapter
}
