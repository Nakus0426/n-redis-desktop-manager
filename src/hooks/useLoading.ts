/**
 * loading state with delay
 * @param delay delay duration, default to 300ms
 */
export function useLoading(delay = 200) {
	const loading = ref(false)
	const delayLoading = ref(false)

	function countDelay() {
		delayLoading.value = false
		const timer = setTimeout(() => {
			delayLoading.value = true
			clearTimeout(timer)
		}, delay)
	}

	/** enter loading state */
	function enter() {
		loading.value = true
	}

	/** exit loading state */
	function exit() {
		loading.value = false
	}

	watch(loading, value => value && countDelay())

	/** is it currently in a loading state */
	const isLoading = computed(() => loading.value && delayLoading.value)

	return { isLoading, enter, exit }
}
