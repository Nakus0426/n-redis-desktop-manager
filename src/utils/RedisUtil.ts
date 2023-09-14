import { createClient, type RedisClientType, type RedisClientOptions } from 'redis'

export type CreateClientOptions = {
	id: string
	ignoreError?: boolean
	error?: (id: string, error: Error) => void
	ready?: (id: string) => void
	end?: (id: string) => void
	connect?: (id: string) => void
	reconnect?: (id: string) => void
} & RedisClientOptions

/** Redis Util */
export class RedisUtil {
	private clients: Map<string, RedisClientType<any, any, any>>

	constructor() {
		this.clients = new Map()
	}

	/** create redis client */
	async create(options: CreateClientOptions) {
		if (this.clients.has(options.id)) {
			await this.clients.get(options.id).disconnect()
			this.destory(options.id)
		}
		// options.socket = { reconnectStrategy: retries => (retries > 5 ? false : 5000) }
		options.socket = { reconnectStrategy: false }
		const client = createClient(options)
		if (!options.ignoreError) client.on('error', error => options.error(options.id, error))
		client.on('ready', () => options.ready(options.id))
		client.on('end', () => options.end(options.id))
		client.on('connect', () => options.connect(options.id))
		client.on('reconnecting', () => options.reconnect(options.id))
		this.clients.set(options.id, client)
	}

	/** connect to redis */
	connect(id: string) {
		const client = this.clients.get(id)
		if (!client) return
		return this.clients.get(id).connect()
	}

	/** disconnect from redis */
	async disconnect(id: string) {
		const client = this.clients.get(id)
		if (!client) return
		await this.clients.get(id).disconnect()
		this.destory(id)
	}

	/** destory redis client */
	destory(id: string) {
		this.clients.delete(id)
	}

	/** is client connected */
	isConnected(id: string) {
		const client = this.clients.get(id)
		if (!client) return false
		return client.isOpen
	}

	/** ping */
	async ping(id: string) {
		const client = this.clients.get(id)
		if (!client) return false
		return (await client.ping('test')) === 'test'
	}

	/** config get */
	configGet(id: string, parameter: string) {
		const client = this.clients.get(id)
		if (!client || !client?.isReady) return
		return client.configGet(parameter)
	}

	/** select */
	select(id: string, db: number) {
		const client = this.clients.get(id)
		if (!client || !client?.isReady) return
		return client.select(db)
	}

	/** info */
	info(id: string, section?: string) {
		const client = this.clients.get(id)
		if (!client || !client?.isReady) return
		return client.info(section)
	}

	/** keys */
	keys(id: string, pattern?: string) {
		const client = this.clients.get(id)
		if (!client || !client?.isReady) return
		return client.keys(pattern)
	}

	/** set */
	set(id: string, key: string, value: string | number, expire?: number) {
		const client = this.clients.get(id)
		if (!client || !client?.isReady) return
		return client.SET(key, value, { EX: expire, GET: true })
	}
}
