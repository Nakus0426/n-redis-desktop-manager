<template>
	<div class="overview">
		<div class="header"></div>
		<h1>Overview</h1>
	</div>
</template>

<script setup lang="ts">
defineOptions({ name: 'Overview' })
</script>

<style scoped lang="scss">
.overview {
	display: flex;
	flex-direction: column;
	padding: var(--td-comp-paddingLR-m);
}
</style>
