/**
 * loading state with delay
 * @param delay delay duration, default to 300ms
 */
export function useLoading(delay = 300) {
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

	watch(loading, value => {
		if (value) countDelay()
	})

	/** is it currently in a loading state */
	const isLoading = computed(() => loading.value && delayLoading.value)

	return { isLoading, enter, exit }
}
