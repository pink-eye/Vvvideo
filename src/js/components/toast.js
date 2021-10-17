const createToastItemHTML = (type, text) => `<li class="toast__item _${type}"><div class="toast__icon"></div>${text}</li>`

const isExistSimilarToast = text => _io_q('.toast__list').textContent.includes(text)

const showToast = (type, text) => {

	if (!isExistSimilarToast(text)) {
		let toastList = _io_q('.toast__list')

		toastList.insertAdjacentHTML('afterBegin', createToastItemHTML(type, text))

		let toastItemAll = toastList.querySelectorAll('.toast__item');
		let firstToastItem = toastItemAll[0];

		const afterAddToast = _ => {
			firstToastItem.classList.add('_visible')
		}

		const beforeRemoveToast = _ => {
			firstToastItem.classList.remove('_visible')

			setTimeout(onRemoveToast, 2000)
		}

		const onRemoveToast = _ => {
			firstToastItem.remove()

			toastItemAll = null
			toastList = null
			firstToastItem = null
		}

		setTimeout(afterAddToast, 5);

		setTimeout(beforeRemoveToast, 5000)
	}
}
