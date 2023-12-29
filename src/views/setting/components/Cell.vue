<template>
	<div class="cell">
		<div class="cell_title">{{ props.title }}</div>
		<div class="cell_content">
			<slot name="default" />
		</div>
	</div>
</template>

<script setup lang="ts">
const props = defineProps<{ title: string }>()
const slots = defineSlots<{ default(): any }>()
</script>

<style scoped lang="scss">
.cell {
	display: flex;
	flex-direction: column;

	&_title {
		position: sticky;
		top: 0;
		display: flex;
		align-items: center;
		font: var(--td-font-body-large);
		color: var(--td-text-color-primary);
		background-color: var(--td-bg-color-container-opacity);
		backdrop-filter: saturate(180%) blur(20px);
		padding: var(--td-comp-paddingTB-m);
		z-index: 3;

		&::after {
			content: '';
			position: absolute;
			bottom: 0;
			left: var(--td-comp-paddingLR-m);
			height: 1px;
			width: calc(100% - var(--td-comp-paddingLR-m) * 2);
			background-color: var(--td-component-stroke);
		}
	}

	&_content {
		display: flex;
		flex-direction: column;
		padding: var(--td-comp-paddingLR-m);
	}
}
</style>
