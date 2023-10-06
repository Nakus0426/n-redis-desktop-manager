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

export type KeyType = 'string' | 'list' | 'set' | 'zset' | 'hash' | 'stream' | string

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

	/** get client */
	private getClient(id: string) {
		const client = this.clients.get(id)
		if (!client || !client?.isReady) throw new Error('连接异常，请重新连接')
		return client
	}

	/** connect to redis */
	async connect(id: string) {
		const client = this.clients.get(id)
		if(!client) throw new Error('连接异常，请重新连接')
		await client.connect()
	}

	/** disconnect from redis */
	async disconnect(id: string) {
		const client = this.getClient(id)
		await client.disconnect()
		this.destory(id)
	}

	/** destory redis client */
	destory(id: string) {
		this.clients.delete(id)
	}

	/** is client connected */
	isConnected(id: string) {
		try {
			const client = this.getClient(id)
			return !!client
		} catch (e) {
			return false
		}
	}

	/** ping */
	async ping(id: string) {
		const client = this.getClient(id)
		const pingResult = await client.ping('test')
		return pingResult === 'test'
	}

	/** config get */
	configGet(id: string, parameter: string) {
		const client = this.getClient(id)
		return client.configGet(parameter)
	}

	/** select */
	select(id: string, db: number) {
		const client = this.getClient(id)
		return client.select(db)
	}

	/** info */
	info(id: string, section?: string) {
		const client = this.getClient(id)
		return client.info(section)
	}

	/** keys */
	async keys(id: string, pattern?: string) {
		const client = this.getClient(id)
		const keys: string[] = []
		for await (const key of client.scanIterator({ MATCH: pattern })) {
			keys.push(key)
		}
		return keys
	}

	/** set */
	set(id: string, key: string, value: string | number, expire?: number) {
		const client = this.getClient(id)
		return client.SET(key, value, { EX: expire, GET: true })
	}

	/** get */
	get(id: string, key: string, type: KeyType = 'string') {
		const client = this.getClient(id)
		if (type === 'string') return client.GET(key)
		return client.GET(key)
	}

	/** del */
	del(id: string, key: string | string[]) {
		const client = this.getClient(id)
		return client.DEL(key)
	}

	/** rename */
	rename(id: string, key: string, newKey: string) {
		const client = this.getClient(id)
		return client.RENAMENX(key, newKey)
	}

	/** exists */
	exists(id: string, key: string) {
		const client = this.getClient(id)
		return client.EXISTS(key)
	}

	/** expire */
	expire(id: string, key: string, expire: number) {
		const client = this.getClient(id)
		return client.EXPIRE(key, expire)
	}

	/** type */
	type(id: string, key: string) {
		const client = this.getClient(id)
		return client.TYPE(key)
	}

	/** ttl */
	ttl(id: string, key: string) {
		const client = this.getClient(id)
		return client.ttl(key)
	}
}
