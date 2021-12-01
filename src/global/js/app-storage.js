export class AppStorage {
	KEY_STORAGE = 'storage'

	setStorage(data) {
		const dataJSON = JSON.stringify(data)
		sessionStorage.setItem(this.KEY_STORAGE, dataJSON)
	}

	getStorage() {
		const dataJSON = sessionStorage.getItem(this.KEY_STORAGE)
		return JSON.parse(dataJSON)
	}

	async updateStorage(data) {
		await API.writeStorage(data)
		this.setStorage(data)
	}

	clearLocalStorage() {
		sessionStorage.removeItem(this.KEY_STORAGE)
	}
}
