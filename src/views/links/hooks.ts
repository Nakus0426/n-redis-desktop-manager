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
				let parent = splitKeys[index - 1]
				parent = parent === '' ? '[Empty]' : parent
				return { label, parent }
			})
		})
	)
	const uniqKeys = uniqWith(transformedKeys, (a, b) => a.label === b.label && a.parent === b.parent)
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
