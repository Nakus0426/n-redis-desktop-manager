<template>
	<div class="window-actions-overlay">
		<div class="window-actions-overlay_item" v-ripple v-if="minimizable" @click="handleMinimizeClick()">
			<Icon height="16" width="16" icon="fluent:subtract-16-regular" />
		</div>
		<div class="window-actions-overlay_item" v-ripple v-if="maximizable" @click="handleMaximizeClick()">
			<Icon height="16" width="16" :icon="maximizeIcon" />
		</div>
		<div class="window-actions-overlay_item exit" v-ripple @click="handleCloseClick()">
			<Icon height="16" width="16" icon="fluent:dismiss-16-regular" />
		</div>
	</div>
</template>

<script setup lang="ts">
const props = withDefaults(
	defineProps<{
		/**
		 * window api
		 */
		window: string
		/**
		 * window minimizable
		 * @default true
		 */
		maximizable?: boolean
		/**
		 * window maximizable
		 * @default true
		 */
		minimizable?: boolean
	}>(),
	{
		maximizable: true,
		minimizable: true,
	},
)

const isMaximize = ref(false)
const maximizeIcon = computed(() =>
	isMaximize.value ? 'fluent:square-multiple-16-regular' : 'fluent:maximize-16-regular',
)
if (window?.[props.window]?.onMaximize) {
	window[props.window].onMaximize(() => {
		isMaximize.value = true
	})
}
if (window?.[props.window]?.onUnMaximize) {
	window[props.window].onUnMaximize(() => {
		isMaximize.value = false
	})
}

/**
 * handle minimize button click
 */
function handleMinimizeClick() {
	window[props.window].minimize()
}

/**
 * handle maximize button click
 */
function handleMaximizeClick() {
	isMaximize.value ? window[props.window].unmaximize() : window[props.window].maximize()
}

/**
 * handle close button click
 */
function handleCloseClick() {
	window[props.window].close()
}
</script>

<style scoped lang="scss">
.window-actions-overlay {
	position: absolute;
	top: 0;
	right: 0;
	height: var(--window-action-height);
	display: flex;
	z-index: 1;

	&_item {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 40px;
		color: var(--td-text-color-primary);
		cursor: pointer;
		transition: all var(--td-transition);
		--ripple-color: var(--td-bg-color-secondarycontainer-active);

		&.exit {
			--ripple-color: var(--td-error-color-active);

			&:hover {
				background-color: var(--td-error-color);
				color: #ffffff;
			}
		}

		&:hover {
			background-color: var(--td-bg-color-container-active);
		}
	}
}
</style>
