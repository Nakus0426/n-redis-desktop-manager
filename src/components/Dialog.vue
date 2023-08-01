<template>
	<TDialog v-bind="$props">
		<template #header>
			<div class="header">
				<Icon class="header_icon" height="24" width="24" :icon="icon" v-if="icon" />
				<div class="header_title">{{ title }}</div>
			</div>
		</template>
		<slot name="default" />
	</TDialog>
</template>

<script setup lang="ts">
const props = defineProps<{ title: string; icon?: string }>()
</script>

<style scoped lang="scss">
.header {
	display: flex;
	align-items: center;
	gap: var(--td-comp-margin-m);

	&_icon {
		color: var(--td-brand-color);
	}
}
</style>
