import Toastify from 'toastify-js'

const showToast = (type, text) => {
	let iconURL = null

	switch (type) {
		case 'good':
			iconURL = './img/success.svg'
			break
		case 'error':
			iconURL = './img/error.svg'
			break
		case 'info':
			iconURL = './img/info.svg'
			break
	}

	Toastify({
		className: type,
		avatar: iconURL,
		stopOnFocus: true,
		duration: 4000,
		close: true,
		gravity: 'bottom',
		text,
	}).showToast()
}

export default showToast
