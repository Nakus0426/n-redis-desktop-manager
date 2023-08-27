import { flatMapDeep, uniqWith } from 'lodash-es'

/**
 * transform keys to tree
 */
export function useKeyTree(keys: string[], separator: string) {
	const transformedKeys = flatMapDeep(
		keys.map(key => {
			const splitKeys = key.split(separator)
			return splitKeys.map((splitKey, index) => {
				const label = splitKey === '' ? '[Empty]' : splitKey
				const isLeaf = index === splitKeys.length - 1
				const value = isLeaf ? key : splitKeys.slice(0, index + 1).join(separator)
				const parent = index === 0 ? undefined : splitKeys.slice(0, index).join(separator)
				return { label, parent, isLeaf, value }
			})
		})
	)
	const uniqKeys = uniqWith(
		transformedKeys,
		(a, b) => a.label === b.label && a.parent === undefined && b.parent === undefined && a.value === b.value
	)
	const keysMap = new Map(uniqKeys.map(item => [item.value, { ...item, children: [] }]))
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
