import { useLoading } from "@/hooks"
import { useEventBus } from "@vueuse/core"
import { MessagePlugin } from "tdesign-vue-next"
import { keyActivedEventKey, keyRemovedEventKey, keyRenamedEventKey } from "./keys"

/** transform keys to tree */
export function useKeyTree(keys: string[], separator: string) {
	const tree = []
	keys.forEach(key => {
		const splitKeys = key.split(separator)
		const splitKeysLength = splitKeys.length
		let node = tree
		splitKeys.forEach((key2, index2) => {
			key2 = key2 === '' ? '[Empty]' : key2
			if (!node.find(item => item.label === key2)) node.push({ label: key2, children: [], isLeaf: false, value: null })
			const foundNode = node.find(item => item.label === key2)
			if (index2 === splitKeysLength - 1) {
				foundNode.isLeaf = true
				foundNode.value = key
			}
			node = foundNode.children
		})
	})
	return tree
}

/** rename key */
export function useKeyRename(id: string) {
	const { isLoading, enter, exit } = useLoading()

	async function execute(originalKey: string, modifiedKey: string) {
		try {
			enter()
			await window.mainWindow.redis.rename(id, originalKey, modifiedKey)
			useEventBus(keyRenamedEventKey).emit(modifiedKey)
			useEventBus(keyActivedEventKey).emit({ key: modifiedKey, id })
			useEventBus(keyRemovedEventKey).emit(originalKey)
			MessagePlugin.success('保存成功')
		} catch (e) {
			MessagePlugin.error(e.message)
			throw e
		} finally {
			exit()
		}
	}

	return { isLoading, execute }
}

/** update ttl */
export function useTTLUpdate(id: string) {
	const { isLoading, enter, exit } = useLoading()

	async function execute(key: string, value: number) {
		try {
			enter()
			await window.mainWindow.redis.expire(id, key, value)
			MessagePlugin.success('保存成功')
		} catch (e) {
			MessagePlugin.error(e.message)
			throw e
		} finally {
			exit()
		}
	}

	return { isLoading, execute }
}

/** delete key */
export function useKeyDelete(id: string) {
	const { isLoading, enter, exit } = useLoading()

	async function execute(key: string) {
		try {
			enter()
			await window.mainWindow.redis.del(id, key)
			useEventBus(keyRemovedEventKey).emit(key)
			MessagePlugin.success('删除成功')
		} catch (e) {
			MessagePlugin.error(e.message)
		} finally {
			exit()
		}
	}

	return { isLoading, execute }
}

/** rename hash field name */
export function useHashFieldNameRename(id: string) {
	const { isLoading, enter, exit } = useLoading()

	async function execute(key: string, originalName: string, modifiedName: string, value: string | number) {
		try {
			enter()
			await window.mainWindow.redis.hset(id, key, modifiedName, value)
			await window.mainWindow.redis.hdel(id, key, originalName)
		} catch (e) {
			MessagePlugin.error(e.message)
			throw e
		} finally {
			exit()
		}
	}

	return { isLoading, execute }
}
