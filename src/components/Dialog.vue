<template>
	<TDialog v-bind="$props" title="" destroy-on-close placement="center" @opened="handleDialogOpened()">
		<template #header>
			<div class="header">
				<Icon class="header_icon" height="24" width="24" :icon="icon" v-if="icon" />
				<div class="header_title">{{ title }}</div>
			</div>
		</template>
		<div class="scroll-wrapper" ref="scrollWrapperRef">
			<slot name="default" />
		</div>
		<template v-if="$slots?.footer" #footer>
			<slot name="footer" />
		</template>
	</TDialog>
</template>

<script setup lang="ts">
import { useScrollbar } from '@/hooks'
defineOptions({ name: 'Dialog' })

const props = defineProps<{ title: string; icon?: string }>()
const emit = defineEmits<{ opened: [] }>()

// scrollbar
const scrollWrapperRef = ref()
const { init: initScrollbar } = useScrollbar(scrollWrapperRef)

// dialog opened
function handleDialogOpened() {
	nextTick(() => initScrollbar())
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
