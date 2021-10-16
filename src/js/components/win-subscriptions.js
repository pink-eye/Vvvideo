let isUpdated = false;

const showSubscriptions = async _ => {
	let promises = [];
	let channelInfoArray = null;
	let subscriptions = _io_q('.subscriptions');
	let authorCardAll = subscriptions.querySelectorAll('.author');
	let btnSubscriptions = document.querySelector('button[data-win="subscriptions"]');

	storage.subscriptions.length > authorCardAll.length
		? initPages(subscriptions, storage.subscriptions, authorCardAll, 'author')
		: disablePages(subscriptions)

	for (let index = 0, length = authorCardAll.length; index < length; index++) {
		let authorCard = authorCardAll[index];

		storage.subscriptions[index]
			? fillAuthorCard(authorCard, index, storage.subscriptions)
			: authorCard.hidden = true;
	}

	if (!isUpdated) {
		try {
			for (let index = 0, length = storage.subscriptions.length; index < length; index++) {
				const subscription = storage.subscriptions[index];

				if (btnSubscriptions.classList.contains('_active'))
					promises.push(getChannelInfoLocalScraper(subscription.channelId))
				else return
			}

			channelInfoArray = [].concat.apply([], await Promise.all(promises));

			resetIndicator()

			for (let index = 0, length = storage.subscriptions.length; index < length; index++) {
				const subscription = storage.subscriptions[index];
				const channelInfo = channelInfoArray[index];

				if (btnSubscriptions.classList.contains('_active')) {
					if (subscription.hasOwnProperty('avatar')) {
						if (subscription.avatar !== channelInfo.authorThumbnails.at(-1).url)
							subscription.avatar = channelInfo.authorThumbnails.at(-1).url
					} else
						subscription.avatar = channelInfo.authorThumbnails.at(-1).url

					if (subscription.hasOwnProperty('name')) {
						if (subscription.name !== channelInfo.author)
							subscription.name = channelInfo.author
					} else
						subscription.name = channelInfo.author

				} else return
			}

			API.writeStorage(storage)

			isUpdated = true

		} catch (error) {
			showToast('error', error.message);
			resetIndicator()
		} finally {
			subscriptions = null
			authorCardAll = null
			btnSubscriptions = null
		}
	}
}

const hasSubscription = channelId => {
	let hasSubscription = false

	if (storage.subscriptions.length > 0) {
		for (let index = 0, length = storage.subscriptions.length; index < length; index++) {
			const subscription = storage.subscriptions[index];

			if (subscription.channelId === channelId) {
				hasSubscription = true
				break
			}
		}
	}

	return hasSubscription
}

const addSubscription = async obj => {
	storage.subscriptions.push(obj)
	await API.writeStorage(storage);
}

const removeSubscription = async obj => {
	storage.subscriptions = storage.subscriptions.filter(item =>
		item.channelId !== obj.channelId
		&& item.name !== obj.name)
	await API.writeStorage(storage);
}

const onClickSubscribe = (btn, btnText) => {

	if (btn.dataset.channelId && btn.dataset.name) {

		btn.disabled = true
		btn.classList.add('_subscribed')
		btnText.style.opacity = '0'

		const onChangeState = _ => {
			btnText.textContent = 'Unsubscribe'
			btnText.removeAttribute('style')

			btn.disabled = false
		}

		setTimeout(onChangeState, getDurationTimeout())

		addSubscription(JSON.parse(`{
			"channelId": "${btn.dataset.channelId}",
			"name": "${btn.dataset.name}"
		}`))
	}
}

const onClickUnsubscribe = (btn, btnText) => {

	if (btn.dataset.channelId && btn.dataset.name) {

		btn.disabled = true
		btn.classList.remove('_subscribed')
		btnText.style.opacity = '0'

		const onChangeState = _ => {
			btnText.textContent = 'Subscribe'
			btnText.removeAttribute('style')

			btn.disabled = false
		}

		setTimeout(onChangeState, getDurationTimeout())

		removeSubscription(JSON.parse(`{
			"channelId": "${btn.dataset.channelId}",
			"name": "${btn.dataset.name}"
		}`))
	}
}
