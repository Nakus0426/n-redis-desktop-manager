<template>
	<div class="diff-editor" ref="containerRef"></div>
</template>

<script setup lang="ts">
import { useAppStore } from '@/store'
import { editor } from 'monaco-editor'

defineOptions({ name: 'DiffEditor' })

const appStore = useAppStore()

const props = withDefaults(
	defineProps<{
		immediate?: boolean
		originalModel?: string
		modifiedModel?: string
		language?: string
	}>(),
	{
		immediate: true,
		language: 'text/plain',
	},
)

const containerRef = ref()
let editorInstance: editor.IStandaloneDiffEditor
function init(originalModel?: string, modifiedModel?: string, language?: string) {
	if (!editorInstance)
		editorInstance = editor.createDiffEditor(containerRef.value, {
			readOnly: true,
			automaticLayout: true,
			smoothScrolling: true,
			fixedOverflowWidgets: true,
			theme: editorThemeMap[appStore.theme],
			renderSideBySide: true,
			renderSideBySideInlineBreakpoint: 100,
			scrollbar: {
				useShadows: false,
				verticalScrollbarSize: 0,
				horizontalScrollbarSize: 0,
			},
		})
	const _originalModel = originalModel || props.originalModel
	const _modifiedModel = modifiedModel || props.modifiedModel
	const _language = language || props.language
	if (!_originalModel || !_modifiedModel) return
	editorInstance.setModel({
		original: editor.createModel(_originalModel, _language),
		modified: editor.createModel(_modifiedModel, _language),
	})
}
onMounted(() => props.immediate && init())

// editor theme
const editorThemeMap = { light: 'vs', dark: 'vs-dark' }
watch(
	() => appStore.theme,
	() => {
		const theme = window.mainWindow.getAppTheme()
		// @ts-ignore
		editorInstance.updateOptions({ theme: editorThemeMap[theme] })
	},
)

defineExpose({ init })
</script>

<style scoped lang="scss">
.diff-editor {
	height: 100%;
	width: 100%;
}
</style>
