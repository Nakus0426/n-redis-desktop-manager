import { type Ref, type VNode, withDirectives, cloneVNode, Fragment } from 'vue'
import { NOOP } from '@vue/shared'
import { FORWARD_REF_INJECTION_KEY, useForwardRefDirective } from '@/hooks/useForwardRef'
import { isObject } from 'lodash-es'

export const OnlyChild = defineComponent({
	name: 'OnlyChild',
	setup(_, { slots, attrs }) {
		const forwardRefInjection = inject(FORWARD_REF_INJECTION_KEY)
		const forwardRefDirective = useForwardRefDirective(forwardRefInjection?.setForwardRef ?? NOOP)
		return () => {
			const defaultSlot = slots.default?.(attrs)
			if (!defaultSlot || defaultSlot.length > 1) return null
			const firstLegitNode = findFirstLegitChild(defaultSlot)
			if (!firstLegitNode) return null
			return withDirectives(cloneVNode(firstLegitNode!, attrs), [[forwardRefDirective]])
		}
	},
})

function findFirstLegitChild(node: VNode[] | undefined): VNode | null {
	if (!node) return null
	const children = node as VNode[]
	for (const child of children) {
		if (isObject(child)) {
			switch (child.type) {
				case Comment:
					continue
				case Text:
				case 'svg':
					return wrapTextContent(child)
				case Fragment:
					return findFirstLegitChild(child.children as VNode[])
				default:
					return child
			}
		}
		return wrapTextContent(child)
	}
	return null
}

function wrapTextContent(s: string | VNode) {
	return <span class="only-child_content">{s}</span>
}

export type OnlyChildExpose = {
	forwardRef: Ref<HTMLElement>
}
