<template>
	<div class="key-edit-body">
		<div class="header">
			<div class="header_prefix">
				<TSelect size="small" borderless auto-width v-model="language">
					<TOption label="Text" value="" />
					<TOption label="JSON" value="json" />
				</TSelect>
				<TTooltip :show-arrow="false" content="内存占用">
					<TTag theme="primary" variant="light">{{ memoryUsageText }}</TTag>
				</TTooltip>
			</div>
			<div class="header_suffix"><CopyButton /></div>
		</div>
		<Editor class="body" :language="language" />
	</div>
</template>

<script setup lang="ts">
import { useCopyButton, useLoading } from '@/hooks'
import { keyEditInjectKey } from '../keys'

defineOptions({ name: 'ConnectionsKeyEditBody' })

// inject data
const data = inject(keyEditInjectKey)

const { CopyButton } = useCopyButton({ source: '123', autoCopy: true, buttonProps: { size: 'small' } })

const language = ref('')

// memeory usage
const memoryUsage = ref<string>()
const memoryUsageText = computed(() => (memeoryUsageLoading.value ? '正在计算' : memoryUsage.value))
const { isLoading: memeoryUsageLoading, enter: enterMemoryUsageLoading, exit: exitMemoryUsageLoading } = useLoading()
async function getMemoryUsage() {
	try {
		enterMemoryUsageLoading()
		const { id, key } = data.value
		const memory = await window.mainWindow.redis.memoryUsage(id, key)
		if (!memory) memoryUsage.value = '-'
		const kb = memory / 1024
		memoryUsage.value = kb > 1024 ? `${(kb / 1024).toFixed(1)}MB` : `${kb.toFixed(1)}KB`
	} finally {
		exitMemoryUsageLoading()
	}
}
onMounted(() => getMemoryUsage())
</script>

<style scoped lang="scss">
.key-edit-body {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: var(--td-comp-margin-s);
	padding: var(--td-comp-paddingTB-s) var(--td-comp-paddingTB-m) var(--td-comp-paddingTB-m) var(--td-comp-paddingTB-m);
	overflow: hidden;
}

.header {
	display: flex;
	justify-content: space-between;
	gap: var(--td-comp-margin-s);

	&_prefix {
		display: flex;
		gap: var(--td-comp-margin-s);
	}
}

.body {
	flex: 1;
	border-radius: var(--td-radius-medium);
	border: 1px solid var(--td-component-stroke);
	overflow: hidden;
}

:deep(.t-button--variant-text) {
	border: none;
}
</style>
