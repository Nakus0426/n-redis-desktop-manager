import { createClient, type RedisClientType, type RedisClientOptions } from 'redis'

export type CreateClientOptions = { id: string } & RedisClientOptions

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
			await this.clients.get(options.id).quit()
			this.clients.delete(options.id)
		}
		const client = createClient(options)
		client.on('error', error => {
			console.log('error', error)
		})
		this.clients.set(options.id, client)
	}

	/**
	 * connect to redis
	 */
	async connect(id: string) {
		const client = this.clients.get(id)
		if (!client) return
		return this.clients.get(id).connect()
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
