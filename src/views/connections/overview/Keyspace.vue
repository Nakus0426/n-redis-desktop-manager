<template>
	<div class="keyspace">
		<div class="header">Keyspace</div>
		<div class="body">
			<TPrimaryTable :columns="columns" :data="formatedKeyspace" row-key="database" size="small" hover stripe />
		</div>
	</div>
</template>

<script setup lang="ts">
import { PrimaryTableCol } from 'tdesign-vue-next'
import { connectionInfoInjectKey } from '../keys'

defineOptions({ name: 'ConnectionsOverviewKeyspace' })

const connectionInfo = inject(connectionInfoInjectKey)

// table columns config
const columns: PrimaryTableCol[] = [
	{ colKey: 'serial-number', width: 50 },
	{ colKey: 'database', title: 'Database' },
	{ colKey: 'keys', title: 'Keys', sorter: true },
	{ colKey: 'expires', title: 'Expires', sorter: true },
	{ colKey: 'avg_ttl', title: 'Avg TTL', sorter: true },
]

// format keyspace data
const formatedKeyspace = computed(() => {
	const keyspace = []
	for (const db in connectionInfo.value?.Keyspace) {
		const dbInfoArray = connectionInfo.value.Keyspace[db].split(',')
		const column = { database: db }
		dbInfoArray.forEach(item => {
			const [key, value] = item.split('=')
			column[key] = value
		})
		keyspace.push(column)
	}
	return keyspace
})
</script>

<style scoped lang="scss">
.keyspace {
	display: flex;
	flex-direction: column;
}

.header {
	position: sticky;
	top: 0;
	font: var(--td-font-title-medium);
	color: var(--td-text-color-primary);
	padding: var(--td-comp-paddingTB-m);
	background-color: var(--td-bg-color-container-opacity);
	backdrop-filter: blur(15px);
	z-index: 3;

	&::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: var(--td-comp-paddingLR-m);
		height: 1px;
		width: calc(100% - var(--td-comp-paddingLR-m) * 2);
		background-color: var(--td-component-stroke);
	}
}

.body {
	padding: var(--td-comp-paddingTB-m);
}
</style>
