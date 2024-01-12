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
import { useConnectionsStore } from '@/store/modules/connections'
import { useAppStore } from '@/store/modules/app'
import { useTdesignConfig } from '@/hooks/useTdesignConfig'

const { config } = useTdesignConfig()

// init connections store
useConnectionsStore().syncConnections()

// init app store
useAppStore().initAppLocale()

// app message handler
window.mainWindow.onError(error => {
	if (error) MessagePlugin.error({ content: error, placement: 'bottom' })
})
</script>

<style scoped lang="scss"></style>
