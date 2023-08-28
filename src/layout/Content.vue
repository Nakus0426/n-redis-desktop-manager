<template>
	<div class="content">
		<WindowActionsOverlay :window-api="windowApi" />
		<div class="body">
			<RouterView>
				<template #default="{ Component }">
					<Transition enter-active-class="animate__animated animate__fadeInUp animate__faster" mode="out-in" appear>
						<component :is="Component" />
					</Transition>
				</template>
			</RouterView>
		</div>
	</div>
</template>

<script setup lang="ts">
defineOptions({ name: 'Content' })

const windowApi = window.mainWindow
</script>

<style scoped lang="scss">
.content {
	flex: 1;
	background-color: var(--td-bg-color-page);
	overflow: hidden
}

.body {
	width: 100%;
	height: 100%;
	overflow: hidden;
}
</style>
