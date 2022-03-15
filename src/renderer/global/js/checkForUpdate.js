const checkForUpdate = () => {
	return new Promise((resolve, reject) => {
		const RELEASE_URL = 'https://api.github.com/repos/pink-eye/vvvideo/releases/latest'

		fetch(RELEASE_URL)
			.then(res => res.json())
			.then(async data => {
				const LATEST_VERSION = data.tag_name
				const CURRENT_VERSION = await API.getAppVersion()

				resolve([LATEST_VERSION, `v${CURRENT_VERSION}`, data])
			})
			.catch(() => reject('Error was occurred after update checking...'))
	})
}

export default checkForUpdate
