import { AppStorage } from 'Global/app-storage'
import { getDurationTimeout, isEmpty } from 'Global/utils'
import { showToast } from 'Components/toast'

const appStorage = new AppStorage()
let storage = null

const hasSubscription = (channelId, name) => {
	storage = appStorage.getStorage()
	let isSubscribed = false

	const { subscriptions } = storage

	if (subscriptions.length === 0) return false

	for (let index = 0, { length } = subscriptions; index < length; index += 1) {
		const subscription = subscriptions[index]

		if (subscription.channelId === channelId || subscription.name === name) {
			isSubscribed = true
			break
		}
	}

	return isSubscribed
}

const addSubscription = async obj => {
	storage.subscriptions.push(obj)
	appStorage.updateStorage(storage)
}

const removeSubscription = async obj => {
	storage.subscriptions = storage.subscriptions.filter(
		item => item.channelId !== obj.channelId || item.name !== obj.name
	)
	appStorage.updateStorage(storage)
}

const transformBtn = (btn, btnText, isSubscribed) => {
	let givenBtn = btn
	let givenBtnText = btnText

	givenBtn.disabled = true

	!isSubscribed ? givenBtn.classList.add('_subscribed') : givenBtn.classList.remove('_subscribed')

	givenBtnText.style.opacity = '0'

	const onChangeState = _ => {
		givenBtnText.textContent = !isSubscribed ? 'Unsubscribe' : 'Subscribe'
		givenBtnText.removeAttribute('style')

		givenBtn.disabled = false

		givenBtn = null
		givenBtnText = null
	}

	setTimeout(onChangeState, getDurationTimeout(200))
}

const handleClickSubscribeBtn = event => {
	let btn = event.currentTarget

	let btnText = btn.querySelector('.subscribe__text')

	const { channelId, name } = btn.dataset

	if (!isEmpty(channelId) && !isEmpty(name)) {
		const isSubscribed = hasSubscription(channelId, name)
		const subObj = { channelId, name }

		transformBtn(btn, btnText, isSubscribed)

		isSubscribed ? removeSubscription(subObj) : addSubscription(subObj)
	} else {
		showToast('error', 'Did not get data about the channel')
		btn.removeEventListener('click', handleClickSubscribeBtn)
	}

	btn = null
	btnText = null
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
