import { addCollection } from '@iconify/vue'
import fluent from '@iconify/json/json/fluent.json'

/** setup iconify */
export function setupIconify() {
	addCollection(fluent as any)
}
