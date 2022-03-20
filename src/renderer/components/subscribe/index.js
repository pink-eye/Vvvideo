import { isEmpty } from 'Global/utils'
import AppStorage from 'Global/AppStorage'
import showToast from 'Components/toast'

const appStorage = new AppStorage()
let storage = null

export default class SubscribeBtn {
	constructor(config) {
		this.btn = config.element
		this.name = config.name
		this.channelId = config.channelId
		this.btnText = this.btn.querySelector('.subscribe__text')
		this.isSubscribed = null

		this.handleClick = this.handleClick.bind(this)

		this.init()
	}

	#displayState() {
		if (interaction) {
			this.btn.disabled = true

			setTimeout(() => {
				this.btn.disabled = false
			}, 300)
		}

		if (this.isSubscribed) {
			this.btn.classList.add('_subscribed')
			this.btnText.textContent = 'Unsubscribe'
		} else {
			this.btn.classList.remove('_subscribed')
			this.btnText.textContent = 'Subscribe'
		}
	}

	handleClick() {
		if (!isEmpty(this.channelId) && !isEmpty(this.name)) {
			const subscriptionObj = { channelId: this.channelId, name: this.name }

			this.isSubscribed
				? removeSubscription(subscriptionObj)
				: addSubscription(subscriptionObj)

			this.isSubscribed = !this.isSubscribed

			this.#displayState(true)
		} else {
			showToast('error', "Haven't got data about the channel")
			this.btn.removeEventListener('click', this.handleClick)
		}
	}

	init() {
		if (!isEmpty(this.channelId) && !isEmpty(this.name)) {
			const subscriptionObj = { channelId: this.channelId, name: this.name }

			this.isSubscribed = hasSubscription(subscriptionObj)
			this.#displayState(false)
		}

		this.btn.addEventListener('click', this.handleClick)
	}

	reset() {
		if (this.isSubscribed) this.btn.classList.remove('_subscribed')
		this.btnText.textContent = ''

		this.btn.removeEventListener('click', this.handleClick)
	}
}

const hasSubscription = ({ channelId, name }) => {
	storage = appStorage.get()

	const { subscriptions } = storage

	if (subscriptions.length === 0) return false

	for (let index = 0, { length } = subscriptions; index < length; index += 1) {
		const subscription = subscriptions[index]

		if (subscription.channelId === channelId || subscription.name === name) {
			return true
		}
	}

	return false
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

// const visualizeStateBtn = ({ selector, subscriptionObj, interaction = true }) => {
// 	let givenBtn = selector

// 	if (interaction) {
// 		givenBtn.disabled = true

// 		setTimeout(() => {
// 			givenBtn.disabled = false
// 			givenBtn = null
// 		}, 300)
// 	}

// 	const isSubscribed = hasSubscription(subscriptionObj)

// 	isSubscribed ? givenBtn.classList.add('_subscribed') : givenBtn.classList.remove('_subscribed')

// 	let btnText = givenBtn.querySelector('.subscribe__text')
// 	btnText.textContent = isSubscribed ? 'Unsubscribe' : 'Subscribe'
// 	btnText = null
// }

// const handleClickSubscribeBtn = ({ currentTarget }) => {
// 	let btn = currentTarget

// 	const { channelId, name } = btn.dataset

// 	if (!isEmpty(channelId) && !isEmpty(name)) {
// 		const subscriptionObj = { channelId, name }
// 		const isSubscribed = hasSubscription(subscriptionObj)
// 		isSubscribed ? removeSubscription(subscriptionObj) : addSubscription(subscriptionObj)

// 		visualizeStateBtn({ selector: btn, subscriptionObj })
// 	} else {
// 		showToast('error', 'Did not get data about the channel')
// 		btn.removeEventListener('click', handleClickSubscribeBtn)
// 	}

// 	btn = null
// }

// export const prepareSubscribeBtn = (selector, channelId, name) => {
// 	let givenBtn = selector

// 	if (!isEmpty(channelId) && isEmpty(givenBtn.dataset.channelId)) {
// 		givenBtn.dataset.channelId = channelId
// 		const subscriptionObj = { channelId, name }
// 		visualizeStateBtn({ selector, subscriptionObj, interaction: false })
// 	}

// 	if (!isEmpty(name) && isEmpty(givenBtn.dataset.name)) givenBtn.dataset.name = name

// 	givenBtn.addEventListener('click', handleClickSubscribeBtn)

// 	givenBtn = null
// }

// export const destroySubscribeBtn = selector => {
// 	let givenBtn = selector
// 	let btnText = givenBtn.querySelector('.subscribe__text')

// 	givenBtn.removeAttribute('data-channel-id')
// 	givenBtn.removeAttribute('data-name')
// 	btnText.textContent = ''

// 	if (givenBtn.classList.contains('_subscribed')) givenBtn.classList.remove('_subscribed')

// 	givenBtn.removeEventListener('click', handleClickSubscribeBtn)

// 	givenBtn = null
// 	btnText = null
// }
