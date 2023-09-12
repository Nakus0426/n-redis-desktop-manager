import { acceptHMRUpdate, defineStore } from 'pinia'
import localForage from 'localforage'
import { cloneDeep } from 'lodash-es'

export interface Connection {
	id: string
	name: string
	host: string
	port: number
	username: string
	password: string
	separator: string
	display: 'tree' | 'list'
	top?: boolean
	connected?: 'connecting' | 'connected' | 'disconnected'
}

enum ConnectionKeys {
	NormalConnections = 'normalConnections',
	TopConnections = 'topConnections',
}

/**
 * connections store
 */
export const useConnectionsStore = defineStore('Connections', () => {
	/**
	 * array of connections
	 */
	const connections = computed<Connection[]>(() => topConnections.value.concat(normalConnections.value))

	/**
	 * array of top connections
	 */
	const topConnections = ref<Connection[]>([])

	/**
	 * array of normal connections
	 */
	const normalConnections = ref<Connection[]>([])

	/**
	 *  sync stored connections data
	 */
	async function syncConnections() {
		const storedNormalLiks = await localForage.getItem<string>(ConnectionKeys.NormalConnections)
		const storedTopLiks = await localForage.getItem<string>(ConnectionKeys.TopConnections)
		const normalConnectionsArr = storedNormalLiks ? JSON.parse(storedNormalLiks) : []
		const topConnectionsArr = storedTopLiks ? JSON.parse(storedTopLiks) : []
		normalConnectionsArr.forEach(connection => {
			connection.connected = window.mainWindow.redis.isConnected(connection.id) ? 'connected' : 'disconnected'
		})
		topConnectionsArr.forEach(connection => {
			connection.connected = window.mainWindow.redis.isConnected(connection.id) ? 'connected' : 'disconnected'
		})
		normalConnections.value = normalConnectionsArr
		topConnections.value = topConnectionsArr
	}

	/**
	 * add connections
	 */
	async function addConnections(connection: Connection) {
		const clonedConnections = cloneDeep(normalConnections.value)
		clonedConnections.push(connection)
		const res = await localForage.setItem(ConnectionKeys.NormalConnections, JSON.stringify(clonedConnections))
		if (res) normalConnections.value = clonedConnections
	}

	/**
	 * remove connection
	 */
	async function removeConnection(id: string) {
		const clonedConnections = cloneDeep(normalConnections.value)
		const connectionIndex = clonedConnections.findIndex(connection => connection.id === id)
		clonedConnections.splice(connectionIndex, 1)
		const res = await localForage.setItem(ConnectionKeys.NormalConnections, JSON.stringify(clonedConnections))
		if (res) normalConnections.value = clonedConnections
	}

	/**
	 * update connection
	 */
	async function updateConnection(connection: Connection) {
		const clonedConnections = cloneDeep(connection.top ? topConnections.value : normalConnections.value)
		const connectionIndex = clonedConnections.findIndex(item => item.id === connection.id)
		clonedConnections.splice(connectionIndex, 1, connection)
		const res = await localForage.setItem(
			connection.top ? ConnectionKeys.TopConnections : ConnectionKeys.NormalConnections,
			JSON.stringify(clonedConnections)
		)
		if (res) {
			if (connection.top) topConnections.value = clonedConnections
			else normalConnections.value = clonedConnections
		}
	}

	/**
	 * placing connection on top
	 */
	async function topConnection(id: string) {
		const clonedTopConnections = cloneDeep(topConnections.value)
		const clonedNormalConnections = cloneDeep(normalConnections.value)
		const connectionIndex = clonedNormalConnections.findIndex(connection => connection.id === id)
		const connection = normalConnections.value[connectionIndex]
		connection.top = true
		clonedTopConnections.push(connection)
		const addTopConnectionRes = await localForage.setItem(
			ConnectionKeys.TopConnections,
			JSON.stringify(clonedTopConnections)
		)
		if (addTopConnectionRes) topConnections.value = clonedTopConnections
		clonedNormalConnections.splice(connectionIndex, 1)
		const removeNormalConnectionRes = await localForage.setItem(
			ConnectionKeys.NormalConnections,
			JSON.stringify(clonedNormalConnections)
		)
		if (removeNormalConnectionRes) normalConnections.value.splice(connectionIndex, 1)
	}

	/**
	 * cancel placing connection on top
	 */
	async function cancelTopConnection(id: string) {
		const clonedTopConnections = cloneDeep(topConnections.value)
		const clonedNormalConnections = cloneDeep(normalConnections.value)
		const connectionIndex = clonedTopConnections.findIndex(connection => connection.id === id)
		const connection = topConnections.value[connectionIndex]
		connection.top = false
		clonedNormalConnections.push(connection)
		const addNormalConnectionRes = await localForage.setItem(
			ConnectionKeys.NormalConnections,
			JSON.stringify(clonedNormalConnections)
		)
		if (addNormalConnectionRes) normalConnections.value = clonedNormalConnections
		clonedTopConnections.splice(connectionIndex, 1)
		const removeTopConnectionRes = await localForage.setItem(
			ConnectionKeys.TopConnections,
			JSON.stringify(clonedTopConnections)
		)
		if (removeTopConnectionRes) topConnections.value.splice(connectionIndex, 1)
	}

	/**
	 * connect connection
	 */
	async function connectConnection(id: string) {
		try {
			if (window.mainWindow.redis.isConnected(id)) return
			const connection = connections.value.find(connection => connection.id === id)
			const { host, port, username, password } = cloneDeep(connection)
			const url = `redis://${host}:${String(port)}`
			await window.mainWindow.redis.create({ id, url, username, password })
			await window.mainWindow.redis.connect(id)
		} catch (e) {
			window.mainWindow.redis.destory(id)
			throw e
		}
	}

	/**
	 * disconnect connection
	 */
	async function disconnectConnection(id: string) {
		await window.mainWindow.redis.disconnect(id)
		handleConnectionDisconnected(id)
	}

	/**
	 * handle redis ready event
	 */
	window.mainWindow.redis.onReady(id => {
		const connection = connections.value.find(connection => connection.id === id)
		connection.connected = 'connected'
	})

	/**
	 * handle redis end event
	 */
	function handleConnectionDisconnected(id: string) {
		const connection = connections.value.find(connection => connection.id === id)
		connection.connected = 'disconnected'
	}
	window.mainWindow.redis.onEnd(handleConnectionDisconnected)

	/**
	 * handle redis connect event
	 */
	function handleConnectionConnect(id: string) {
		const connection = connections.value.find(connection => connection.id === id)
		connection.connected = 'connecting'
	}
	window.mainWindow.redis.onConnect(handleConnectionConnect)
	window.mainWindow.redis.onReconnect(handleConnectionConnect)

	return {
		connections,
		syncConnections,
		addConnections,
		removeConnection,
		updateConnection,
		topConnection,
		cancelTopConnection,
		connectConnection,
		disconnectConnection,
	}
})

if (import.meta.hot) import.meta.hot.accept(acceptHMRUpdate(useConnectionsStore, import.meta.hot))
