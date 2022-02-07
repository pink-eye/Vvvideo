import { getSelector } from 'Global/utils'

const changeHeadContent = (dropdown, dropdownBtn) => {
	let dropdownHead = dropdown.querySelector('.dropdown__head')

	if (dropdownHead) dropdownHead.childNodes[0].data = dropdownBtn.textContent

	dropdownHead = null
}

const focusCurrentChoice = dropdown => {
	let dropdownHead = dropdown.querySelector('.dropdown__head')
	let dropdownBtnAll = dropdown.querySelectorAll('.dropdown__btn')
	let dropdownBtnCurrent = dropdown.querySelector('._current')

	if (dropdownBtnCurrent) dropdownBtnCurrent.classList.remove('_current')

	for (let index = 0, { length } = dropdownBtnAll; index < length; index += 1) {
		let dropdownBtn = dropdownBtnAll[index]

		if (dropdownHead.textContent.trim() === dropdownBtn.textContent.trim()) {
			dropdownBtn.focus()
			dropdownBtn.classList.add('_current')
		}

		dropdownBtn = null
	}

	dropdownHead = null
	dropdownBtnAll = null
	dropdownBtnCurrent = null
}

export function hideLastDropdown(currentDropdown = null) {
	let winActive = getSelector('.main__content').querySelector('.win._active')

	if (!winActive) return

	let dropdownActive = winActive.querySelector('.dropdown._active')

	if (dropdownActive && dropdownActive !== currentDropdown) toggleDropdown(dropdownActive)

	dropdownActive = null

	winActive = null
}

function toggleDropdown(dropdown) {
	const onOpenDropdown = () => focusCurrentChoice(dropdown)

	if (dropdown.classList.contains('_active')) dropdown.classList.remove('_active')
	else {
		hideLastDropdown(dropdown)
		dropdown.classList.add('_active')
		setTimeout(onOpenDropdown, 100)
	}
}

export const initDropdown = (dropdown, callback, options = null) => {
	let dropdownList = dropdown.querySelector('.dropdown__list')

	if (!dropdownList) return

	const handleClickBtn = ({ target }) => {
		let dropdownBtn = target.classList.contains('dropdown__btn')
			? target
			: target.closest('.dropdown__btn')

		if (!dropdownBtn) return

		if (!options?.changeHead) changeHeadContent(dropdown, dropdownBtn)

		focusCurrentChoice(dropdown)
		callback(dropdownBtn)

		dropdownBtn = null
	}

	dropdownList.addEventListener('click', handleClickBtn)

	dropdownList = null
}

export const startDropdowns = () => {
	let dropdownAll = document.querySelectorAll('.dropdown')

	if (dropdownAll.length === 0) return

	for (let index = 0, { length } = dropdownAll; index < length; index += 1) {
		const dropdown = dropdownAll[index]
		const dropdownHead = dropdown.querySelector('.dropdown__head')

		if (dropdownHead) {
			const handleClickHead = () => toggleDropdown(dropdown)

			dropdownHead.addEventListener('click', handleClickHead)
		}
	}

	dropdownAll = null
}
