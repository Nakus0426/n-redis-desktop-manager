<template>
	<Dialog
		class="editor-dialog"
		title="编辑"
		icon="fluent:document-edit-24-regular"
		v-model:visible="visible"
		width="80vw"
		height="80vh"
		:close-on-overlay-click="false"
		:closeon-esc-keydown="false"
		placement="center"
		@opened="handleDialogOpened()"
		@closed="close()"
	>
		<TLoading class="body" :loading="loading">
			<Editor :immediate="false" :value="data" :language="language" ref="editorRef" />
		</TLoading>
		<template #footer>
			<div class="footer">
				<div class="footer_prefix">
					<TSelect :options="languageOptions" v-model="language" />
				</div>
				<div class="footer_suffix">
					<TButton theme="default" @click="close()">取消</TButton>
					<TButton :loading="isConfirmLoading" @click="handleSubmitClick()">保存</TButton>
				</div>
			</div>
		</template>
	</Dialog>
</template>

<script setup lang="ts">
import { type SelectOption } from 'tdesign-vue-next'
import Editor from '@/components/Editor.vue'
import { useLoading } from '@/hooks'

// open dialog
const visible = ref(false)
let confirmCallback: (value: string) => void | Promise<void>
function open(options: { value: string; confirm: typeof confirmCallback }) {
	visible.value = true
	loading.value = true
	const { value, confirm } = options
	data.value = value
	confirmCallback = confirm
}

// close dialog
function close() {
	editorRef.value.destroy()
	visible.value = false
	language.value = 'text/plain'
}

// dialog opened
const loading = ref(false)
const editorRef = ref<InstanceType<typeof Editor>>()
function handleDialogOpened() {
	editorRef.value.init()
	loading.value = false
}

// editor language
const language = ref('text/plain')
const languageOptions: SelectOption[] = [
	{ label: 'Text', value: 'text/plain' },
	{ label: 'JSON', value: 'json' },
]

// submit
const data = ref<string>()
const { isLoading: isConfirmLoading, enter: enterConfirmLoading, exit: exitConfirmLoading } = useLoading()
async function handleSubmitClick() {
	try {
		enterConfirmLoading()
		await confirmCallback(editorRef.value.getValue().replace(/\s+/g, ''))
		close()
	} finally {
		exitConfirmLoading()
	}
}

defineExpose({ open })
</script>

<style scoped lang="scss">
.body {
	height: calc(80vh - 122px);
}

.footer {
	display: flex;
	justify-content: space-between;
	align-items: center;

	&_suffix {
		display: flex;
		gap: var();
	}
}
</style>
