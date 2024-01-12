<template>
	<div ref="containerRef">
		<slot name="default" />
	</div>
</template>

<script setup lang="ts">
import { useOverlayScrollbars } from 'overlayscrollbars-vue'

const containerRef = ref<HTMLElement>()
const [init, instance] = useOverlayScrollbars({
	options: { scrollbars: { autoHide: 'leave', clickScroll: true }, overflow: { x: 'hidden' } },
	defer: true,
})

onMounted(() => init({ target: containerRef.value, elements: { viewport: containerRef.value } }))
</script>

<style scoped lang="scss"></style>
