<template>
	<div class="back-top" :class="[size, visibleClass]" :style="style" v-ripple @click="handleBackTopClick()">
		<Icon :height="iconSize" :width="iconSize" icon="fluent:arrow-up-20-regular" />
	</div>
</template>

<script setup lang="ts">
import { type SizeEnum } from 'tdesign-vue-next'
import { useParentElement, useEventListener } from '@vueuse/core'

defineOptions({ name: 'BackTop' })

const props = withDefaults(defineProps<{ size?: SizeEnum; visibleHeight?: number; offset?: SizeEnum }>(), {
	size: 'medium',
	visibleHeight: 300,
	offset: 'medium',
})

const offsetMap = { small: 8, medium: 12, large: 16 }
const style = computed(() => {
	const offset = offsetMap[props.offset]
	return { bottom: `${offset}px`, right: `${offset}px` }
})

const size = computed(() => `back-top-${props.size}`)
const iconSizeMap = { small: 16, medium: 24, large: 32 }
const iconSize = computed(() => iconSizeMap[props.size])

const visible = ref(false)
const visibleClass = computed(() => (visible.value ? 'is-visible' : ''))
const parentElement = useParentElement()
onMounted(() =>
	useEventListener(parentElement, 'scroll', e => {
		visible.value = e.target['scrollTop'] >= props.visibleHeight
	})
)

function handleBackTopClick() {
	parentElement.value.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<style scoped lang="scss">
.back-top {
	position: absolute;
	right: 0;
	bottom: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 1px solid var(--td-component-border);
	border-radius: var(--td-radius-medium);
	background-color: var(--td-bg-color-container);
	color: var(--td-text-color-primary);
	box-shadow: var(--td-shadow-3);
	transition: all var(--td-transition);
	cursor: pointer;
	z-index: 500;
	opacity: 0;
	visibility: hidden;
	--ripple-color: var(--td-bg-color-container-active);

	&:hover {
		background-color: var(--td-bg-color-container-hover);
	}

	&.is-visible {
		opacity: 1;
		visibility: visible;
	}

	&-small {
		width: 32px;
		height: 32px;
	}

	&-medium {
		width: 48px;
		height: 48px;
	}

	&-large {
		width: 64px;
		height: 64px;
	}
}
</style>
