<template>
	<div class="cell-item">
		<div class="cell-item_label">
			<div class="cell-item_label_title">
				<slot name="label" />
				{{ slots?.label ? null : props?.label }}
			</div>
			<div class="cell-item_label_desc">
				<slot name="desc" />
				{{ slots?.desc ? null : props?.desc }}
			</div>
		</div>
		<div class="cell-item_value">
			<slot name="default" />
		</div>
	</div>
</template>

<script setup lang="ts">
const props = defineProps<{ label?: string; desc?: string }>()
const slots = defineSlots<{ default(): any; desc(): any; label(): any }>()
</script>

<style scoped lang="scss">
.cell-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: var(--td-comp-margin-m) 0;

	&:first-child {
		padding-top: 0;
	}

	&:last-child {
		padding-bottom: 0;
	}

	&:not(:first-child) {
		border-top: 1px solid var(--td-component-stroke);
	}

	&_label {
		&_title {
			font: var(--td-font-body-medium);
			color: var(--td-text-color-primary);
		}

		&_desc {
			font: var(--td-font-body-small);
			color: var(--td-text-color-secondary);
		}
	}
}
</style>
