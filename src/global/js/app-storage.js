export class AppStorage {
	KEY_STORAGE = 'storage'

	setStorage(data) {
		const dataJSON = JSON.stringify(data)
		localStorage.setItem(this.KEY_STORAGE, dataJSON)
	}

	getStorage() {
		const dataJSON = localStorage.getItem(this.KEY_STORAGE)
		return JSON.parse(dataJSON)
	}

	async updateStorage(data) {
		this.setStorage(data)
		await API.writeStorage(data)
	}

	clearLocalStorage() {
		localStorage.removeItem(this.KEY_STORAGE)
	}
}
