<template>
	<div class="container-with-sider" ref="containerRef">
		<div class="sider" :style="siderStyle">
			<slot name="sider" />
			<div class="sider-resize-bar" @mousedown="handleResize" />
		</div>
		<div class="body">
			<slot name="default" />
		</div>
	</div>
</template>

<script setup lang="ts">
defineOptions({ name: 'ContainerWithSider' })

const props = withDefaults(
	defineProps<{
		siderWidth?: number
	}>(),
	{
		siderWidth: 350,
	}
)

// sider width
const siderWidth = ref<number>()
watch(
	() => props.siderWidth,
	newValue => {
		siderWidth.value = newValue
	},
	{ immediate: true }
)

// handle resize
const containerRef = ref<HTMLElement>()
const siderStyle = computed(() => ({
	width: `${siderWidth.value}px`,
}))
function handleResize(e: MouseEvent) {
	const startX = e.clientX
	const startWidth = siderWidth.value
	document.onmousemove = e2 => {
		const moveX = e2.clientX - startX
		const endWidth = startWidth + moveX
		const minWidth = props.siderWidth
		const maxWidth = containerRef.value.clientWidth * 0.8
		if (endWidth <= minWidth) {
			siderWidth.value = minWidth
			return
		}
		if (endWidth >= maxWidth) {
			siderWidth.value = maxWidth
			return
		}
		siderWidth.value = endWidth
	}
	document.onmouseup = () => {
		document.onmousemove = null
		document.onmouseup = null
	}
}
</script>

<style scoped lang="scss">
.container-with-sider {
	width: 100%;
	height: 100%;
	display: flex;
}

.sider {
	position: relative;
	
	&-resize-bar {
		position: absolute;
		right: -2.5px;
		top: 0;
		bottom: 0;
		width: 5px;
		cursor: col-resize;
		z-index: 3;
		transition: all var(--td-transition);

		&:hover {
			background-color: var(--td-brand-color-hover);
		}

		&:active {
			background-color: var(--td-brand-color-active);
		}
	}
}

.body {
	flex: 1;
	overflow: hidden;
}
</style>
