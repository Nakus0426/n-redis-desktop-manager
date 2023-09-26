<template>
	<div class="keyspace">
		<div class="header">
			<Icon class="header_icon" height="16" width="16" icon="fluent:key-multiple-16-regular" />
			<div class="header_title">Keyspace</div>
		</div>
		<div class="body">
			<TPrimaryTable
				:columns="columns"
				:data="formatedKeyspace"
				row-key="database"
				size="small"
				hover
				stripe
			></TPrimaryTable>
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
	gap: var(--td-comp-margin-xs);
	margin-top: var(--td-comp-paddingTB-m);
	padding: 0 var(--td-comp-paddingLR-m);
}

.header {
	display: flex;
	align-items: center;
	gap: var(--td-comp-margin-xs);

	&_icon {
		color: var(--td-brand-color);
	}

	&_title {
		font: var(--td-font-body-medium);
		color: var(--td-text-color-secondary);
	}
}

.body {
	background-color: var(--td-bg-color-container);
	border-radius: var(--td-radius-medium);
	padding: var(--td-comp-paddingLR-m);
	overflow: hidden;
}
</style>
