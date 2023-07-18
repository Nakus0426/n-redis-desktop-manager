import ElectronStore from 'electron-store'
import Store from 'electron-store'

/**
 * storage util
 */
export class StorageUtil implements Storage {
	private readonly storage: ElectronStore

	constructor() {
		if (this.storage) return
		this.storage = new Store()
	}

	get length() {
		return this.storage.size
	}

	setItem(key: string, value: any) {
		this.storage.set(key, value)
	}

	getItem<T = any>(key: string, defaultValue?: T) {
		return this.storage.get(key, defaultValue) as T
	}

	removeItem(key: string) {
		this.storage.delete(key)
	}

	clear() {
		this.storage.clear()
	}

	key(index: number) {
		return Object.keys(this.storage.store)[index]
	}
}
