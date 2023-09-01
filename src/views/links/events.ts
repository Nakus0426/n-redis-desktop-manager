import { type EventBusKey } from '@vueuse/core'
import { type Link } from '@/store'

export const linkConnectedEventKey: EventBusKey<Link> = Symbol()

export const linkDisconnectedEventKey: EventBusKey<Link> = Symbol()

export const keyActivedEventKey: EventBusKey<string> = Symbol()
