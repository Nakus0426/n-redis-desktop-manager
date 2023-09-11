import { type EventBusKey } from '@vueuse/core'
import { type Connection } from '@/store'

export const connectionConnectedEventKey: EventBusKey<Connection> = Symbol()

export const connectionDisconnectedEventKey: EventBusKey<Connection> = Symbol()

export const keyActivedEventKey: EventBusKey<string> = Symbol()
