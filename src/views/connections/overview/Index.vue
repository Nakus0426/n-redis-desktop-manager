<template>
	<div class="overview">
		<Header />
		<Keyspace />
		<AutoRefresh @refresh="handleAutoRefreshClick()" />
	</div>
</template>

<script setup lang="ts">
import { useLoading } from '@/hooks'
import { type ConnectionInfo, useConnectionsStore } from '@/store'
import Header from './Header.vue'
import Keyspace from './Keyspace.vue'
import AutoRefresh from '../components/AutoRefresh.vue'
import { connectionInfoInjectKey } from '../keys'

const props = defineProps<{ id: string }>()

const connectionStore = useConnectionsStore()

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
provide(connectionInfoInjectKey, { isLoading: connectionInfoLoading, data: connectionInfo })

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
