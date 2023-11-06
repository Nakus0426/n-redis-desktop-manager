<template>
	<div class="overview">
		<TSkeleton :loading="connectionInfoLoading" :row-col="skeletonRowCol" animation="gradient">
			<Header />
			<Keyspace />
		</TSkeleton>
		<AutoRefresh @refresh="handleAutoRefreshClick()" />
	</div>
</template>

<script setup lang="ts">
import { type SkeletonRowCol } from 'tdesign-vue-next'
import { useLoading } from '@/hooks'
import { type ConnectionInfo, useConnectionsStore } from '@/store'
import Header from './Header.vue'
import Keyspace from './Keyspace.vue'
import AutoRefresh from '../components/AutoRefresh.vue'
import { connectionInfoInjectKey } from '../keys'

defineOptions({ name: 'ConnectionsOverviewIndex' })

const props = defineProps<{ id: string }>()

const connectionStore = useConnectionsStore()

// skeleton rows
const skeletonRowCol: SkeletonRowCol = [
	[
		{ width: '8%', marginRight: '26%', marginLeft: '12px' },
		{ width: '8%', marginRight: '26%' },
		{ width: '8%', marginRight: '25%' },
	],
	[
		{ width: '33%', height: '200px', marginLeft: '12px' },
		{ width: '33%', height: '200px' },
		{ width: '33%', height: '200px', marginRight: '12px' },
	],
	{ width: '8%', marginLeft: '12px' },
	{ height: '200px', marginLeft: '12px', marginRight: '12px' },
]

// init connection info
const connectionInfo = ref<ConnectionInfo>()
const {
	isLoading: connectionInfoLoading,
	enter: enterConnectionInfoLoading,
	exit: exitConnectionInfoLoading,
} = useLoading()
async function initConnectionInfo(showLoading = true) {
	try {
		showLoading && enterConnectionInfoLoading()
		connectionInfo.value = await connectionStore.getConnectionInfo(props.id)
	} finally {
		showLoading && exitConnectionInfoLoading()
	}
}
onMounted(() => initConnectionInfo())
provide(connectionInfoInjectKey, connectionInfo)

// auto refresh
function handleAutoRefreshClick() {
	initConnectionInfo(false)
}
</script>

<style scoped lang="scss">
.overview {
	display: flex;
	flex-direction: column;
}

:deep(.t-skeleton__col) {
	background-color: var(--td-bg-color-component);
}
</style>
