<template>
	<div class="content">
		<div class="window-overlay">
			<div class="window-overlay_item" @click="handleMinimizeClick()">
				<Icon height="16" width="16" icon="fluent:subtract-20-regular" />
			</div>
			<div class="window-overlay_item" @click="handleMaximizeClick()">
				<Icon height="16" width="16" :icon="maximizeIcon" />
			</div>
			<div class="window-overlay_item exit"><Icon height="16" width="16" icon="fluent:dismiss-20-regular" /></div>
		</div>
		<div class="body">
			<RouterView>
				<template #default="{ Component }">
					<Transition name="zoom-fade" mode="out-in" appear>
						<component :is="Component" />
					</Transition>
				</template>
			</RouterView>
		</div>
	</div>
</template>

<script setup lang="ts">
defineOptions({ name: 'Content' })

const isMaximize = ref(false)
const maximizeIcon = computed(() =>
	isMaximize.value ? 'fluent:square-multiple-20-regular' : 'fluent:maximize-20-regular'
)
window.mainWindow.onMaximize(() => {
	isMaximize.value = true
})
window.mainWindow.onUnMaximize(() => {
	isMaximize.value = false
})

function handleMinimizeClick() {
	window.mainWindow.minimize()
}

function handleMaximizeClick() {
	isMaximize.value ? window.mainWindow.unmaximize() : window.mainWindow.maximize()
}
</script>

<style scoped lang="scss">
.content {
	flex: 1;
}

.window-overlay {
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

.body {
	width: 100%;
	height: 100%;
	overflow: hidden;
}
</style>
