<template>
	<NConfigProvider abstract inline-theme-disabled :theme>
		<NGlobalStyle />
		<RouterView />
	</NConfigProvider>
</template>

<script setup lang="ts">
import { darkTheme } from 'naive-ui'
import { useAppStore } from '@/store/modules/app'

const appStore = useAppStore()
const theme = computed(() => (appStore.isDarkTheme ? darkTheme : null))
</script>

<style scoped lang="scss"></style>
