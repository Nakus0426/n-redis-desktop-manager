<template>
	<div class="overview">
		<TSkeleton :loading="connectionInfoLoading" :row-col="skeletonRowCol" animation="gradient">
			<Header />
			<Keyspace />
		</TSkeleton>
		<TTooltip :show-arrow="false" :content="autoRefreshButtonStyle.tooltipContent" placement="left">
			<button class="auto-refresh" v-ripple @click="handleAutoRefreshClick()">
				<Icon height="24" width="24" :icon="autoRefreshButtonStyle.icon" />
			</button>
		</TTooltip>
	</div>
</template>

<script setup lang="ts">
import { type SkeletonRowCol } from 'tdesign-vue-next'
import { useLoading } from '@/hooks'
import { type ConnectionInfo, useConnectionsStore } from '@/store'
import Header from './Header.vue'
import Keyspace from './Keyspace.vue'
import { connectionInfoInjectKey } from '../keys'

defineOptions({ name: 'ConnectionsOverviewIndex' })

const props = defineProps<{ data: string }>()

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
async function initConnectionInfo() {
	connectionInfo.value = await connectionStore.getConnectionInfo(props.data)
}
onMounted(async () => {
	try {
		enterConnectionInfoLoading()
		initConnectionInfo()
	} finally {
		exitConnectionInfoLoading()
	}
})
provide(connectionInfoInjectKey, connectionInfo)

// auto refresh
const autoRefreshEnable = ref(false)
const autoRefreshButtonStyle = computed(() => ({
	icon: autoRefreshEnable.value ? 'line-md:loading-loop' : 'fluent:arrow-sync-24-regular',
	tooltipContent: autoRefreshEnable.value ? '关闭自动刷新' : '开启自动刷新',
}))
let autoRefreshInterval: NodeJS.Timeout
function handleAutoRefreshClick() {
	autoRefreshEnable.value = !autoRefreshEnable.value
	clearInterval(autoRefreshInterval)
	autoRefreshEnable.value && (autoRefreshInterval = setInterval(initConnectionInfo, 2000))
}
</script>

<style scoped lang="scss">
.overview {
	display: flex;
	flex-direction: column;
	padding: var(--td-comp-paddingLR-m) 0;
}

:deep(.t-skeleton__col) {
	background-color: var(--td-bg-color-component);
}

.auto-refresh {
	position: fixed;
	right: var(--td-comp-paddingLR-m);
	bottom: var(--td-comp-paddingLR-m);
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 1px solid var(--td-component-border);
	border-radius: var(--td-radius-medium);
	background-color: var(--td-bg-color-container);
	color: var(--td-text-color-primary);
	box-shadow: var(--td-shadow-3);
	transition: all var(--td-transition);
	cursor: pointer;
	z-index: 500;
	--ripple-color: var(--td-bg-color-container-active);

	&:hover {
		background-color: var(--td-bg-color-container-hover);
	}

	&:focus-visible {
		outline: none;
		border-color: var(--td-brand-color);
		color: var(--td-brand-color);
	}
}
</style>
