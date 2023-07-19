<template>
	<div class="window-actions-overlay">
		<div class="window-actions-overlay_item" v-if="minimizable" @click="handleMinimizeClick()">
			<Icon height="16" width="16" icon="fluent:subtract-20-regular" />
		</div>
		<div class="window-actions-overlay_item" v-if="maximizable" @click="handleMaximizeClick()">
			<Icon height="16" width="16" :icon="maximizeIcon" />
		</div>
		<div class="window-actions-overlay_item exit" @click="handleCloseClick()">
			<Icon height="16" width="16" icon="fluent:dismiss-20-regular" />
		</div>
	</div>
</template>

<script setup lang="ts">
defineOptions({ name: 'WindowActionsOverlay' })

const props = withDefaults(
	defineProps<{
		windowApi: any
		maximizable?: boolean
		minimizable?: boolean
	}>(),
	{
		maximizable: true,
		minimizable: true,
	}
)

const isMaximize = ref(false)
const maximizeIcon = computed(() =>
	isMaximize.value ? 'fluent:square-multiple-20-regular' : 'fluent:maximize-20-regular'
)
if (props.windowApi?.onMaximize) {
	props.windowApi.onMaximize(() => {
		isMaximize.value = true
	})
}
if (props.windowApi?.onUnMaximize) {
	props.windowApi.onUnMaximize(() => {
		isMaximize.value = false
	})
}

function handleMinimizeClick() {
	props.windowApi.minimize()
}

function handleMaximizeClick() {
	isMaximize.value ? props.windowApi.unmaximize() : props.windowApi.maximize()
}

function handleCloseClick() {
	props.windowApi.close()
}
</script>

<style scoped lang="scss">
.window-actions-overlay {
	position: absolute;
	top: 0;
	right: 0;
	height: 30px;
	display: flex;

	&_item {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 40px;
		color: var(--td-text-color-primary);
		cursor: pointer;
		transition: all var(--td-transition);

		&.exit {
			&:hover {
				background-color: var(--td-error-color);
				color: #ffffff;
			}

			&:active {
				background-color: var(--td-error-color-active);
			}
		}

		&:hover {
			background-color: var(--td-bg-color-container-hover);
		}

		&:active {
			background-color: var(--td-bg-color-container-active);
		}
	}
}
</style>
