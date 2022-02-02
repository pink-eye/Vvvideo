import { getSelector } from 'Global/utils'

const createToastItemHTML = (type, text) =>
	`<li class="toast__item _${type}"><div class="toast__icon"></div>${text}</li>`

const isExistSimilarToast = text => getSelector('.toast__list').textContent.includes(text)

const showToast = (type, text) => {
	if (!isExistSimilarToast(text)) {
		let animationStep = 0
		let toastList = getSelector('.toast__list')

		toastList.insertAdjacentHTML('afterBegin', createToastItemHTML(type, text))

		let toastItemAll = toastList.querySelectorAll('.toast__item')
		let firstToastItem = toastItemAll[0]

		const removeToast = () => {
			firstToastItem.remove()

			toastItemAll = null
			toastList = null
			firstToastItem = null
		}

		const hideToast = () => firstToastItem.classList.remove('_visible')

		firstToastItem.classList.add('_visible')

		firstToastItem.addEventListener('animationend', () => {
			animationStep += 1

			if (animationStep === 2) hideToast()

			if (animationStep === 3) removeToast()
		})
	}
}

export { showToast }
