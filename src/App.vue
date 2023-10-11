<template>
	<TConfigProvider :global-config="config">
		<RouterView>
			<template #default="{ Component }">
				<Transition enter-active-class="animate__animated animate__fadeIn animate__faster" mode="out-in">
					<component :is="Component" />
				</Transition>
			</template>
		</RouterView>
	</TConfigProvider>
</template>

<script setup lang="ts">
import { MessagePlugin } from 'tdesign-vue-next'
import { useAppStore, useConnectionsStore } from '@/store'
import { useTdesignConfig } from '@/hooks'

const appStore = useAppStore()
const { config } = useTdesignConfig()

// init app store
appStore.initAppLocale()

// init connections store
useConnectionsStore().syncConnections()

// app message handler
window.mainWindow.onError(error => {
	if (error) MessagePlugin.error(error)
})
</script>

<style scoped lang="scss"></style>
