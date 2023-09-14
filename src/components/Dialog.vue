<template>
	<TDialog v-bind="$props" title="" destroy-on-close>
		<template #header>
			<div class="header">
				<Icon class="header_icon" height="24" width="24" :icon="icon" v-if="icon" />
				<div class="header_title">{{ title }}</div>
			</div>
		</template>
		<slot name="default" />
		<template #footer>
			<slot name="footer" />
		</template>
	</TDialog>
</template>

<script setup lang="ts">
defineOptions({ name: 'Dialog' })
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
