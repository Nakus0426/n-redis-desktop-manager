import { createClient, type RedisClientType, type RedisClientOptions } from 'redis'

export type CreateClientOptions = {
	id: string
	error?: (error: any) => void
	ready?: (id: string) => void
	end?: (id: string) => void
	connect?: (id: string) => void
	reconnect?: (id: string) => void
} & RedisClientOptions

/**
 * Redis Util
 */
export class RedisUtil {
	private clients: Map<string, RedisClientType<any, any, any>>

	constructor() {
		this.clients = new Map()
	}

	/**
	 * create redis client
	 */
	async create(options: CreateClientOptions) {
		if (this.clients.has(options.id)) {
			await this.clients.get(options.id).disconnect()
			this.clients.delete(options.id)
		}
		options.socket = { reconnectStrategy: retries => (retries > 20 ? false : 5000) }
		const client = createClient(options)
		client.on('error', error => options.error(error))
		client.on('ready', () => options.ready(options.id))
		client.on('end', () => options.end(options.id))
		client.on('connect', () => options.connect(options.id))
		client.on('reconnecting', () => options.reconnect(options.id))
		this.clients.set(options.id, client)
	}

	/**
	 * connect to redis
	 */
	connect(id: string) {
		const client = this.clients.get(id)
		if (!client) return
		return this.clients.get(id).connect()
	}

	/**
	 * disconnect from redis
	 */
	async disconnect(id: string) {
		const client = this.clients.get(id)
		if (!client) return
		await this.clients.get(id).disconnect()
		this.clients.delete(id)
	}

	/**
	 * is client connected
	 */
	isConnected(id: string) {
		const client = this.clients.get(id)
		if (!client) return false
		return client.isOpen
	}

	/**
	 * config get
	 */
	configGet(id: string, parameter: string) {
		const client = this.clients.get(id)
		if (!client && !client.isReady) return
		return client.configGet(parameter)
	}

	/**
	 * select
	 */
	select(id: string, db: number) {
		const client = this.clients.get(id)
		if (!client && !client.isReady) return
		return client.select(db)
	}

	/**
	 * keys
	 */
	keys(id: string, pattern?: string) {
		const client = this.clients.get(id)
		if (!client && !client.isReady) return
		return client.keys(pattern)
	}

	/**
	 * set
	 */
	set(id: string, key: string, value: string | number, expire?: number) {
		const client = this.clients.get(id)
		if (!client && !client.isReady) return
		return client.SET(key, value, { EX: expire, GET: true })
	}
}
