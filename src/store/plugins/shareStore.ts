import { PiniaPluginContext } from 'pinia'
import { nanoid } from 'nanoid'

declare module 'pinia' {
	export interface PiniaCustomProperties {
		storeVersion: string
	}
	export interface DefineStoreOptionsBase<S, Store> {
		persist?: boolean
	}
}

/** store cache prefix */
const STORE_CACHE_KEY_PREFIX = 'STORE_'

/** store version cache prefix */
const STORE_CACHE_VERSION_KEY_PREFIX = STORE_CACHE_KEY_PREFIX + 'VERSION_'

let isResetVersion = false
let canUpdate = true

/** get store version */
function getStoreVersion(key: string) {
	let currentStoreVersion = localStorage.getItem(key)
	if (!currentStoreVersion) {
		currentStoreVersion = nanoid()
		localStorage.setItem(key, currentStoreVersion)
	}
	return currentStoreVersion
}

/** share store plugin */
export function shareStorePlugin({ store, options }: PiniaPluginContext) {
	if (!options?.persist) return
	const storeName = store.$id
	const storeVersionKey = STORE_CACHE_VERSION_KEY_PREFIX + storeName
	let currentStoreVersion = getStoreVersion(storeVersionKey)
	store.storeVersion = currentStoreVersion

	initStore(store)

	store.$subscribe(() => {
		currentStoreVersion = localStorage.getItem(storeVersionKey)
		if (!currentStoreVersion) {
			currentStoreVersion = nanoid()
			store.storeVersion = currentStoreVersion
			updateStoreStateSync(JSON.stringify(store.$state), storeName, store.storeVersion, true)
			return
		}
		if (store.storeVersion === currentStoreVersion) {
			if (!canUpdate) {
				canUpdate = true
				return
			}
			if (isResetVersion) {
				store.storeVersion = currentStoreVersion
				isResetVersion = false
			} else {
				store.storeVersion = nanoid()
				updateStoreStateSync(JSON.stringify(store.$state), storeName, store.storeVersion, false)
			}
		} else {
			store.storeVersion = currentStoreVersion
			canUpdate = true
		}
	})

	window.mainWindow.pinia.onChange((name: string, state: string, isReset: boolean, version: string) => {
		if (storeName !== name) return
		isResetVersion = isReset
		setCachedStoreVersion(storeName, version)
		const obj = JSON.parse(state)
		const keys = Object.keys(obj)
		const values = Object.values(obj)
		canUpdate = false
		for (let i = 0; i < keys.length; i++) {
			changeStoreState(store.$state, keys[i], values[i])
		}
	})
}

/** init store */
function initStore(store: any) {
	const storeCacheKey = STORE_CACHE_KEY_PREFIX + store.$id
	const cacheStoreStateStr = localStorage.getItem(storeCacheKey)
	if (cacheStoreStateStr) {
		const cacheStoreState = JSON.parse(cacheStoreStateStr)
		const keys = Object.keys(cacheStoreState)
		const values = Object.values(cacheStoreState)
		for (let i = 0; i < keys.length; i++) {
			changeStoreState(store.$state, keys[i], values[i])
		}
	}
}

/** change store state */
function changeStoreState(state: any, key: string, value: any) {
	if (key in state) {
		state[key] = value
	}
}

/** update store state sync */
function updateStoreStateSync(storeStateStr: string, storeName: string, storeVersion: string, isResetVersion: boolean) {
	setCachedStoreVersion(storeName, storeVersion)
	window.mainWindow.pinia.change(storeName, storeStateStr, isResetVersion, storeVersion)
	localStorage.setItem(STORE_CACHE_KEY_PREFIX + storeName, storeStateStr)
}

/** set cached store version */
function setCachedStoreVersion(storeName: string, storeUpdateVersion: string) {
	const storeCacheVersionKey = STORE_CACHE_VERSION_KEY_PREFIX + storeName
	localStorage.setItem(storeCacheVersionKey, storeUpdateVersion)
}
