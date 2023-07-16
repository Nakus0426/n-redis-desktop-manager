<template>
	<div class="sub-menu" :style="subMenuStyle">
		<div class="resize-bar" @mousedown="handleResize" />
	</div>
</template>

<script setup lang="ts">
const subMenuStyle = computed(() => ({
	width: `${subMenuWidth.value}px`,
}))

// handle resize
const subMenuWidth = ref(200)
function handleResize(e: MouseEvent) {
	const startX = e.clientX
	const startWidth = subMenuWidth.value
	document.onmousemove = e2 => {
		const moveX = e2.clientX - startX
		const endWidth = startWidth + moveX
		if (endWidth <= 200) {
			subMenuWidth.value = 200
			return
		}
		subMenuWidth.value = endWidth
	}
	document.onmouseup = () => {
		document.onmousemove = null
		document.onmouseup = null
	}
}
</script>

<style scoped lang="scss">
.sub-menu {
	position: relative;
	border-right: 1px solid var(--td-component-stroke);
}

.resize-bar {
	position: absolute;
	right: -2.5px;
	top: 0;
	bottom: 0;
	width: 5px;
	cursor: e-resize;
}
</style>
