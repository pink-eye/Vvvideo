import YoutubeHelper from 'Global/YoutubeHelper'
import { disableHistory } from 'Layouts/win-history/helper'

export const formatPort = str => str.replace(/[^0-9]/gim, '')

export const setTheme = themeOption => {
	if (themeOption === 'light') theme.setMode('light')
	if (themeOption === 'dark') theme.setMode('dark')
	if (themeOption === 'system') theme.setMode(theme.getSystemScheme())
}

export const toggleTransition = isDisabled => {
	if (isDisabled) {
		document.documentElement.style.setProperty('--trns-time-default', '0s')
		document.documentElement.style.setProperty('--trns-time-fast', '0')
		document.documentElement.style.setProperty('--trns-time-slow', '0')
		document.documentElement.style.setProperty('--trns-timing-func', 'unset')
	} else {
		document.documentElement.removeAttribute('style')
	}
}

export const applyUserPreferences = settings => {
	setTheme(settings.theme)

	if (settings.disableTransition) toggleTransition(settings.disableTransition)

	if (settings.disableHistory) disableHistory()
}

export const buildStorage = async data => {
	const CURRENT_VERSION = await API.getAppVersion()

	const newStorage = {
		appVersion: CURRENT_VERSION,
		subscriptions: [],
		history: [],
		settings: {},
		recentQueries: [],
	}

	if (data?.subscriptions) {
		const { subscriptions } = data

		if (subscriptions.length > 0) {
			const { channelId, name: author } = subscriptions[0]

			if (channelId && author) {
				newStorage.subscriptions = subscriptions
			} else {
				const yh = new YoutubeHelper()

				for (let index = 0, { length } = subscriptions; index < length; index += 1) {
					const subscription = subscriptions[index]
					const { url, name } = subscription

					newStorage.subscriptions.push({
						channelId: yh.getChannelId(url),
						name,
					})
				}
			}
		}
	}

	if (data?.history) {
		const { history } = data

		if (history.length > 0) newStorage.history = history
	}

	if (data?.recentQueries) {
		const { recentQueries } = data

		if (recentQueries.length > 0) newStorage.recentQueries = recentQueries
	}

	if (data?.settings) {
		Object.assign(newStorage.settings, data.settings)
	}

	return newStorage
}
