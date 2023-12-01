<template>
	<div class="text-ellipsis" ref="containerRef" :title="title">
		<span class="text-ellipsis_content" ref="contentRef">{{ content }}</span>
	</div>
</template>

<script setup lang="ts">
import { useMouseInElement } from '@vueuse/core'

const props = defineProps<{ content?: string | number }>()

// calculate whether text overflows
const containerRef = ref<HTMLElement>()
const contentRef = ref<HTMLElement>()
const isOverflow = ref(false)
const { isOutside } = useMouseInElement(containerRef, { handleOutside: false })
watch(
	isOutside,
	value => {
		if (value) return
		isOverflow.value = containerRef.value.clientWidth < contentRef.value.offsetWidth
	},
	{ immediate: true }
)

// title
const title = computed(() => (isOverflow.value ? String(props.content) : null))
</script>

<style scoped lang="scss">
.text-ellipsis {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
</style>
