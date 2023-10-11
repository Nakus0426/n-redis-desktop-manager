/**
 * transform keys to tree
 */
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
