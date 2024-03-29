import { createClient, type RedisClientType, type RedisClientOptions } from 'redis'

type CreateClientOptions = {
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
	private clients = new Map<string, RedisClientType<any, any, any>>()

	constructor() {}

	/** create redis client */
	async create(options: CreateClientOptions) {
		const { id, ignoreError, error, ready, end, connect, reconnect } = options
		if (this.clients.has(id)) {
			await this.clients.get(id).quit()
			this.destory(id)
		}
		options.socket = { reconnectStrategy: false }
		const client = createClient(options)
		if (!ignoreError) client.on('error', e => error(id, e))
		client.on('ready', () => ready(id))
		client.on('end', () => end(id))
		client.on('connect', () => connect(id))
		client.on('reconnecting', () => reconnect(id))
		this.clients.set(id, client)
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
		await client.connect()
	}

	/** disconnect from redis */
	async disconnect(id: string) {
		const client = this.getClient(id)
		await client.quit()
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

	/** Creates or modifies the value of a field in a hash */
	hset(id: string, key: string, field: string, value: string | number) {
		const client = this.getClient(id)
		return client.HSET(key, field, value)
	}

	/** Returns the value of a key */
	async get(id: string, key: string) {
		const client = this.getClient(id)
		return client.GET(key)
	}

	/** Returns all members of a set */
	smembers(id: string, key: string) {
		const client = this.getClient(id)
		return client.SMEMBERS(key)
	}

	/** Returns the value of a field in a hash */
	async hget(id: string, key: string) {
		const client = this.getClient(id)
		const res: Array<{ field: string; value: string }> = []
		for await (const field of client.hScanIterator(key)) {
			res.push(field)
		}
		return res
	}

	/** Deletes one or more keys */
	del(id: string, key: string | string[]) {
		const client = this.getClient(id)
		return client.DEL(key)
	}

	/** Deletes one or more fields and their values from a hash. Deletes the hash if no fields remain */
	hdel(id: string, key: string, field: string | string[]) {
		const client = this.getClient(id)
		return client.HDEL(key, field)
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

	/** Removes one or more members from a set. Deletes the set if the last member was removed */
	srem(id: string, key: string, member: string | string[]) {
		const client = this.getClient(id)
		return client.SREM(key, member)
	}

	/** Adds one or more members to a set. Creates the key if it doesn't exist */
	sadd(id: string, key: string, member: string | string[]) {
		const client = this.getClient(id)
		return client.SADD(key, member)
	}
}

export const redisUtil = new RedisUtil()
