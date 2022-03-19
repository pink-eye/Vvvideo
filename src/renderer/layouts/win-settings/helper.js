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


