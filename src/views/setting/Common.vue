<template>
	<div class="common">
		<Cell title="语言" direction="vertical">
			<CellItem label="显示语言">
				<TSelect :options="locales" v-model="locale" @change="handleLocaleChange">
					<template #prefixIcon>
						<Icon height="16" width="16" icon="fluent:local-language-20-regular" />
					</template>
				</TSelect>
			</CellItem>
		</Cell>
		<Cell title="软件更新">
			<CellItem label="自动更新" desc="开启后将自动下载并安装软件更新">
				<TSwitch size="large" />
			</CellItem>
		</Cell>
	</div>
</template>

<script setup lang="ts">
import { SelectOption } from 'tdesign-vue-next'
import Cell from './modules/Cell'
import CellItem from './modules/CellItem'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/store'

const appStore = useAppStore()

// app locale switch
const { t, locale } = useI18n()
const locales: SelectOption[] = [
	{ label: t('language', 1, { locale: 'zh-CN' }), value: 'zh-CN' },
	{ label: t('language', 1, { locale: 'zh-TW' }), value: 'zh-TW' },
]
function handleLocaleChange(value: string) {
	appStore.locale = value
}
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
