<template>
	<div class="layout">
		<Sider />
		<Content />
	</div>
</template>

<script setup lang="ts">
import Sider from './Sider.vue'
import Content from './Content.vue'

defineOptions({ name: 'Layout' })
</script>

<style scoped lang="scss">
.layout {
	width: 100%;
	height: 100%;
	display: flex;
	overflow: hidden;
}
</style>
