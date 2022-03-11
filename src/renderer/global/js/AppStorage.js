export default class AppStorage {
	KEY_STORAGE = 'storage'

	set(data) {
		const dataJSON = JSON.stringify(data)
		localStorage.setItem(this.KEY_STORAGE, dataJSON)
	}

	get() {
		const storageFromLS = this.#getFromLocalStorage()

		if (storageFromLS && 'subscriptions' in storageFromLS) return storageFromLS

		return this.getFromFile()
	}

	#getFromLocalStorage() {
		const dataJSON = localStorage.getItem(this.KEY_STORAGE)
		return JSON.parse(dataJSON)
	}

	async getFromFile() {
		const storageJSON = await API.readStorage()

		if (!storageJSON) return

		const storage = JSON.parse(storageJSON)

		this.set(storage)

		return storage
	}

	update(data, options = null) {
		this.set(data)

		if (!options) return
		!options.isLocal && API.writeStorage(data)
	}

	clearLocalStorage() {
		localStorage.clear()
	}
}
