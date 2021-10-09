const setTheme = themeOption => {
	if (themeOption === 'light') theme.setMode('light');
	if (themeOption === 'dark') theme.setMode('dark');
	if (themeOption === 'system') theme.setMode(theme.getSystemScheme());
}

const toggleTransition = isDisabled => {
	let modalContainer = document.querySelector('.modal__container')

	if (isDisabled) {
		document.documentElement.style.setProperty('--trns-time-default', '0');
		document.documentElement.style.setProperty('--trns-time-fast', '0');
		document.documentElement.style.setProperty('--trns-time-slow', '0');
		modalContainer.dataset.graphSpeed = 0
	} else {
		document.documentElement.style.setProperty('--trns-time-default', '.3s');
		document.documentElement.style.setProperty('--trns-time-fast', '.1s');
		document.documentElement.style.setProperty('--trns-time-slow', '1s');
		modalContainer.dataset.graphSpeed = 300
	}

	modalContainer = null
}

const buildStorage = data => {

	if (data.hasOwnProperty('subscriptions')) {
		storage.subscriptions = []

		for (let index = 0, length = data.subscriptions.length; index < length; index++) {
			const subscription = data.subscriptions[index];

			storage.subscriptions.push({
				channelId: getChannelIdOrUser(subscription.url),
				name: subscription.name
			})
		}
	}

	if (data.hasOwnProperty('settings')) {
		storage.settings = {}
		Object.assign(storage.settings, data.settings)
	}
}

const fillWinSettings = async _ => {
	let ss = storage.settings
	let settings = _io_q('.settings');

	let themeDropdown = settings.querySelector('.option__theme');
	let themeDropdownHead = themeDropdown.querySelector('.dropdown__head');

	themeDropdownHead.childNodes[0].data = ss.theme === 'system'
		? 'System default'
		: ss.theme === 'light'
			? 'Light'
			: 'Dark'

	setTheme(ss.theme)

	for (let key in ss) {
		let checkbox = settings.querySelector(`input#${key}`);

		if (checkbox)
			checkbox.checked = ss[`${key}`];

		checkbox = null;
	}

	if (ss.disableTransition)
		toggleTransition(ss.disableTransition)


	if (ss.disableSponsorblock)
		toggleSponsorblock(ss.disableSponsorblock)


	if (ss.defaultQuality !== '1080p') {
		let qualityDropdown = settings.querySelector('.option__quality');
		let qualityDropdownHead = qualityDropdown.querySelector('.dropdown__head');

		qualityDropdownHead.childNodes[0].data = ss.defaultQuality === 'highest'
			? 'Highest'
			: ss.defaultQuality

		qualityDropdown = null
		qualityDropdownHead = null
	}

	if (ss.defaltVideoFormat !== 'mp4') {
		let formatDropdown = settings.querySelector('.option__format');
		let formatDropdownHead = formatDropdown.querySelector('.dropdown__head');

		formatDropdownHead.childNodes[0].data = ss.defaltVideoFormat

		formatDropdown = null
		formatDropdownHead = null
	}

	if (ss.proxy.protocol !== 'socks5' &&
		ss.proxy.host !== '127.0.0.1' &&
		ss.proxy.port !== 9050) {

		let protocolDropdown = settings.querySelector('.option__protocol');
		let protocolDropdownHead = protocolDropdown.querySelector('.dropdown__head');

		protocolDropdownHead.textContent = ss.proxy.protocol

		let inputHost = settings.querySelector('input#host')
		let inputPort = settings.querySelector('input#port')

		inputHost.value = ss.proxy.host
		inputPort.value = ss.proxy.port

		protocolDropdown = null
		protocolDropdownHead = null
		inputHost = null
		inputPort = null
	}

	if (ss.regionTrending !== 'US') {
		let inputRegionTrending = settings.querySelector('input#regionTrending')

		inputRegionTrending.value = ss.regionTrending

		inputRegionTrending = null
	}


	themeDropdown = null
	themeDropdownHead = null
}
