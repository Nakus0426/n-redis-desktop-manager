import { type ObjectDirective } from 'vue'

type ForwardRefSetter = (el: any) => void

export const FORWARD_REF_INJECTION_KEY: InjectionKey<{ setForwardRef: ForwardRefSetter }> = Symbol('forwardRef')

export function useForwardRef<T>(forwardRef: Ref<T | null>) {
	function setForwardRef(el: T) {
		forwardRef.value = el
	}
	provide(FORWARD_REF_INJECTION_KEY, { setForwardRef })
}

export function useForwardRefDirective(setForwardRef: ForwardRefSetter): ObjectDirective {
	return {
		mounted(el) {
			setForwardRef(el)
		},
		updated(el) {
			setForwardRef(el)
		},
		unmounted() {
			setForwardRef(null)
		},
	}
}
