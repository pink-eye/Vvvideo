export const filterSearchResults = arr =>
	arr.filter(el => el.type === 'video' || el.type === 'playlist' || el.type === 'channel')
