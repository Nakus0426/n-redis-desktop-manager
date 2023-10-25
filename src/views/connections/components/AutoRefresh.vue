<template>
	<TPopup placement="left">
		<button class="auto-refresh" ref="containerRef" v-ripple @click="handleRefreshClick()">
			<Icon height="24" width="24" :icon="icon" />
		</button>
		<template #content>
			<div class="auto-refresh-popup_content">
				<TSwitch v-model="autoRefreshEnable" @change="handleAutoRefreshClick" />
				<div>自动刷新</div>
			</div>
		</template>
	</TPopup>
</template>

<script setup lang="ts">
defineOptions({ name: 'ConnectionAutoRefresh' })

const emit = defineEmits<{ refresh: [] }>()

// generate button icon
const autoRefreshEnable = ref(false)
const icon = computed(() => (autoRefreshEnable.value ? 'line-md:loading-loop' : 'fluent:arrow-sync-24-regular'))

// refresh
function handleRefreshClick() {
	emit('refresh')
}

// auto refresh
let autoRefreshInterval: NodeJS.Timeout
function handleAutoRefreshClick(value: boolean) {
	clearInterval(autoRefreshInterval)
	if (value) autoRefreshInterval = setInterval(() => emit('refresh'), 2000)
}
</script>

<style scoped lang="scss">
.auto-refresh {
	position: fixed;
	right: var(--td-comp-paddingLR-l);
	bottom: var(--td-comp-paddingLR-l);
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 1px solid var(--td-component-border);
	border-radius: var(--td-radius-medium);
	background-color: var(--td-bg-color-container);
	color: var(--td-text-color-primary);
	box-shadow: var(--td-shadow-3);
	transition: all var(--td-transition);
	cursor: pointer;
	z-index: 500;
	--ripple-color: var(--td-bg-color-container-active);

	&:hover {
		background-color: var(--td-bg-color-container-hover);
	}

	&:focus-visible {
		outline: none;
		border-color: var(--td-brand-color);
		color: var(--td-brand-color);
	}
}

.auto-refresh-popup_content {
	display: flex;
	align-items: center;
	gap: var(--td-comp-margin-s);
	font: var(--td-font-body-medium);
	color: var(--td-text-color-primary);
}
</style>
