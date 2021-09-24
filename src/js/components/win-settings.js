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
	let settings = _io_q('.settings');

	let themeDropdown = settings.querySelector('.option__theme');
	let themeDropdownHead = themeDropdown.querySelector('.dropdown__head');

	themeDropdownHead.childNodes[0].data = storage.settings.theme === 'system'
		? 'System default'
		: storage.settings.theme === 'light'
			? 'Light'
			: 'Dark'

	setTheme(storage.settings.theme)

	if (storage.settings.disableTransition) {
		let checkboxDT = settings.querySelector('input#disableTransition')
		checkboxDT.checked = true
		toggleTransition(storage.settings.disableTransition)
		checkboxDT = null
	}

	if (storage.settings.disableSponsorblock) {
		let checkboxSB = settings.querySelector('input#disableSponsorblock')
		checkboxSB.checked = true
		toggleSponsorblock(storage.settings.disableSponsorblock)
		checkboxSB = null
	}

	if (storage.settings.enableProxy) {
		let checkboxEP = settings.querySelector('input#enableProxy')
		checkboxEP.checked = true
		checkboxEP = null
	}

	if (storage.settings.autoplay) {
		let checkboxA = settings.querySelector('input#autoplay')
		checkboxA.checked = true
		checkboxA = null
	}

	if (storage.settings.notAdaptContent) {
		let checkboxNAC = settings.querySelector('input#notAdaptContent')
		checkboxNAC.checked = true
		checkboxNAC = null
	}

	if (storage.settings.notifySkipSegment) {
		let checkboxNSS = settings.querySelector('input#notifySkipSegment')
		checkboxNSS.checked = true
		checkboxNSS = null
	}

	if (storage.settings.disableSearchSuggestions) {
		let checkboxDSS = settings.querySelector('input#disableSearchSuggestions')
		checkboxDSS.checked = true
		checkboxDSS = null
	}

	if (storage.settings.defaultQuality !== '1080p') {
		let qualityDropdown = settings.querySelector('.option__quality');
		let qualityDropdownHead = qualityDropdown.querySelector('.dropdown__head');

		qualityDropdownHead.childNodes[0].data = storage.settings.defaultQuality === 'highest'
			? 'Highest'
			: storage.settings.defaultQuality

		qualityDropdown = null
		qualityDropdownHead = null
	}

	if (storage.settings.proxy.protocol !== 'socks5' &&
		storage.settings.proxy.host !== '127.0.0.1' &&
		storage.settings.proxy.port !== 9050) {

		let protocolDropdown = settings.querySelector('.option__protocol');
		let protocolDropdownHead = protocolDropdown.querySelector('.dropdown__head');

		protocolDropdownHead.textContent = storage.settings.proxy.protocol

		let inputHost = settings.querySelector('input#host')
		let inputPort = settings.querySelector('input#port')

		inputHost.value = storage.settings.proxy.host
		inputPort.value = storage.settings.proxy.port

		protocolDropdown = null
		protocolDropdownHead = null
		inputHost = null
		inputPort = null
	}

	if (storage.settings.regionTrending !== 'US') {
		let inputRegionTrending = settings.querySelector('input#regionTrending')

		inputRegionTrending.value = storage.settings.regionTrending

		inputRegionTrending = null
	}


	themeDropdown = null
	themeDropdownHead = null
}
