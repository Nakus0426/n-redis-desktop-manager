<template>
	<TConfigProvider :global-config="tdesignConfig">
		<RouterView />
	</TConfigProvider>
</template>

<script setup lang="ts">
import { tdesignConfig } from '@/config'
</script>

<style scoped lang="scss"></style>
