<template>
	<TConfigProvider :global-config="tdesignConfig">
		<RouterView />
	</TConfigProvider>
</template>

<script setup lang="ts">
import { tdesignConfig } from '@/config'
import { Theme, useAppStore } from '@/store'

const appStore = useAppStore()

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
</script>

<style scoped lang="scss"></style>
