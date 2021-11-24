import { isEmpty } from '../global'

export class AppStorage {
	KEY_STORAGE = 'storage'

	setStorage(data) {
		if (isEmpty(data)) return

		const dataJSON = JSON.stringify(data)
		localStorage.setItem(this.KEY_STORAGE, dataJSON)
	}

	getStorage() {
		const dataJSON = localStorage.getItem(this.KEY_STORAGE)
		return JSON.parse(dataJSON)
	}

	async updateStorage(data) {
		await API.writeStorage(data)
		this.setStorage(data)
	}
}
