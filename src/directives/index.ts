import { App } from 'vue'
import ripple from './ripple'

/**
 * setup directives
 */
export function setupDirective(app: App) {
	app.directive(ripple.name, ripple.directive)
}
