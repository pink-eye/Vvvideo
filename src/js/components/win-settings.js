const openWinSettings = _ => {
	const settings = _io_q('.settings');

	// IMPLEMENT IMPORT

	const impExpBtn = settings.querySelector('.imp-exp__btn.btn-accent')
	const impExpField = settings.querySelector('.imp-exp__field')

	impExpField.addEventListener('change', handleFile);

	impExpBtn.addEventListener('click', handleClickImport);

	// CHECKBOXES

	const checkboxAll = settings.querySelectorAll('input[type="checkbox"]');

	for (let index = 0, length = checkboxAll.length; index < length; index++) {
		const checkbox = checkboxAll[index];

		checkbox.addEventListener('change', handleChangeCheckbox);
	}

	// INPUTS

	const inputAll = settings.querySelectorAll('input[type="text"]');

	for (let index = 0, length = inputAll.length; index < length; index++) {
		const input = inputAll[index];

		input.addEventListener('input', handleInputField);
	}
}

const resetWinSettings = _ => {
	let settings = _io_q('.settings');

	// RESET IMPORT

	let impExpBtn = settings.querySelector('.imp-exp__btn.btn-accent')
	let impExpField = settings.querySelector('.imp-exp__field')

	impExpField.removeEventListener('change', handleFile);
	impExpBtn.removeEventListener('click', handleClickImport);

	// RESET CHECKBOXES

	let checkboxAll = settings.querySelectorAll('input[type="checkbox"]');

	for (let index = 0, length = checkboxAll.length; index < length; index++) {
		const checkbox = checkboxAll[index];

		checkbox.removeEventListener('change', handleChangeCheckbox);
	}

	// RESET INPUTS

	let inputAll = settings.querySelectorAll('input[type="text"]');

	for (let index = 0, length = inputAll.length; index < length; index++) {
		const input = inputAll[index];

		input.removeEventListener('input', handleInputField);
	}

	settings = null
	checkboxAll = null
	inputAll = null
	impExpBtn = null
	impExpField = null
}

const makeResultImport = (classResult, tip) => {
	let settings = _io_q('.settings');
	let impExpBody = settings.querySelector('.imp-exp')
	let impExpTip = settings.querySelector('.imp-exp__tip')

	if (!impExpBody.classList.contains(classResult)) {
		impExpBody.classList.add(classResult);
		impExpTip.textContent = tip
	}

	settings = null
	impExpBody = null
	impExpTip = null
}

const readInputFile = _ => {
	const validTip = "Succesfully! Wait for refresh..."
	const failTip = "Fail... :("

	let settings = _io_q('.settings');
	let impExpField = settings.querySelector('.imp-exp__field')

	let reader = new FileReader();
	reader.readAsText(impExpField.files[0]);

	const onLoadReader = async _ => {
		let data = JSON.parse(reader.result)

		if (!data.hasOwnProperty('subscriptions'))
			makeResultImport('_invalid', failTip);
		else {
			buildStorage(data)
			await API.writeStorage(storage);
			makeResultImport('_valid', validTip);
			reloadApp()
		}
	}

	reader.addEventListener('load', onLoadReader, { once: true });

	settings = null
	impExpField = null
}

const handleClickImport = _ => {
	const invalidTip = "I've not found a JSON file.\n Ensure you interacted this area"
	let settings = _io_q('.settings');
	let impExpField = settings.querySelector('.imp-exp__field')

	impExpField.value === '' || (/\.(json)$/i).test(impExpField.files[0].name) === false
		? makeResultImport('_invalid', invalidTip)
		: readInputFile()

	settings = null
	impExpField = null
}

const handleFile = _ => {
	let settings = _io_q('.settings');
	let impExpBody = settings.querySelector('.imp-exp')
	let impExpTip = settings.querySelector('.imp-exp__tip')
	let impExpField = settings.querySelector('.imp-exp__field')

	impExpBody.classList.remove('_valid')
	impExpBody.classList.remove('_invalid')
	impExpTip.textContent = `I've got a '${impExpField.files[0].name}'. You can press 'Import' now`

	settings = null
	impExpBody = null
	impExpTip = null
	impExpField = null
}

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

		if (data.subscriptions.length > 0) {

			if (data.subscriptions[0].hasOwnProperty('channelId') &&
				data.subscriptions[0].hasOwnProperty('name')) {
				storage.subscriptions.push(...data.subscriptions)
			} else {
				for (let index = 0, length = data.subscriptions.length; index < length; index++) {
					const subscription = data.subscriptions[index];

					storage.subscriptions.push({
						channelId: getChannelIdOrUser(subscription.url),
						name: subscription.name
					})
				}
			}
		}
	}

	if (data.hasOwnProperty('history')) {

		if (data.history.length > 0) {
			storage.history.push(...data.history)
			keepHistoryArray()
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

	if (ss.disableHistory)
		disableHistory()

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

const handleInputField = event => {
	let input = event.currentTarget
	let option = input.id

	switch (option) {
		case 'host':
			input.value = formatIP(input.value)
			storage.settings.proxy.host = isEmpty(input.value) ? '127.0.0.1' : input.value
			break;

		case 'port':
			input.value = formatPort(input.value)
			storage.settings.proxy.port = isEmpty(input.value) ? 9050 : +input.value
			break;

		case 'regionTrending':
			storage.settings.regionTrending = isEmpty(input.value) ? 'US' : input.value
			break;

		case 'maxHistoryLength':
			storage.settings.maxHistoryLength = isEmpty(input.value) ? 30 : +input.value
			break;

	}
	API.writeStorage(storage)
}

const handleChangeCheckbox = event => {
	let checkbox = event.currentTarget
	let option = checkbox.id

	storage.settings[`${option}`] = checkbox.checked

	switch (option) {
		case 'disableTransition':
			toggleTransition(checkbox.checked)
			break;

		case 'enableProxy':
			checkbox.checked
				? showToast('info', 'Restart app after the fields is filled in')
				: showToast('good', 'Restart app')
			break;

		case 'disableSponsorblock':
			toggleSponsorblock(checkbox.checked)
			break;

		case 'notAdaptContent':
			if (checkbox.checked)
				_io_q('.main__content').style.setProperty('--margin', '0')
			break;

		case 'disableSearchSuggestions':
		case 'disableStoryboard':
		case 'disableHistory':
			showToast('good', 'Refresh app')
			break;
	}

	API.writeStorage(storage)
}
