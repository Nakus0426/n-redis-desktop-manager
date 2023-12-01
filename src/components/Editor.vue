<template>
	<div class="editor" ref="containerRef"></div>
</template>

<script setup lang="ts">
import { editor } from 'monaco-editor'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import { useAppStore } from '@/store'

const props = withDefaults(
	defineProps<{
		value?: string
		language?: string
		immediate?: boolean
	}>(),
	{
		immediate: true,
		language: 'text/plain',
	},
)

const appStore = useAppStore()

self.MonacoEnvironment = {
	getWorker: function (workerId, label) {
		switch (label) {
			case 'json':
				return new jsonWorker()
			default:
				return new editorWorker()
		}
	},
}

// init editor
const containerRef = ref()
let editorInstance: editor.IStandaloneCodeEditor
function init() {
	if (editorInstance) {
		editorInstance.dispose()
		return
	}
	editorInstance = editor.create(containerRef.value, {
		value: props.value,
		language: props.language,
		theme: editorThemeMap[window.mainWindow.getAppTheme()],
		automaticLayout: true,
		smoothScrolling: true,
		fixedOverflowWidgets: true,
		wordWrap: 'on',
		wordBreak: 'normal',
		scrollbar: {
			useShadows: false,
			verticalScrollbarSize: 12,
			verticalSliderSize: 6,
			horizontalScrollbarSize: 12,
			horizontalSliderSize: 6,
		},
		minimap: {
			enabled: false,
		},
	})
}
onMounted(() => props.immediate && init())

// editor theme
const editorThemeMap = { light: 'light', dark: 'dark' }
editor.defineTheme('light', { base: 'vs', inherit: true, rules: [], colors: { 'editor.background': '#ffffff' } })
editor.defineTheme('dark', { base: 'vs-dark', inherit: true, rules: [], colors: { 'editor.background': '#242424' } })
watch(
	() => appStore.theme,
	() => {
		const theme = window.mainWindow.getAppTheme()
		editorInstance.updateOptions({ theme: editorThemeMap[theme] })
	},
)

// editor language
watch(
	() => props.language,
	value => editor.setModelLanguage(editorInstance.getModel(), value),
)

// editor value
watch(
	() => props.value,
	value => editorInstance.setValue(value),
)

// get editor value
function getValue() {
	return editorInstance.getValue()
}

// destroy editor
function destroy() {
	editorInstance.dispose()
}

defineExpose({ init, destroy, getValue })
</script>

<style scoped lang="scss">
.editor {
	height: 100%;
	width: 100%;
}
</style>
