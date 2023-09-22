<template>
	<div class="overview">
		<TSkeleton :loading="connectionInfoLoading" :row-col="skeletonRowCol" animation="gradient">
			<Header />
		</TSkeleton>
	</div>
</template>

<script setup lang="ts">
import { type SkeletonRowCol } from 'tdesign-vue-next'
import { useLoading } from '@/hooks'
import { type ConnectionInfo, useConnectionsStore } from '@/store'
import Header from './Header.vue'
import { connectionInfoInjectKey } from '../keys'

defineOptions({ name: 'ConnectionsOverviewIndex' })

const props = defineProps<{ data: string }>()

const connectionStore = useConnectionsStore()

// skeleton rows
const skeletonRowCol: SkeletonRowCol = [
	[
		{ width: '8%', marginRight: '26%' },
		{ width: '8%', marginRight: '26%' },
		{ width: '8%', marginRight: '25%' },
	],
	[
		{ width: '33%', height: '200px' },
		{ width: '33%', height: '200px' },
		{ width: '33%', height: '200px' },
	],
]

// init connection info
const connectionInfo = ref<ConnectionInfo>()
const {
	isLoading: connectionInfoLoading,
	enter: enterConnectionInfoLoading,
	exit: exitConnectionInfoLoading,
} = useLoading()
async function initConnectionInfo() {
	try {
		enterConnectionInfoLoading()
		connectionInfo.value = await connectionStore.getConnectionInfo(props.data)
	} finally {
		exitConnectionInfoLoading()
	}
}
onMounted(() => initConnectionInfo())
provide(connectionInfoInjectKey, connectionInfo)
</script>

<style scoped lang="scss">
.overview {
	display: flex;
	flex-direction: column;
	padding: var(--td-comp-paddingLR-m);
}

:deep(.t-skeleton__col) {
	background-color: var(--td-bg-color-component);
}
</style>
