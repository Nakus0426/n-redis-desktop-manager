<template>
	<Dialog v-model:visible="visible" title="新增键" icon="fluent:add-circle-24-regular"></Dialog>
</template>

<script setup lang="ts">
// dialog visible
const visible = ref(false)
function open() {
	visible.value = true
}

defineExpose({ open })
</script>

<style scoped lang="scss"></style>
