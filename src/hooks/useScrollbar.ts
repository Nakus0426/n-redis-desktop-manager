import { useOverlayScrollbars } from 'overlayscrollbars-vue'
import { type Ref } from 'vue'

/**
 * overlay scrollbar
 * @param target scroll element
 */
export function useScrollbar(target: Ref<HTMLElement>) {
	const [initScrollbar, instance] = useOverlayScrollbars({
		options: { scrollbars: { autoHide: 'leave', clickScroll: true } },
		defer: true,
	})

	function init() {
		const scrollbarInstance = instance()
		if(scrollbarInstance) scrollbarInstance.destroy()
		initScrollbar({ target: target.value, elements: { viewport: target.value } })
	}

	return { init, instance }
}
