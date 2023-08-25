<template>
	<div class="empty" :class="clazz">
		<img class="empty_icon" :src="iconSrc" />
		<div class="empty_description">{{ description }}</div>
	</div>
</template>

<script setup lang="ts">
import { kebabCase } from 'lodash-es'

defineOptions({ name: 'Empty' })

type Icon = 'emptyInbox' | 'nothingHere' | 'addToInbox'
type Size = 'medium' | 'large'
const props = withDefaults(
	defineProps<{
		icon?: Icon | string
		size?: Size
		description?: string
		clickable?: boolean
	}>(),
	{
		icon: 'emptyInbox',
		size: 'medium',
		description: '暂无数据',
		clickable: false,
	}
)

const iconSrc = computed(() => `./src/assets/icons/${kebabCase(props.icon)}.svg`)
const clazz = computed(() => `empty-${props.size} ${props.clickable ? 'empty-clickable' : ''}`)
</script>

<style scoped lang="scss">
.empty {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: var(--td-comp-margin-m);

	&-medium {
		.empty_icon {
			height: 64px;
		}

		.empty_description {
			font: var(--td-font-body-small);
		}
	}

	&-large {
		.empty_icon {
			height: 96px;
		}

		.empty_description {
			font: var(--td-font-body-medium);
		}
	}

	&-clickable {
		cursor: pointer;
	}

	&_icon {
		pointer-events: none;
	}

	&_description {
		color: var(--td-text-color-placeholder);
	}
}
</style>
