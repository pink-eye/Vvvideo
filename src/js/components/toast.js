const createToastItemHTML = (type, text) => `<li class="toast__item _${type}"><div class="toast__icon"></div>${text}</li>`

const isExistSimilarToast = text => _io_q('.toast__list').textContent.includes(text)

const showToast = (type, text) => {

	if (!isExistSimilarToast(text)) {
		let toastList = _io_q('.toast__list')

		toastList.insertAdjacentHTML('beforeEnd', createToastItemHTML(type, text))

		let toastItemAll = toastList.querySelectorAll('.toast__item');
		let lastToastItem = toastItemAll[toastItemAll.length - 1];

		setTimeout(_ => { lastToastItem.classList.add('_visible') }, 15);

		// setTimeout(_ => {
		// 	lastToastItem.classList.remove('_visible')

		// 	setTimeout(_ => {
		// 		lastToastItem.remove()

		// 		toastItemAll = null
		// 		toastList = null
		// 	}, 4000)

		// }, 5000)
	}
}
