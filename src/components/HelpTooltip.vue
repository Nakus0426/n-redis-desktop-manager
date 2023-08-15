<template>
	<div class="help-tooltip" :style="wrapStyle">
		<TTooltip v-bind="$props" :content="$slots.content" :show-arrow="false">
			<Icon class="help-tooltip_icon" :height="height" :width="width" icon="fluent:question-circle-20-regular" />
		</TTooltip>
	</div>
</template>

<script setup lang="ts">
import { type IconifyIconSize } from '@iconify/vue'
import { isNumber, isString } from 'lodash-es'

const props = withDefaults(
	defineProps<{
		height?: IconifyIconSize
		width?: IconifyIconSize
	}>(),
	{
		height: '16',
		width: '16',
	}
)

// component size
function tranformUnit(value: string | number) {
	if (isNumber(value)) return `${value}px`
	if (isString(value)) {
		if (value.endsWith('px')) return value
		return `${value}px`
	}
}
const wrapStyle = computed(() => ({ width: tranformUnit(props.width), height: tranformUnit(props.height) }))
</script>

<style scoped lang="scss">
.help-tooltip {
	cursor: help;

	&_icon {
		color: var(--td-text-color-secondary);
	}
}
</style>
