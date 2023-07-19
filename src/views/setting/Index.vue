<template>
	<div class="setting">
		<WindowActionsOverlay :window-api="windowApi" :minimizable="false" :maximizable="false" />
	</div>
</template>

<script setup lang="ts">
defineOptions({ name: 'Setting' })

const windowApi = window.settingWindow
</script>

<style scoped lang="scss"></style>
