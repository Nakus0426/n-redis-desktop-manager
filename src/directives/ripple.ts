import { CSSProperties, Directive } from 'vue'

const name = 'ripple'
const period = 200
const noneRippleBg = 'rgba(0, 0, 0, 0)'
const defaultRippleColor = 'rgba(0, 0, 0, 0.1)'

/**
 * 水波纹动画指令
 * @param value 水波纹颜色
 */
const directive: Directive = {
	mounted(el: HTMLElement, binding) {
		if (!el) return
		el.addEventListener('pointerdown', e => handleAddRipple(e, el, binding.value), false)
	},
	unmounted(el: HTMLElement, binding) {
		el.removeEventListener('pointerdown', e => handleAddRipple(e, el, binding.value), false)
	},
}

/** 为元素添加水波纹动画 */
function handleAddRipple(e: MouseEvent, el: HTMLElement, color: string) {
	const dom = el
	const rippleContainer = document.createElement('div')
	const rippleColor = color ?? getComputedStyle(el).getPropertyValue('--ripple-color') ?? defaultRippleColor
	if (e.button !== 0 || !el) return

	if (
		dom.classList.contains('is-active') ||
		dom.classList.contains('is-disabled') ||
		dom.classList.contains('is-checked') ||
		dom.classList.contains('is-loading')
	)
		return

	const elStyle = getComputedStyle(dom)
	const elBorder = parseInt(elStyle.borderWidth, 10)
	const border = elBorder > 0 ? elBorder : 0
	const width = dom.offsetWidth
	const height = dom.offsetHeight

	if (rippleContainer.parentNode === null) {
		setStyle(rippleContainer, {
			position: 'absolute',
			left: `${0 - border}px`,
			top: `${0 - border}px`,
			width: `${width}px`,
			height: `${height}px`,
			borderRadius: elStyle.borderRadius,
			pointerEvents: 'none',
			overflow: 'hidden',
		})
		dom.appendChild(rippleContainer)
	}

	// 新增ripple
	const ripple = document.createElement('div')
	setStyle(ripple, {
		marginTop: '0',
		marginLeft: '0',
		right: `${width}px`,
		width: `${width + 20}px`,
		height: '100%',
		transition: `transform ${period}ms cubic-bezier(.38, 0, .24, 1), background ${period * 2}ms linear`,
		transform: 'skewX(-8deg)',
		pointerEvents: 'none',
		position: 'absolute',
		zIndex: 0,
		backgroundColor: rippleColor,
		opacity: '0.9',
	})

	// 避免遮盖内部元素
	const elMap = new WeakMap()
	for (let n = dom.children.length, i = 0; i < n; ++i) {
		const child = dom.children[i]
		if ((child as HTMLElement).style.zIndex === '' && child !== rippleContainer) {
			;(child as HTMLElement).style.zIndex = '1'
			elMap.set(child, true)
		}
	}

	// fix position
	const initPosition = dom.style.position ? dom.style.position : getComputedStyle(dom).position
	if (initPosition === '' || initPosition === 'static') {
		dom.style.position = 'relative'
	}
	rippleContainer.insertBefore(ripple, rippleContainer.firstChild)

	setTimeout(() => {
		ripple.style.transform = `translateX(${width}px)`
	}, 0)

	// 清除动画元素
	function handleClearRipple() {
		ripple.style.backgroundColor = noneRippleBg
		if (!el) return
		el.removeEventListener('pointerup', handleClearRipple, false)
		el.removeEventListener('pointerleave', handleClearRipple, false)
		setTimeout(() => {
			ripple.remove()
			if (rippleContainer.children.length === 0) rippleContainer.remove()
		}, period * 2 + 100)
	}

	el.addEventListener('pointerup', handleClearRipple, false)
	el.addEventListener('pointerleave', handleClearRipple, false)
}

/**
 * 为元素设置style
 * @param el 需要设置style的元素
 * @param styles 设置的style
 */
function setStyle(el: HTMLElement, styles: CSSProperties) {
	const keys = Object.keys(styles)
	keys.forEach(key => {
		el.style[key] = styles[key]
	})
}

export default { name, directive }
