import { flatMapDeep, uniqWith } from 'lodash-es'

/**
 * transform keys to tree
 */
export function useKeyTree(keys: string[], separator: string) {
	const splitKeys = flatMapDeep(
		keys.map(key => {
			const splitKey = key.split(separator)
			return splitKey.map((key, index) => ({ label: key, parent: splitKey[index - 1] }))
		})
	)
	const uniqKeys = uniqWith(splitKeys, (a, b) => a.label === b.label && a.parent === b.parent)
	const keysMap = new Map(uniqKeys.map(item => [item.label, { ...item, children: [] }]))
	const tree = []
	for (const item of keysMap.values()) {
		if (item.parent) {
			keysMap.get(item.parent).children.push(item)
		} else {
			tree.push(item)
		}
	}
	return tree
}
