import { type EventBusKey } from '@vueuse/core'

import { type ConnectionInfo, type Connection } from '@/store'

export const connectionConnectedEventKey: EventBusKey<Connection> = Symbol()

export const connectionDisconnectedEventKey: EventBusKey<Connection> = Symbol()

export const keyActivedEventKey: EventBusKey<{ key: string; id: string }> = Symbol()

export const tabActivedEventKey: EventBusKey<string> = Symbol()

export const connectionInfoInjectKey = Symbol() as InjectionKey<Ref<ConnectionInfo>>

export const keyRemovedEventKey: EventBusKey<string> = Symbol()
