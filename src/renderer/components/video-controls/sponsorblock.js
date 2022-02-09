import { getSelector } from 'Global/utils'

export const createSponsorblockItemHTML = ({ left, width }) =>
	`<li class="sponsorblock__item" style="--left:${left};--width:${width};"></li>`

export const uuidv4 = () =>
	'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
		let r = (Math.random() * 16) | 0,
			v = c === 'x' ? r : (r & 0x3) | 0x8
		return v.toString(16)
	})

export const getSegmentsSB = id => API.getSponsorblockInfo(id, uuidv4())

export const toggleSponsorblock = option => {
	let sponsorblockBtn = getSelector('.controls').querySelector('.controls__sponsorblock')

	sponsorblockBtn.hidden = option

	sponsorblockBtn = null
}
