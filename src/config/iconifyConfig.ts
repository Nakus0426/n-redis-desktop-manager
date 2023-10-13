import { addCollection } from '@iconify/vue'
import fluent from '@iconify/json/json/fluent.json'
import twemoji from '@iconify/json/json/twemoji.json'
import lineMd from '@iconify/json/json/line-md.json'
import custom from '@/assets/icons/custom.json'

/** setup iconify */
export function setupIconify() {
	addCollection(fluent as any)
	addCollection(twemoji as any)
	addCollection(lineMd as any)
	addCollection(custom as any)
}
