export const checkForUpdate = async () => {
	const RELEASE_URL = 'https://api.github.com/repos/pink-eye/vvvideo/releases/latest'

	const dataJson = await fetch(RELEASE_URL)
	const data = await dataJson.json()

	const appVersion = await API.getAppVersion()

	return [data.tag_name, `v${appVersion}`, data]
}
