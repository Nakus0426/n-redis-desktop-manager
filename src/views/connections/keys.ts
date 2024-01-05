import { type EventBusKey } from '@vueuse/core'

export const CONNECTIONS_UPDATE_EVENT_KEY = Symbol('connectionsUpdate') as EventBusKey<string>
