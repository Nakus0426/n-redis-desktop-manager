<template>
	<div class="layout">
		<Menu />
		<SubMenu />
		<Content />
	</div>
</template>

<script setup lang="ts">
import Menu from './Menu.vue'
import SubMenu from './SubMenu.vue'
import Content from './Content.vue'
</script>

<style scoped lang="scss">
.layout {
	width: 100%;
	height: 100%;
	display: flex;
}
</style>
