<template>
	<div class="common">
		<Cell title="语言及字体" direction="vertical">
			<CellItem :label="t('language')"><TSelect></TSelect></CellItem>
			<CellItem label="自定义字体"><TInput></TInput></CellItem>
		</Cell>
	</div>
</template>

<script setup lang="ts">
import Cell from './modules/Cell'
import CellItem from './modules/CellItem'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n({
	inheritLocale: true,
	useScope: 'local',
})
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
