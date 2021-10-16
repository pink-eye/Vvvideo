const chooseDropdownItem = (dropdown, dropdownBtn) => {
	let dropdownHead = dropdown.querySelector('.dropdown__head');

	if (dropdownHead)
		dropdownHead.childNodes[0].data = dropdownBtn.textContent

	dropdownHead = null
}

const initDropdown = (dropdown, callback) => {
	const dropdownBtnAll = dropdown.querySelectorAll('.dropdown__btn');

	if (dropdownBtnAll.length > 0) {
		for (let index = 0, length = dropdownBtnAll.length; index < length; index++) {
			const dropdownBtn = dropdownBtnAll[index];

			const handleClickBtn = _ => {
				chooseDropdownItem(dropdown, dropdownBtn)
				focusCurrentChoice(dropdown)
				callback(dropdownBtn)
			}

			dropdownBtn.addEventListener('click', handleClickBtn);
		}
	}
}

const hideLastDropdown = (currentDropdown = null) => {
	let winActive = _io_q('.main__content').querySelector('.win._active');
	let dropdownActive = winActive.querySelector('.dropdown._active');

	if (dropdownActive && dropdownActive !== currentDropdown)
		toggleDropdown(dropdownActive)

	winActive = null
	dropdownActive = null
}

const focusCurrentChoice = dropdown => {
	let dropdownHead = dropdown.querySelector('.dropdown__head');
	let dropdownBtnAll = dropdown.querySelectorAll('.dropdown__btn');

	for (let index = 0, length = dropdownBtnAll.length; index < length; index++) {
		const dropdownBtn = dropdownBtnAll[index];

		if (dropdownBtn.classList.contains('_current'))
			dropdownBtn.classList.remove('_current')

		if (dropdownHead.textContent === dropdownBtn.textContent) {
			dropdownBtn.focus();
			dropdownBtn.classList.add('_current')
		}
	}

	dropdownHead = null
	dropdownBtnAll = null
}

const toggleDropdown = dropdown => {

	const onOpenDropdown = _ => {
		focusCurrentChoice(dropdown)
	}

	if (dropdown.classList.contains('_active'))
		dropdown.classList.remove('_active')
	else {
		hideLastDropdown(dropdown)
		dropdown.classList.add('_active')
		setTimeout(onOpenDropdown, 100)
	}
}

document.addEventListener('DOMContentLoaded', _ => {
	const dropdownAll = document.querySelectorAll('.dropdown');

	if (dropdownAll.length > 0) {
		for (let index = 0, length = dropdownAll.length; index < length; index++) {
			const dropdown = dropdownAll[index];
			const dropdownHead = dropdown.querySelector('.dropdown__head');

			if (dropdownHead) {

				const handleClickHead = _ => { toggleDropdown(dropdown) }

				dropdownHead.addEventListener('click', handleClickHead);
			}
		}
	}
});
