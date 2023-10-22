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
		if (!client) throw new Error('连接异常，请重新连接')
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
			return client.isReady
		} catch (e) {
			return false
		}
	}

	/** Returns the server's liveliness response */
	async ping(id: string) {
		const client = this.getClient(id)
		const pingResult = await client.PING('test')
		return pingResult === 'test'
	}

	/** Returns the effective values of configuration parameters */
	configGet(id: string, parameter: string) {
		const client = this.getClient(id)
		return client.CONFIG_GET(parameter)
	}

	/** Changes the selected database */
	select(id: string, db: number) {
		const client = this.getClient(id)
		return client.SELECT(db)
	}

	/** Returns information and statistics about the server */
	info(id: string, section?: string) {
		const client = this.getClient(id)
		return client.INFO(section)
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

	/** Sets the string value of a key, ignoring its type. The key is created if it doesn't exist */
	set(id: string, key: string, value: string | number, expire?: number) {
		const client = this.getClient(id)
		return client.SET(key, value, { EX: expire, GET: true })
	}

	/** Returns the string value of a key */
	get(id: string, key: string, type: KeyType = 'string') {
		const client = this.getClient(id)
		if (type === 'string') return client.GET(key)
		return client.GET(key)
	}

	/** Deletes one or more keys */
	del(id: string, key: string | string[]) {
		const client = this.getClient(id)
		return client.DEL(key)
	}

	/** Renames a key only when the target key name doesn't exist */
	rename(id: string, key: string, newKey: string) {
		const client = this.getClient(id)
		return client.RENAMENX(key, newKey)
	}

	/** Determines whether one or more keys exist */
	exists(id: string, key: string) {
		const client = this.getClient(id)
		return client.EXISTS(key)
	}

	/** Sets the expiration time of a key in seconds */
	expire(id: string, key: string, expire: number) {
		const client = this.getClient(id)
		return client.EXPIRE(key, expire)
	}

	/** Determines the type of value stored at a key */
	type(id: string, key: string) {
		const client = this.getClient(id)
		return client.TYPE(key)
	}

	/** Returns the expiration time in seconds of a key */
	ttl(id: string, key: string) {
		const client = this.getClient(id)
		return client.TTL(key)
	}

	/** Estimates the memory usage of a key */
	memoryUsage(id: string, key: string) {
		const client = this.getClient(id)
		return client.MEMORY_USAGE(key)
	}
}
