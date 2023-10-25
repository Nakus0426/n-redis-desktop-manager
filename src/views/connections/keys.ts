import { type EventBusKey } from '@vueuse/core'

import { type ConnectionInfo, type Connection } from '@/store'

export const connectionConnectedEventKey: EventBusKey<Connection> = Symbol()

export const connectionDisconnectedEventKey: EventBusKey<Connection> = Symbol()

export const activedKeyInjectKey = Symbol() as InjectionKey<Ref<{ key: string; id: string }>>

export const keyActivedEventKey: EventBusKey<{ key: string; id: string }> = Symbol()

export const connectionInfoInjectKey = Symbol() as InjectionKey<Ref<ConnectionInfo>>

export const keyRemovedEventKey: EventBusKey<string> = Symbol()

export const keySavedEventKey: EventBusKey<string> = Symbol()

export const keyUpdatedEventKey: EventBusKey<string> = Symbol()

export const keyRenamedEventKey: EventBusKey<string> = Symbol()

export const keyEditInjectKey = Symbol() as InjectionKey<
	Ref<{ id: string; key: string; type: string; memoryUsage: number }>
>
