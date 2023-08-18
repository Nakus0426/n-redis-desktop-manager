import { createClient, type RedisClientType, type RedisClientOptions } from 'redis'

export type CreateClientOptions = {
	id: string
	error?: (error: any) => void
	ready?: (id: string) => void
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
		const client = createClient(options)
		client.on('error', error => options.error(error))
		client.on('ready', () => options.ready(options.id))
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

	/** is client connected */
	isConnected(id: string) {
		const client = this.clients.get(id)
		if (!client) return false
		return client.isOpen
	}

	/**
	 * redis SET command
	 * @param expire expire time in seconds
	 */
	set(id: string, key: string, value: string | number, expire?: number) {
		const client = this.clients.get(id)
		if (!client && !client.isReady) return
		return client.SET(key, value, { EX: expire, GET: true })
	}
}
