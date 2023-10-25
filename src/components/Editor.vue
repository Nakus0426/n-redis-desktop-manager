<template>
	<div class="editor" ref="containerRef"></div>
</template>

<script setup lang="ts">
import { editor } from 'monaco-editor'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import { useAppStore } from '@/store'

defineOptions({ name: 'Editor' })

const props = withDefaults(
	defineProps<{
		value?: string
		language?: string
	}>(),
	{},
)
const emit = defineEmits<{}>()

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
function initEditor() {
	editorInstance = editor.create(containerRef.value, {
		language: props.language,
		theme: editorThemeMap[window.mainWindow.getAppTheme()],
		automaticLayout: true,
		smoothScrolling: true,
		fixedOverflowWidgets: true,
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
onMounted(() => initEditor())

// editor theme
const editorThemeMap = { light: 'vs', dark: 'vs-dark' }
watch(
	() => appStore.theme,
	() => {
		const theme = window.mainWindow.getAppTheme()
		editorInstance.updateOptions({ theme: editorThemeMap[theme] })
	},
)

// edit language
watch(
	() => props.language,
	value => editor.setModelLanguage(editorInstance.getModel(), value),
)
</script>

<style scoped lang="scss">
.editor {
	height: 100%;
	width: 100%;
}
</style>
