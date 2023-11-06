<template>
	<div class="function">
		<Cell title="键值编辑" direction="vertical">
			<CellItem label="保存前显示编辑前后差异">
				<TSwitch size="large" v-model="appStore.showDiffBeforeSave" />
			</CellItem>
		</Cell>
	</div>
</template>

<script setup lang="ts">
import { useAppStore } from '@/store'
import Cell from './components/Cell'
import CellItem from './components/CellItem'

defineOptions({ name: 'SettingFunction' })

const appStore = useAppStore()
</script>

<style scoped lang="scss">
.function {
	height: 100%;
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: var(--td-comp-margin-m);
}
</style>
