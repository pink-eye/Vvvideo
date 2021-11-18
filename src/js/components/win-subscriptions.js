let isUpdated = false

const openWinSubs = async _ => {
	const promises = []
	let channelInfoArray = null
	let subscriptions = _io_q('.subscriptions')
	let authorCardAll = subscriptions.querySelectorAll('.author')
	let btnSubscriptions = document.querySelector('button[data-win="subscriptions"]')
	const ss = storage.subscriptions

	ss.length > authorCardAll.length
		? initPages(subscriptions, ss, authorCardAll, 'author')
		: disablePages(subscriptions)

	for (let index = 0, { length } = authorCardAll; index < length; index += 1) {
		const authorCard = authorCardAll[index]
		const sub = ss[index]

		if (sub) {
			const { name, channelId, avatar = '' } = sub

			let authorParams = {
				parent: authorCard,
				id: channelId,
				avatarSrc: avatar,
				name,
			}

			fillAuthorCard(authorParams)

			authorParams = null
		} else authorCard.hidden = true
	}

	if (!isUpdated) {
		for (let index = 0, { length } = ss; index < length; index += 1) {
			const subscription = ss[index]

			if (btnSubscriptions.classList.contains('_active'))
				promises.push(API.scrapeChannelInfo(subscription.channelId))
			else return
		}

		try {
			channelInfoArray = [].concat.apply([], await Promise.all(promises))
		} catch (error) {
			showToast('error', error.message)
		} finally {
			resetIndicator()
		}

		if (channelInfoArray && channelInfoArray.length > 0) {
			for (let index = 0, { length } = ss; index < length; index += 1) {
				const subscription = storage.subscriptions[index]
				const channelInfo = channelInfoArray[index]

				if (btnSubscriptions.classList.contains('_active')) {
					subscription.avatar = channelInfo.authorThumbnails.at(-1).url
					subscription.name = channelInfo.author
				} else return
			}

			API.writeStorage(storage)

			isUpdated = true
		}

		subscriptions = null
		authorCardAll = null
		btnSubscriptions = null
	}
}

const hasSubscription = (channelId, name) => {
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
	await API.writeStorage(storage)
}

const removeSubscription = async obj => {
	storage.subscriptions = storage.subscriptions.filter(
		item => item.channelId !== obj.channelId || item.name !== obj.name
	)
	await API.writeStorage(storage)
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

const prepareSubscribeBtn = (btn, channelId, name) => {
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

const destroySubscribeBtn = btn => {
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
