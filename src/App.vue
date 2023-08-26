<template>
	<TConfigProvider :global-config="config">
		<RouterView />
	</TConfigProvider>
</template>

<script setup lang="ts">
import { MessagePlugin } from 'tdesign-vue-next'
import { Theme, useAppStore, useLinksStore } from '@/store'
import { useTdesignConfig } from '@/hooks'

const appStore = useAppStore()
const { config } = useTdesignConfig()

// watch app theme change and set the theme
watch(
	() => appStore.theme,
	value => {
		if (['dark', 'light'].includes(value)) setAppTheme(value)
		if (value === 'system') setAppTheme(window.mainWindow.getAppTheme())
	},
	{ immediate: true }
)
function setAppTheme(theme: Theme) {
	const css = document.createElement('style')
	css.appendChild(
		document.createTextNode(
			`* {
       -webkit-transition: none !important;
       -moz-transition: none !important;
       -o-transition: none !important;
       -ms-transition: none !important;
       transition: none !important;
    }`
		)
	)
	document.head.appendChild(css)
	document.documentElement.setAttribute('theme-mode', theme)
	const _ = window.getComputedStyle(css).opacity
	document.head.removeChild(css)
}

// init app locale
const systemLocale = window.mainWindow.getSystemLocale()
appStore.locale = appStore.locale ? appStore.locale : systemLocale

// init links store
useLinksStore().syncLinks()

// app message handler
window.mainWindow.onError(error => {
	if (error) MessagePlugin.error(error)
})
</script>

<style scoped lang="scss"></style>
