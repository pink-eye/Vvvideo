export const calculatePublishedDate = publishedText => {
	const date = new Date()

	if (publishedText === 'Live') return publishedText

	const textSplit = publishedText.split(' ')

	if (textSplit[0].toLowerCase() === 'streamed') textSplit.shift()

	const timeFrame = textSplit[1]
	const timeAmount = +textSplit[0]
	let timeSpan = null

	const timeUnits = {
		second: 1000,
		minute: 60000,
		hour: 3600000,
		day: 86400000,
		week: 604800000,
		month: 2592000000,
		year: 31556952000,
	}

	const timeUnitArray = Object.entries(timeUnits)

	for (const [key, value] of timeUnitArray) {
		if (timeFrame.includes(`${key}`)) timeSpan = timeAmount * value
	}

	return date.getTime() - timeSpan
}
