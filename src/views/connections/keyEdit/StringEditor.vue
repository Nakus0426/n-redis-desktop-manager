<template>
	<div class="string-editor">
		<div class="header">
			<div class="header_prefix">
				<TTooltip content="大小" :show-arrow="false">
					<TTag>{{ formatedMemoryUsage }}</TTag>
				</TTooltip>
				<TSelect size="small" :options="languageOptions" v-model="language" />
			</div>
			<div class="header_suffix">
				<TTooltip content="保存" :show-arrow="false">
					<TButton
						theme="success"
						variant="text"
						shape="square"
						size="small"
						:loading="isSaveLoading"
						@click="handleSaveClick()"
					>
						<template #icon><Icon height="16" width="16" icon="fluent:save-16-regular" /></template>
					</TButton>
				</TTooltip>
				<CopyButton />
			</div>
		</div>
		<div class="body">
			<Editor :language="language" :value="injectData.value" ref="editorRef" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { MessagePlugin, type SelectOption } from 'tdesign-vue-next'
import { useEventBus } from '@vueuse/core'
import Editor from '@/components/Editor.vue'
import { useCopyButton } from '@/hooks'
import { keyEditInjectKey, keyEditUpdatedEventKey } from '../keys'
import { useKeyValueSet } from '../hooks'

defineOptions({ name: 'ConnectionsKeyEditStringEditor' })

const injectData = inject(keyEditInjectKey)

// memory usage
const formatedMemoryUsage = computed(() => {
	const kb = injectData.value.memoryUsage / 1024
	return kb > 1024 ? `${(kb / 1024).toFixed(1)}MB` : `${kb.toFixed(1)}KB`
})

// copy button
const {
	CopyButton,
	copy,
	enterLoading: enterCopyLoading,
	exitLoading: exitCopyLoading,
} = useCopyButton({ buttonProps: { size: 'small', onClick: handleCopyClick }, autoCopy: false })
async function handleCopyClick() {
	try {
		enterCopyLoading()
		await copy('123')
	} finally {
		exitCopyLoading()
	}
}

// editor language
const language = ref('text/plain')
const languageOptions: SelectOption[] = [
	{ label: 'Text', value: 'text/plain' },
	{ label: 'JSON', value: 'json' },
]

// save
const editorRef = ref<InstanceType<typeof Editor>>()
const { isLoading: isSaveLoading, execute: save } = useKeyValueSet(injectData.value.id)
async function handleSaveClick() {
	const { key, ttl } = injectData.value
	await save(key, editorRef.value.getValue(), ttl > 0 ? ttl : undefined)
	MessagePlugin.success('保存成功')
	useEventBus(keyEditUpdatedEventKey).emit()
}
</script>

<style scoped lang="scss">
.string-editor {
	display: flex;
	flex-direction: column;
}

.header {
	display: flex;
	justify-content: space-between;
	padding: var(--td-comp-paddingLR-s) 0;
	border-bottom: 1px solid var(--td-component-stroke);

	&_prefix {
		display: flex;
		gap: var(--td-comp-margin-s);
	}

	&_suffix {
		display: flex;
		gap: var(--td-comp-margin-s);
	}
}

.body {
	flex: 1;
	padding-top: var(--td-comp-paddingLR-s);
}
</style>
