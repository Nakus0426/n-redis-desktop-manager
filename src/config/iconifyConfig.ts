import { addCollection } from '@iconify/vue'
import fluent from '@iconify/json/json/fluent.json'
import twemoji from '@iconify/json/json/twemoji.json'

/** setup iconify */
export function setupIconify() {
	addCollection(fluent as any)
	addCollection(twemoji as any)
}
