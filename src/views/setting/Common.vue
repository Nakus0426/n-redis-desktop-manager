<template>
	<div class="common">
		<Cell title="语言及字体" direction="vertical">
			<CellItem label="显示语言"><TSelect :options="locales" v-model="locale"></TSelect></CellItem>
			<CellItem label="自定义字体"><TInput></TInput></CellItem>
		</Cell>
	</div>
</template>

<script setup lang="ts">
import { SelectOption } from 'tdesign-vue-next'
import Cell from './modules/Cell'
import CellItem from './modules/CellItem'
import { useI18n } from 'vue-i18n'

// app locale switch
const { t, locale } = useI18n()
const locales: SelectOption = [
	{ label: t('language', 1, { locale: 'zh-CN' }), value: 'zh-CN' },
	{ label: t('language', 1, { locale: 'zh-TW' }), value: 'zh-TW' },
]
</script>

<style scoped lang="scss">
.common {
	height: 100%;
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: var(--td-comp-margin-m);
	padding: var(--td-comp-paddingTB-m);
}
</style>
