const showOverlay = _ => {
	let overlayAll = document.querySelectorAll('.overlay');

	for (let index = 0, length = overlayAll.length; index < length; index++) {
		const overlay = overlayAll[index];

		if (!overlay.classList.contains('_active'))
			overlay.classList.add('_active')
	}

	overlayAll = null
}

const hideOverlay = _ => {
	let overlayAll = document.querySelectorAll('.overlay');

	for (let index = 0, length = overlayAll.length; index < length; index++) {
		const overlay = overlayAll[index];

		if (overlay.classList.contains('_active'))
			overlay.classList.remove('_active')
	}

	overlayAll = null
}


