/**
 * storage util
 */
export class StorageUtil implements Storage {
	constructor() {}

	get length() {
		return window.mainWindow.store.size()
	}

	setItem(key: string, value: any) {
		window.mainWindow.store.set(key, value)
	}

	getItem<T = any>(key: string, defaultValue?: T) {
		return window.mainWindow.store.get<T>(key, defaultValue)
	}

	removeItem(key: string) {
		window.mainWindow.store.remove(key)
	}

	clear() {
		window.mainWindow.store.clear()
	}

	key(index: number) {
		return window.mainWindow.store.key(index)
	}
}
