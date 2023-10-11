<template>
	<Dialog
		:icon="dialogInfo.icon"
		:title="dialogInfo.title"
		v-model:visible="visible"
		width="800px"
		:confirm-btn="null"
		cancel-btn="关闭"
	>
		<div class="info-dialog">
			<div class="info" v-for="(value, key) in formatedInfo" :key="key">
				<div class="info_title">
					<div class="info_title_prefix">
						<TextEllipsis :content="key" />
					</div>
					<TTooltip content="复制值" :show-arrow="false">
						<TButton
							class="info_title_suffix"
							size="small"
							variant="text"
							shape="square"
							theme="primary"
							:loading="isCopyLoading"
							@click="handleCopyClick(value)"
						>
							<template #icon>
								<Icon height="16" width="16" :icon="generateCopyIcon(value)" />
							</template>
						</TButton>
					</TTooltip>
				</div>
				<div class="info_value">{{ value }}</div>
			</div>
		</div>
	</Dialog>
</template>

<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { set, upperFirst } from 'lodash-es'
import { useLoading } from '@/hooks'
import { connectionInfoInjectKey } from '../keys'

defineOptions({ name: 'ConnectionsOverviewHeaderInfoDialog' })

// open dialog
const visible = ref(false)
const dialogInfo = ref({ icon: '', title: '' })
function open(icon: string, title: string) {
	dialogInfo.value = { icon, title }
	visible.value = true
}

// generate info
const connectionInfo = inject(connectionInfoInjectKey)
const formatedInfo = computed(() => {
	if (!dialogInfo.value.title || !connectionInfo.value) return {}
	const info = connectionInfo.value[dialogInfo.value.title]
	let result: Record<string, string> = {}
	for (const key in info) {
		const formatedKey = key
			.split('_')
			.map(item => upperFirst(item))
			.join(' ')
		set(result, formatedKey, info[key])
	}
	return result
})

// copy value
const { copy, copied, text: copiedText } = useClipboard()
const { isLoading: isCopyLoading, enter: enterCopyLoading, exit: exitCopyLoading } = useLoading()
function generateCopyIcon(value: string) {
	if (copiedText.value !== value) return 'fluent:copy-select-20-regular'
	if (isCopyLoading.value) return 'line-md:loading-loop'
	if (!isCopyLoading.value && copied.value) return 'fluent:checkmark-16-regular'
	return 'fluent:copy-select-20-regular'
}
async function handleCopyClick(value: string) {
	try {
		enterCopyLoading()
		await copy(value)
	} finally {
		exitCopyLoading()
	}
}

defineExpose({ open })
</script>

<style scoped lang="scss">
.info-dialog {
	position: relative;
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: var(--td-comp-margin-m);
	padding: 0 var(--td-comp-paddingLR-l) var(--td-comp-paddingLR-l) var(--td-comp-paddingLR-l) !important;
}

.info {
	display: flex;
	flex-direction: column;
	gap: var(--td-comp-margin-s);
	border-radius: var(--td-radius-medium);
	border: 1px solid var(--td-component-border);
	padding: var(--td-comp-paddingLR-s);
	background-image: linear-gradient(120deg, var(--td-bg-color-container) 45%, var(--td-bg-color-container-hover));
	transition: all var(--td-transition);
	overflow: hidden;

	&:hover {
		filter: drop-shadow(0 10px 10px var(--td-bg-color-container-hover));

		.info_title_suffix {
			visibility: visible;
			opacity: 1;
		}
	}

	&_title {
		display: flex;
		gap: var(--td-comp-margin-s);
		font: var(--td-font-title-medium);
		color: var(--td-text-color-primary);

		&_prefix {
			flex: 1;
			overflow: hidden;
		}

		&_suffix {
			visibility: hidden;
			opacity: 0;
		}
	}

	&_value {
		font: var(--td-font-body-medium);
		color: var(--td-text-color-secondary);
	}
}
</style>
