<template>
	<TDialog v-bind="$props" title="" destroy-on-close placement="center" @opened="handleDialogOpened()">
		<template #header>
			<div class="header">
				<Icon class="header_icon" height="24" width="24" :icon="props.icon" v-if="props.icon" />
				<div class="header_title">{{ props.title }}</div>
			</div>
		</template>
		<OverlayScrollbar class="scroll-wrapper">
			<slot name="default" />
		</OverlayScrollbar>
		<template v-if="slots?.footer" #footer>
			<slot name="footer" />
		</template>
	</TDialog>
</template>

<script setup lang="ts">
const slots = defineSlots<{ footer(): any; default(): any }>()
const props = defineProps<{ title: string; icon?: string }>()
const emit = defineEmits<{ opened: [] }>()

// dialog opened
function handleDialogOpened() {
	emit('opened')
}
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

.scroll-wrapper {
	position: relative;
	flex: 1;
}
</style>
