import { AppStorage } from 'Global/app-storage'
import { getDurationTimeout, isEmpty, invokeFunctionByTimeout } from 'Global/utils'
import { showToast } from 'Components/toast'

const appStorage = new AppStorage()
let storage = null

const hasSubscription = (channelId, name) => {
	storage = appStorage.get()

	const { subscriptions } = storage

	if (subscriptions.length === 0) return false

	let isSubscribed = false

	for (let index = 0, { length } = subscriptions; index < length; index += 1) {
		const subscription = subscriptions[index]

		if (subscription.channelId === channelId || subscription.name === name) {
			isSubscribed = true
			break
		}
	}

	return isSubscribed
}

const addSubscription = obj => {
	storage.subscriptions.push(obj)
	storage.subscriptions = storage.subscriptions.sort((a, b) => a.name.localeCompare(b.name))
	appStorage.update(storage)
}

const removeSubscription = obj => {
	storage.subscriptions = storage.subscriptions.filter(
		item => item.channelId !== obj.channelId || item.name !== obj.name
	)
	appStorage.update(storage)
}

const transformBtn = (btn, btnText, isSubscribed) => {
	let givenBtn = btn
	let givenBtnText = btnText

	givenBtn.disabled = true

	!isSubscribed ? givenBtn.classList.add('_subscribed') : givenBtn.classList.remove('_subscribed')

	givenBtnText.style.opacity = '0'

	const onChangeState = () => {
		givenBtnText.textContent = !isSubscribed ? 'Unsubscribe' : 'Subscribe'
		givenBtnText.removeAttribute('style')

		givenBtn.disabled = false

		givenBtn = null
		givenBtnText = null
	}

	const timeout = getDurationTimeout(200)
	invokeFunctionByTimeout(onChangeState, timeout)
}

const handleClickSubscribeBtn = ({ currentTarget }) => {
	let btn = currentTarget

	const { channelId, name } = btn.dataset

	if (!isEmpty(channelId) && !isEmpty(name)) {
		const isSubscribed = hasSubscription(channelId, name)
		const subObj = { channelId, name }

		let btnText = btn.querySelector('.subscribe__text')

		transformBtn(btn, btnText, isSubscribed)

		isSubscribed ? removeSubscription(subObj) : addSubscription(subObj)

		btnText = null
	} else {
		showToast('error', 'Did not get data about the channel')
		btn.removeEventListener('click', handleClickSubscribeBtn)
	}

	btn = null
}

export const prepareSubscribeBtn = (btn, channelId, name) => {
	let givenBtn = btn
	let btnText = givenBtn.querySelector('.subscribe__text')

	if (!isEmpty(channelId) && isEmpty(givenBtn.dataset.channelId)) {
		givenBtn.dataset.channelId = channelId
		transformBtn(givenBtn, btnText, !hasSubscription(channelId, name))
	}

	if (!isEmpty(name) && isEmpty(givenBtn.dataset.name)) givenBtn.dataset.name = name

	givenBtn.addEventListener('click', handleClickSubscribeBtn)

	givenBtn = null
	btnText = null
}

export const destroySubscribeBtn = btn => {
	let givenBtn = btn
	let btnText = btn.querySelector('.subscribe__text')

	givenBtn.removeAttribute('data-channel-id')
	givenBtn.removeAttribute('data-name')
	btnText.textContent = ''

	if (givenBtn.classList.contains('_subscribed')) givenBtn.classList.remove('_subscribed')

	givenBtn.removeEventListener('click', handleClickSubscribeBtn)

	givenBtn = null
	btnText = null
}
